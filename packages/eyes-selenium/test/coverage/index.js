require('chromedriver')
const {Builder, By} = require('selenium-webdriver')
const {Options: ChromeOptions} = require('selenium-webdriver/chrome')
const {
  Eyes,
  BatchInfo,
  RectangleSize,
  Target,
  StitchMode,
  VisualGridRunner,
} = require('../../index')
const {makeRunTests} = require('@applitools/sdk-test-kit')

const sdkName = 'eyes-selenium'
const batch = new BatchInfo(`JS Coverage Tests - ${sdkName}`)

async function initialize({displayName, executionMode}) {
  let eyes
  let driver

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new ChromeOptions().headless())
    .build()
  eyes = executionMode.isVisualGrid ? new Eyes(new VisualGridRunner()) : new Eyes()
  executionMode.isCssStitching ? eyes.setStitchMode(StitchMode.CSS) : undefined
  executionMode.isScrollStitching ? eyes.setStitchMode(StitchMode.SCROLL) : undefined
  eyes.setBatch(batch)

  async function visit(url) {
    await driver.get(url)
  }

  async function open(options) {
    driver = await eyes.open(
      driver,
      sdkName,
      displayName,
      RectangleSize.parse(options.viewportSize),
    )
  }

  async function checkFrame({isClassicApi = false, locator, tag, matchTimeout} = {}) {
    if (isClassicApi) {
      await eyes.checkFrame(By.css(locator), matchTimeout, tag)
    } else {
      await eyes.check(tag, Target.frame(By.css(locator)).fully())
    }
  }

  async function checkRegion({isClassicApi = false, locator, tag, matchTimeout} = {}) {
    if (isClassicApi) {
      await eyes.checkElementBy(By.css(locator), matchTimeout, tag)
    } else {
      await eyes.check(tag, Target.region(By.css(locator)).fully())
    }
  }

  async function checkWindow({isClassicApi = false, isFully = false, tag, matchTimeout} = {}) {
    if (isClassicApi) {
      await eyes.checkWindow(tag, matchTimeout, isFully)
    } else {
      isFully
        ? await eyes.check(undefined, Target.window().fully())
        : await eyes.check(undefined, Target.window())
    }
  }

  async function close(options) {
    await eyes.close(options)
  }

  async function cleanup() {
    await driver.close()
    await eyes.abortIfNotClosed()
  }

  return {visit, open, checkFrame, checkRegion, checkWindow, close, cleanup}
}

const supportedTests = [
  {name: 'checkFrameClassic', executionMode: {isVisualGrid: true}},
  {name: 'checkFrameClassic', executionMode: {isCssStitching: true}},
  {name: 'checkFrameClassic', executionMode: {isScrollStitching: true}},
  {name: 'checkRegionClassic', executionMode: {isVisualGrid: true}},
  {name: 'checkRegionClassic', executionMode: {isCssStitching: true}},
  {name: 'checkRegionClassic', executionMode: {isScrollStitching: true}},
  {name: 'checkRegionClassicWithOverFlow', executionMode: {isVisualGrid: true}},
  {name: 'checkRegionClassicWithOverFlow', executionMode: {isCssStitching: true}},
  {name: 'checkRegionClassicWithOverFlow', executionMode: {isScrollStitching: true}},
  {name: 'checkWindowClassicViewport', executionMode: {isVisualGrid: true}},
  {name: 'checkWindowClassicViewport', executionMode: {isCssStitching: true}},
  {name: 'checkWindowClassicViewport', executionMode: {isScrollStitching: true}},
  {name: 'checkWindowClassicFully', executionMode: {isVisualGrid: true}},
  {name: 'checkWindowClassicFully', executionMode: {isCssStitching: true}},
  {name: 'checkWindowClassicFully', executionMode: {isScrollStitching: true}},
  {name: 'checkFrameFluent', executionMode: {isVisualGrid: true}},
  {name: 'checkFrameFluent', executionMode: {isCssStitching: true}},
  {name: 'checkFrameFluent', executionMode: {isScrollStitching: true}},
  {name: 'checkRegionFluent', executionMode: {isVisualGrid: true}},
  {name: 'checkRegionFluent', executionMode: {isCssStitching: true}},
  {name: 'checkRegionFluent', executionMode: {isScrollStitching: true}},
  {name: 'checkRegionFluentWithOverFlow', executionMode: {isVisualGrid: true}},
  {name: 'checkRegionFluentWithOverFlow', executionMode: {isCssStitching: true}},
  {name: 'checkRegionFluentWithOverFlow', executionMode: {isScrollStitching: true}},
  {name: 'checkWindowFluentViewport', executionMode: {isVisualGrid: true}},
  {name: 'checkWindowFluentViewport', executionMode: {isCssStitching: true}},
  {name: 'checkWindowFluentViewport', executionMode: {isScrollStitching: true}},
  {name: 'checkWindowFluentFully', executionMode: {isVisualGrid: true}},
  {name: 'checkWindowFluentFully', executionMode: {isCssStitching: true}},
  {name: 'checkWindowFluentFully', executionMode: {isScrollStitching: true}},
]

makeRunTests(sdkName, initialize).runTests(supportedTests)
