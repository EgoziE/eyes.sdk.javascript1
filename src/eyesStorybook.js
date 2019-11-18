'use strict';
const puppeteer = require('puppeteer');
const getStories = require('../dist/getStories');
const {makeVisualGridClient} = require('@applitools/visual-grid-client');
const {getProcessPageAndSerialize} = require('@applitools/dom-snapshot');
const {presult} = require('@applitools/functional-commons');
const chalk = require('chalk');
const makeRenderStory = require('./renderStory');
const makeRenderStories = require('./renderStories');
const makeGetStoryData = require('./getStoryData');
const ora = require('ora');
const flatten = require('lodash.flatten');
const filterStories = require('./filterStories');
const addVariationStories = require('./addVariationStories');
const browserLog = require('./browserLog');
const memoryLog = require('./memoryLog');
const getIframeUrl = require('./getIframeUrl');
const createPagePool = require('./pagePool');
const getClientAPI = require('../dist/getClientAPI');

const CONCURRENT_PAGES = 3;

async function eyesStorybook({
  config,
  logger,
  performance,
  timeItAsync,
  outputStream = process.stderr,
}) {
  let memoryTimeout;
  takeMemLoop();
  logger.log('eyesStorybook started');
  const {storybookUrl, waitBeforeScreenshot, readStoriesTimeout} = config;
  const browser = await puppeteer.launch(config.puppeteerOptions);
  logger.log('browser launched');
  const page = await browser.newPage();
  const userAgent = await page.evaluate('navigator.userAgent');
  const {testWindow, closeBatch, globalState} = makeVisualGridClient({
    userAgent,
    ...config,
    logger: logger.extend('vgc'),
  });

  const pagePool = createPagePool({logger, initPage});

  const processPageAndSerialize = `(${await getProcessPageAndSerialize()})(document, {useSessionCache: true, showLogs: ${
    config.showLogs
  }, dontFetchResources: ${config.disableBrowserFetching}})`;
  logger.log('got script for processPage');
  browserLog({
    page,
    onLog: text => {
      logger.log(`master tab: ${text}`);
    },
  });

  let iframeUrl;
  try {
    iframeUrl = getIframeUrl(storybookUrl);
  } catch (ex) {
    logger.log(ex);
    throw new Error(`Storybook URL is not valid: ${storybookUrl}`);
  }

  try {
    const [stories] = await Promise.all(
      [getStoriesWithSpinner()].concat(
        new Array(CONCURRENT_PAGES).fill().map(async () => {
          const {pageId} = await pagePool.createPage();
          pagePool.addToPool(pageId);
        }),
      ),
    );

    const filteredStories = filterStories({stories, config});

    const storiesIncludingVariations = addVariationStories({stories: filteredStories, config});

    logger.log(`starting to run ${storiesIncludingVariations.length} stories`);

    const getStoryData = makeGetStoryData({logger, processPageAndSerialize, waitBeforeScreenshot});
    const renderStory = makeRenderStory({
      logger: logger.extend('renderStory'),
      testWindow,
      performance,
      timeItAsync,
    });

    const renderStories = makeRenderStories({
      getStoryData,
      renderStory,
      storybookUrl,
      logger,
      stream: outputStream,
      waitForQueuedRenders: globalState.waitForQueuedRenders,
      storyDataGap: config.storyDataGap,
      pagePool,
      getClientAPI,
    });

    logger.log('finished creating functions');

    const [error, results] = await presult(
      timeItAsync('renderStories', () => renderStories(storiesIncludingVariations)),
    );

    const [closeBatchErr] = await presult(closeBatch());
    if (closeBatchErr) {
      logger.log('failed to close batch', closeBatchErr);
    }

    if (error) {
      const msg = refineErrorMessage({prefix: 'Error in renderStories:', error});
      logger.log(error);
      throw new Error(msg);
    } else {
      return flatten(results);
    }
  } finally {
    logger.log('total time: ', performance['renderStories']);
    logger.log('perf results', performance);
    await browser.close();
    clearTimeout(memoryTimeout);
  }

  async function initPage(pageId) {
    logger.log('initializing puppeteer page number ', pageId);
    const page = await browser.newPage();
    if (config.showLogs) {
      browserLog({
        page,
        onLog: text => {
          if (text.match(/\[dom-snapshot\]/)) {
            logger.log(`tab ${pageId}: ${text}`);
          }
        },
      });
    }
    page.on('error', async err => {
      logger.log(`Puppeteer error for page ${pageId}:`, err);
      pagePool.removePage(pageId);
      const {pageId} = await pagePool.createPage();
      pagePool.addToPool(pageId);
    });
    page.on('close', async () => {
      if (pagePool.isInPool(pageId)) {
        logger.log(
          `Puppeteer page closed [page ${pageId}] while still in page pool, creating a new one instead`,
        );
        pagePool.removePage(pageId);
        const {pageId} = await pagePool.createPage();
        pagePool.addToPool(pageId);
      }
    });
    const [err] = await presult(page.goto(iframeUrl, {timeout: readStoriesTimeout}));
    if (err) {
      logger.log(`error navigating to iframe.html`, err);
      if (pagePool.isInPool(pageId)) {
        throw err;
      }
    }
    return page;
  }

  function takeMemLoop() {
    logger.log(memoryLog(process.memoryUsage()));
    memoryTimeout = setTimeout(takeMemLoop, 30000);
  }

  async function getStoriesWithSpinner() {
    let hasConsoleErr;
    page.on('console', msg => {
      hasConsoleErr =
        msg.args()[0] &&
        msg.args()[0]._remoteObject &&
        msg.args()[0]._remoteObject.subtype === 'error';
    });

    logger.log('Getting stories from storybook');
    const spinner = ora({text: 'Reading stories', stream: outputStream});
    spinner.start();
    logger.log('navigating to storybook url:', storybookUrl);
    const [navigateErr] = await presult(page.goto(storybookUrl, {timeout: readStoriesTimeout}));
    if (navigateErr) {
      logger.log('Error when loading storybook', navigateErr);
      const failMsg = refineErrorMessage({
        prefix: 'Error when loading storybook.',
        error: navigateErr,
      });
      spinner.fail(failMsg);
      throw new Error();
    }
    const [getStoriesErr, stories] = await presult(
      page.evaluate(getStories, {timeout: readStoriesTimeout}),
    );
    if (getStoriesErr) {
      logger.log('Error in getStories:', getStoriesErr);
      const failMsg = refineErrorMessage({
        prefix: 'Error when reading stories:',
        error: getStoriesErr,
      });
      spinner.fail(failMsg);
      throw new Error();
    }

    if (!stories.length && hasConsoleErr) {
      return [
        new Error(
          'Could not load stories, make sure your storybook renders correctly. Perhaps no stories were rendered?',
        ),
      ];
    }

    const badParamsError = stories
      .map(s => s.error)
      .filter(Boolean)
      .join('\n');
    if (badParamsError) {
      console.log(chalk.red(`\n${badParamsError}`));
    }

    spinner.succeed();
    logger.log(`got ${stories.length} stories:`, JSON.stringify(stories));
    return stories;
  }

  function refineErrorMessage({prefix, error}) {
    return `${prefix} ${error.message.replace('Evaluation failed: ', '')}`;
  }
}

module.exports = eyesStorybook;
