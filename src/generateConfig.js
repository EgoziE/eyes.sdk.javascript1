'use strict';
const chalk = require('chalk');
const pick = require('lodash.pick');
const {ConfigUtils} = require('@applitools/eyes-sdk-core');
const {resolve} = require('path');

function generateConfig({argv = {}, defaultConfig = {}, externalConfigParams = []}) {
  const configPath = argv.conf ? resolve(process.cwd(), argv.conf) : undefined;
  const defaultConfigParams = Object.keys(defaultConfig);
  const configParams = uniq(defaultConfigParams.concat(externalConfigParams));
  const config = ConfigUtils.getConfig({configPath, configParams});
  const argvConfig = pick(argv, configParams);
  const result = Object.assign({}, defaultConfig, config, argvConfig);

  // backward compatibility
  if (
    result.waitBeforeScreenshots !== defaultConfig.waitBeforeScreenshots &&
    result.waitBeforeScreenshot === defaultConfig.waitBeforeScreenshot
  ) {
    const msg = chalk.yellow(
      "Warning: 'waitBeforeScreenshots' is deprectaed. Please use 'waitBeforeScreenshot' (no 's').\n",
    );
    console.log(msg);
    result.waitBeforeScreenshot = result.waitBeforeScreenshots;
  }

  if (
    typeof result.waitBeforeScreenshot === 'string' &&
    !isNaN(parseInt(result.waitBeforeScreenshot))
  ) {
    result.waitBeforeScreenshot = Number(result.waitBeforeScreenshot);
  }

  if (result.showLogs === '1') {
    result.showLogs = true;
  }

  if (
    result.storyDataGap === undefined &&
    result.concurrency !== undefined &&
    result.renderConcurrencyFactor !== undefined
  ) {
    result.storyDataGap = result.concurrency * result.renderConcurrencyFactor;
  }
  return result;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

module.exports = generateConfig;
