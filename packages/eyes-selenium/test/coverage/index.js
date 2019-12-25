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

const sdkName = 'eyes-selenium'
const batch = new BatchInfo(`JS Coverage Tests - ${sdkName}`)

async function initialize({baselineTestName, branchName, executionMode, host}) {
  let eyes
  let driver

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new ChromeOptions().headless())
    .usingServer(host)
    .build()
  eyes = executionMode.isVisualGrid ? new Eyes(new VisualGridRunner()) : new Eyes()
  executionMode.isCssStitching ? eyes.setStitchMode(StitchMode.CSS) : undefined
  executionMode.isScrollStitching ? eyes.setStitchMode(StitchMode.SCROLL) : undefined
  eyes.setBranchName(branchName)
  eyes.setBatch(batch)

  async function visit(url) {
    await driver.get(url)
  }

  async function open(options) {
    driver = await eyes.open(
      driver,
      options.appName,
      baselineTestName,
      RectangleSize.parse(options.viewportSize),
    )
  }

  async function checkFrame({
    isClassicApi = false,
    isFully = false,
    locator,
    tag,
    matchTimeout,
  } = {}) {
    if (isClassicApi) {
      const element = await driver.findElement(By.css(locator))
      await eyes.checkFrame(element, matchTimeout, tag)
    } else {
      isFully
        ? await eyes.check(tag, Target.frame(By.css(locator)).fully())
        : await eyes.check(tag, Target.frame(By.css(locator)))
    }
  }

  async function checkRegion({
    isClassicApi = false,
    isFully = false,
    locator,
    tag,
    matchTimeout,
  } = {}) {
    if (isClassicApi) {
      const element = await driver.findElement(By.css(locator))
      await eyes.checkElement(element, matchTimeout, tag)
    } else {
      isFully
        ? await eyes.check(tag, Target.region(By.css(locator)).fully())
        : await eyes.check(tag, Target.region(By.css(locator)))
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
  {name: 'TestCheckFrame', executionMode: {isVisualGrid: true}},
  {name: 'TestCheckFrame', executionMode: {isCssStitching: true}},
  {name: 'TestCheckFrame', executionMode: {isScrollStitching: true}},
  {name: 'TestCheckRegion', executionMode: {isVisualGrid: true}},
  {name: 'TestCheckRegion', executionMode: {isCssStitching: true}},
  {name: 'TestCheckRegion', executionMode: {isScrollStitching: true}},
  {name: 'TestCheckRegion2', executionMode: {isVisualGrid: true}},
  {name: 'TestCheckRegion2', executionMode: {isCssStitching: true}},
  {name: 'TestCheckRegion2', executionMode: {isScrollStitching: true}},
  {name: 'TestCheckWindow', executionMode: {isVisualGrid: true}},
  {name: 'TestCheckWindow', executionMode: {isCssStitching: true}},
  {name: 'TestCheckWindow', executionMode: {isScrollStitching: true}},
  {name: 'TestCheckWindowFully', executionMode: {isVisualGrid: true}},
  {name: 'TestCheckWindowFully', executionMode: {isCssStitching: true}},
  {name: 'TestCheckWindowFully', executionMode: {isScrollStitching: true}},
  {name: 'TestCheckFrame_Fluent', executionMode: {isVisualGrid: true}},
  {name: 'TestCheckFrame_Fluent', executionMode: {isCssStitching: true}},
  {name: 'TestCheckFrame_Fluent', executionMode: {isScrollStitching: true}},
  {name: 'TestCheckWindow_Fluent', executionMode: {isVisualGrid: true}},
  {name: 'TestCheckWindow_Fluent', executionMode: {isCssStitching: true}},
  {name: 'TestCheckWindow_Fluent', executionMode: {isScrollStitching: true}},
]

module.exports = {
  name: sdkName,
  initialize,
  supportedTests,
}
