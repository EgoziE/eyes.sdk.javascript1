'use strict'

const assert = require('assert')
const chromedriver = require('chromedriver')
const {remote} = require('webdriverio')
const {Eyes, ConsoleLogHandler, Target, By} = require('../../index')

let browser, eyes, driver

describe('TestRefreshableDom', function() {
  before(async () => {
    await chromedriver.start([], true)

    eyes = new Eyes()
    eyes.setLogHandler(new ConsoleLogHandler(false))
  })

  beforeEach(async function() {
    const chrome = {
      port: 9515,
      path: '/',
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          args: ['headless', 'disable-infobars'],
        },
      },
    }
    browser = remote(chrome)
    await browser.init()
    driver = await eyes.open(browser, 'AppName', this.currentTest.fullTitle(), {
      width: 600,
      height: 500,
    })
  })

  afterEach(async () => {
    await browser.end()
    await eyes.abort()
  })

  after(async () => {
    chromedriver.stop()
  })

  it('refresh element inside iframe after StaleElementReference', async () => {
    await driver.url('https://applitools.github.io/demo/TestPages/RefreshDomPage/iframe')
    const switchTo = driver.switchTo()
    await switchTo.defaultContent()
    await switchTo.frame('frame')
    const region = await driver.findElement(By.css('#inner-img'))
    const button = await driver.findElement(By.css('#refresh-button'))
    await button.click()
    await switchTo.defaultContent()

    await eyes.check('Handle', Target.frame('frame').region(region))
    return eyes.close()
  })

  it('refresh element after StaleElementReference', async () => {
    await driver.url('https://applitools.github.io/demo/TestPages/RefreshDomPage')
    const region = await driver.findElement(By.css('#inner-img'))
    const button = await driver.findElement(By.css('#refresh-button'))
    await button.click()

    await eyes.check('Handle', Target.region(region))
    return eyes.close()
  })

  it('throw after unhandled StaleElementReference', async () => {
    await driver.url('https://applitools.github.io/demo/TestPages/RefreshDomPage')

    const region = await driver.findElement(By.css('#inner-img'))
    const button = await driver.findElement(By.css('#invalidate-button'))
    await button.click()
    try {
      await eyes.check('Throw', Target.region(region))
      assert.fail()
    } catch (err) {
      assert.strictEqual(err.seleniumStack && err.seleniumStack.type, 'StaleElementReference')
    } finally {
      return eyes.close(false)
    }
  })
})