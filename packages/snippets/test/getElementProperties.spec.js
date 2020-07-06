const playwright = require('playwright')
const {remote} = require('webdriverio')
const assert = require('assert')
const {getElementProperties} = require('../dist/index')

describe('getElementProperties', () => {
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('chrome', () => {
    let browser, page

    before(async () => {
      browser = await playwright.chromium.launch()
      const context = await browser.newContext()
      page = await context.newPage()
    })

    after(async () => {
      await browser.close()
    })

    it('return element properties', async () => {
      await page.goto(url)
      const element = await page.$('#static')
      const [tagName] = await page.evaluate(getElementProperties, {
        element,
        properties: ['tagName'],
      })
      assert.deepStrictEqual(tagName, 'DIV')
    })
  })

  describe('ie', () => {
    let driver

    before(async () => {
      driver = await remote({
        protocol: 'https',
        hostname: 'ondemand.saucelabs.com',
        path: '/wd/hub',
        port: 443,
        logLevel: 'silent',
        capabilities: {
          browserName: 'internet explorer',
          browserVersion: '11.285',
          platformName: 'Windows 10',
          'sauce:options': {
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY,
          },
        },
      })
    })

    after(async () => {
      await driver.deleteSession()
    })

    it('return element properties', async () => {
      await driver.url(url)
      const element = await driver.$('#static')
      const [tagName] = await driver.execute(getElementProperties, {
        element,
        properties: ['tagName'],
      })
      assert.deepStrictEqual(tagName, 'DIV')
    })
  })
})
