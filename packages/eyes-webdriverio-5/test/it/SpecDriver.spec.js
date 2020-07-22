const assert = require('assert')
const {TestSetup} = require('@applitools/sdk-coverage-tests/coverage-tests')
const spec = require('../../src/SpecDriver')
const {By} = require('../../index')

describe('SpecDriver', async () => {
  let browser
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('headless desktop (@webdriver)', async () => {
    before(async () => {
      browser = await spec.build(TestSetup.Env({browser: 'chrome'}))
      await browser.url(url)
    })

    after(async () => {
      await spec.cleanup(browser)
    })

    it('isDriver(driver)', isDriver({expected: true}))
    it('isDriver(wrong)', isDriver({input: {}, expected: false}))
    it(
      'isElement(element)',
      isElement({input: () => browser.findElement('css selector', 'div'), expected: true}),
    )
    it('isElement(extended-element)', isElement({input: () => browser.$('div'), expected: true}))
    it('isElement(wrong)', isElement({input: () => ({}), expected: false}))
    it('isSelector(string)', isSelector({input: 'div', expected: true}))
    it('isSelector(function)', isSelector({input: () => {}, expected: true}))
    it('isSelector(by)', isSelector({input: By.xpath('//div'), expected: true}))
    it('isSelector(wrong)', isSelector({input: {}, expected: false}))
    it(
      'transformElement(element)',
      transformElement({input: () => browser.findElement('css selector', 'div')}),
    )
    it('transformElement(extended-element)', transformElement({input: () => browser.$('div')}))
    it(
      'isEqualElements(element, element)',
      isEqualElements({
        input: () => browser.$('div').then(element => ({element1: element, element2: element})),
        expected: true,
      }),
    )
    it(
      'isEqualElements(element1, element2)',
      isEqualElements({
        input: async () => ({element1: await browser.$('div'), element2: await browser.$('h1')}),
        expected: false,
      }),
    )
    it(
      'extractSelector(element)',
      extractSelector({
        input: () => browser.findElement('css selector', 'div'),
        expected: undefined,
      }),
    )
    it(
      'extractSelector(extended-element)',
      extractSelector({input: () => browser.$('div'), expected: 'div'}),
    )
    it('toFrameworkSelector(eyes-selector)', toFrameworkSelector())
    it('toEyesSelector(selector)', toEyesSelector())
    it('executeScript(strings, ...args)', executeScript())
    it('findElement(string)', findElement({input: '#overflowing-div'}))
    it('findElements(string)', findElements({input: 'div'}))
    it(
      'findElement(function)',
      findElement({
        input: function() {
          return this.document.getElementById('overflowing-div')
        },
      }),
    )
    it(
      'findElements(function)',
      findElements({
        input: function() {
          return this.document.querySelectorAll('div')
        },
      }),
    )
    it('findElement(non-existent)', findElement({input: 'non-existent', expected: null}))
    it('findElements(non-existent)', findElements({input: 'non-existent', expected: []}))
    it('mainContext()', mainContext())
    it('parentContext()', parentContext())
    it('childContext(element)', childContext())
    it('getSessionId()', getSessionId())
    it('getTitle()', getTitle())
    it('getUrl()', getUrl())
    it('visit()', visit())
    it('isMobile()', isMobile({expected: false}))
  })

  describe('onscreen desktop (@webdriver)', async () => {
    before(async () => {
      browser = await spec.build(TestSetup.Env({browser: 'chrome', headless: false}))
    })

    after(async () => {
      await spec.cleanup(browser)
    })

    it('getWindowRect()', getWindowRect())
    it(
      'setWindowRect({x, y, width, height})',
      setWindowRect({
        input: {x: 0, y: 0, width: 510, height: 511},
        expected: {x: 0, y: 0, width: 510, height: 511},
      }),
    )
    it(
      'setWindowRect({x, y})',
      setWindowRect({
        input: {x: 11, y: 12},
        expected: {x: 11, y: 12, width: 510, height: 511},
      }),
    )
    it(
      'setWindowRect({width, height})',
      setWindowRect({
        input: {width: 551, height: 552},
        expected: {x: 11, y: 12, width: 551, height: 552},
      }),
    )
  })

  describe('headless desktop (@puppeteer)', async () => {
    before(async () => {
      browser = await spec.build(TestSetup.Env({browser: 'chrome', protocol: 'cdp'}))
      await browser.url(url)
    })

    after(async () => {
      await spec.cleanup(browser)
    })

    it('isDriver(driver)', isDriver({expected: true}))
    it('isDriver(wrong)', isDriver({input: {}, expected: false}))
    it(
      'isElement(element)',
      isElement({input: () => browser.findElement('css selector', 'div'), expected: true}),
    )
    it('isElement(extended-element)', isElement({input: () => browser.$('div'), expected: true}))
    it('isElement(wrong)', isElement({input: () => ({}), expected: false}))
    it('isSelector(string)', isSelector({input: 'div', expected: true}))
    it('isSelector(function)', isSelector({input: () => {}, expected: true}))
    it('isSelector(by)', isSelector({input: By.xpath('//div'), expected: true}))
    it('isSelector(wrong)', isSelector({input: {}, expected: false}))
    it(
      'transformElement(element)',
      transformElement({input: () => browser.findElement('css selector', 'div')}),
    )
    it('transformElement(extended-element)', transformElement({input: () => browser.$('div')}))
    it(
      'extractSelector(element)',
      extractSelector({
        input: () => browser.findElement('css selector', 'div'),
        expected: undefined,
      }),
    )
    it(
      'extractSelector(extended-element)',
      extractSelector({input: () => browser.$('div'), expected: 'div'}),
    )
    it('toFrameworkSelector(eyes-selector)', toFrameworkSelector())
    it('toEyesSelector(selector)', toEyesSelector())
    it('executeScript(strings, ...args)', executeScript())
    it('mainContext()', mainContext())
    it('parentContext()', parentContext())
    it('childContext(element)', childContext())
    it('findElement(string)', findElement({input: '#overflowing-div'}))
    it('findElements(string)', findElements({input: 'div'}))
    it(
      'findElement(function)',
      findElement({
        input: function() {
          return this.document.getElementById('overflowing-div')
        },
      }),
    )
    it(
      'findElements(function)',
      findElements({
        input: function() {
          return this.document.querySelectorAll('div')
        },
      }),
    )
    it('findElement(non-existent)', findElement({input: 'non-existent', expected: null}))
    it('findElements(non-existent)', findElements({input: 'non-existent', expected: []}))
    it('getSessionId()', getSessionId())
    it('getTitle()', getTitle())
    it('getUrl()', getUrl())
    it('visit()', visit())
    it('isMobile()', isMobile({expected: false}))
  })

  describe('onscreen desktop (@puppeteer)', async () => {
    before(async () => {
      browser = await spec.build(
        TestSetup.Env({browser: 'chrome', protocol: 'cdp', headless: false}),
      )
    })

    after(async () => {
      await spec.cleanup(browser)
    })

    it('getWindowRect()', getWindowRect())
    it(
      'setWindowRect({x, y, width, height})',
      setWindowRect({
        input: {x: 0, y: 0, width: 301, height: 302},
        expected: {x: 0, y: 0, width: 301, height: 302},
      }),
    )
    it(
      'setWindowRect({width, height})',
      setWindowRect({
        input: {width: 551, height: 552},
        expected: {x: null, y: null, width: 551, height: 552},
      }),
    )
  })

  describe('legacy browser (@webdriver)', async () => {
    before(async () => {
      browser = await spec.build(TestSetup.Env({browser: 'ie11', remote: 'sauce', legacy: true}))
    })

    after(async () => {
      await spec.cleanup(browser)
    })

    it('getWindowRect()', getWindowRect({legacy: true}))
    it(
      'setWindowRect({x, y, width, height})',
      setWindowRect({
        legacy: true,
        input: {x: 0, y: 0, width: 510, height: 511},
        expected: {x: 0, y: 0, width: 510, height: 511},
      }),
    )
    it(
      'setWindowRect({x, y})',
      setWindowRect({
        legacy: true,
        input: {x: 11, y: 12},
        expected: {x: 11, y: 12, width: 510, height: 511},
      }),
    )
    it(
      'setWindowRect({width, height})',
      setWindowRect({
        legacy: true,
        input: {width: 551, height: 552},
        expected: {x: 11, y: 12, width: 551, height: 552},
      }),
    )
  })

  describe('mobile browser (@appium)', async () => {
    before(async () => {
      browser = await spec.build(
        TestSetup.Env({browser: 'chrome', device: 'Pixel 3a XL', remote: 'sauce', legacy: true}),
      )
    })

    after(async () => {
      await spec.cleanup(browser)
    })

    it('isMobile()', isMobile({expected: true}))
    it('isAndroid()', isAndroid({expected: true}))
    it('isIOS()', isIOS({expected: false}))
    it('isNative()', isNative({expected: false}))
    it('getOrientation()', getOrientation({expected: 'portrait'}))
    it('getPlatformVersion()', getPlatformVersion({expected: '10'}))
  })

  describe('native app (@appium @native)', async () => {
    before(async () => {
      browser = await spec.build(
        TestSetup.Env({
          app: 'http://saucelabs.com/example_files/ContactManager.apk',
          device: 'Android Emulator',
          remote: 'sauce',
          legacy: true,
        }),
      )
    })

    after(async () => {
      await spec.cleanup(browser)
    })

    it('isMobile()', isMobile({expected: true}))
    it('isAndroid()', isAndroid({expected: true}))
    it('isIOS()', isIOS({expected: false}))
    it('isNative()', isNative({expected: true}))
    it('getOrientation()', getOrientation({expected: 'landscape'}))
    it('getPlatformVersion()', getPlatformVersion({expected: '6.0'}))
  })

  function isDriver({input, expected}) {
    return async () => {
      const isDriver = await spec.isDriver(input || browser)
      assert.strictEqual(isDriver, expected)
    }
  }
  function isElement({input, expected}) {
    return async () => {
      const element = await input()
      const isElement = await spec.isElement(element)
      assert.strictEqual(isElement, expected)
    }
  }
  function isSelector({input, expected}) {
    return async () => {
      const isSelector = await spec.isSelector(input)
      assert.strictEqual(isSelector, expected)
    }
  }
  function isEqualElements({input, expected}) {
    return async () => {
      const {element1, element2} = await input()
      const result = await spec.isEqualElements(browser, element1, element2)
      assert.deepStrictEqual(result, expected)
    }
  }
  function transformElement({input}) {
    return async () => {
      const element = await input()
      const elementId =
        element.elementId || element['element-6066-11e4-a52e-4f735466cecf'] || element.ELEMENT
      const result = spec.transformElement(element)
      assert.deepStrictEqual(result, {
        ELEMENT: elementId,
        'element-6066-11e4-a52e-4f735466cecf': elementId,
      })
    }
  }
  function extractSelector({input, expected}) {
    return async () => {
      const selector = spec.extractSelector(await input())
      assert.deepStrictEqual(selector, expected)
    }
  }
  function toFrameworkSelector() {
    return async () => {
      const xpathEyesSelector = {type: 'xpath', selector: '/html[1]/body[1]/div[1]'}
      const xpathResult = spec.toFrameworkSelector(xpathEyesSelector)
      assert.deepStrictEqual(xpathResult, `xpath:${xpathEyesSelector.selector}`)

      const cssEyesSelector = {type: 'css', selector: 'html > body > div'}
      const cssResult = spec.toFrameworkSelector(cssEyesSelector)
      assert.deepStrictEqual(cssResult, `css selector:${cssEyesSelector.selector}`)

      const wrongEyesSelector = {type: 'wrong type', selector: 'wrong selector'}
      const wrongResult = spec.toFrameworkSelector(wrongEyesSelector)
      assert.deepStrictEqual(wrongResult, wrongEyesSelector)
    }
  }
  function toEyesSelector() {
    return async () => {
      const xpathSelector = 'xpath:/html[1]/body[1]/div[1]'
      const xpathResult = spec.toEyesSelector(xpathSelector)
      assert.deepStrictEqual(xpathResult, {type: 'xpath', selector: '/html[1]/body[1]/div[1]'})

      const cssSelector = 'css selector:html > body > div'
      const cssResult = spec.toEyesSelector(cssSelector)
      assert.deepStrictEqual(cssResult, {type: 'css', selector: 'html > body > div'})

      const tagSelector = '<tag />'
      const tagResult = spec.toEyesSelector(tagSelector)
      assert.deepStrictEqual(tagResult, {selector: tagSelector})

      const wrongSelector = {isWrong: true}
      const wrongResult = spec.toEyesSelector(wrongSelector)
      assert.deepStrictEqual(wrongResult, {selector: wrongSelector})
    }
  }
  function executeScript() {
    return async () => {
      const args = [0, 'string', {key: 'value'}, [0, 1, 2, 3]]
      const expected = await browser.execute('return arguments', ...args)
      const result = await spec.executeScript(browser, 'return arguments', ...args)
      assert.deepStrictEqual(result, expected)
    }
  }
  function mainContext() {
    return async () => {
      try {
        const mainDocument = await browser.$('html')
        await browser.switchToFrame(await browser.findElement('css selector', '[name="frame1"]'))
        await browser.switchToFrame(await browser.findElement('css selector', '[name="frame1-1"]'))
        const frameDocument = await browser.$('html')
        assert.ok(!(await spec.isEqualElements(browser, mainDocument, frameDocument)))
        await spec.mainContext(browser)
        const resultDocument = await browser.$('html')
        assert.ok(await spec.isEqualElements(browser, resultDocument, mainDocument))
      } finally {
        await browser.switchToFrame(null).catch(() => null)
      }
    }
  }
  function parentContext() {
    return async () => {
      try {
        await browser.switchToFrame(await browser.findElement('css selector', '[name="frame1"]'))
        const parentDocument = await browser.$('html')
        await browser.switchToFrame(await browser.findElement('css selector', '[name="frame1-1"]'))
        const frameDocument = await browser.$('html')
        assert.ok(!(await spec.isEqualElements(browser, parentDocument, frameDocument)))
        await spec.parentContext(browser)
        const resultDocument = await browser.$('html')
        assert.ok(await spec.isEqualElements(browser, resultDocument, parentDocument))
      } finally {
        await browser.switchToFrame(null).catch(() => null)
      }
    }
  }
  function childContext() {
    return async () => {
      try {
        const element = await browser.findElement('css selector', '[name="frame1"]')
        await browser.switchToFrame(element)
        const expectedDocument = await browser.$('html')
        await browser.switchToFrame(null)
        await spec.childContext(browser, element)
        const resultDocument = await browser.$('html')
        assert.ok(await spec.isEqualElements(browser, resultDocument, expectedDocument))
      } finally {
        await browser.switchToFrame(null).catch(() => null)
      }
    }
  }
  function findElement({input, expected} = {}) {
    return async () => {
      const result = expected !== undefined ? expected : await browser.$(input)
      const element = await spec.findElement(browser, input)
      if (element !== result) {
        assert.ok(await spec.isEqualElements(browser, element, result))
      }
    }
  }
  function findElements({input, expected} = {}) {
    return async () => {
      const result = expected !== undefined ? expected : await browser.$$(input)
      const elements = await spec.findElements(browser, input)
      assert.strictEqual(elements.length, result.length)
      for (const [index, element] of elements.entries()) {
        assert.ok(await spec.isEqualElements(browser, element, result[index]))
      }
    }
  }
  function getWindowRect({legacy = false} = {}) {
    return async () => {
      let rect
      if (legacy) {
        const {x, y} = await browser.getWindowPosition()
        const {width, height} = await browser.getWindowSize()
        rect = {x, y, width, height}
      } else {
        rect = await browser.getWindowRect()
      }
      const result = await spec.getWindowRect(browser)
      assert.deepStrictEqual(result, rect)
    }
  }
  function setWindowRect({legacy = false, input, expected} = {}) {
    return async () => {
      await spec.setWindowRect(browser, input)
      let rect
      if (legacy) {
        const {x, y} = await browser.getWindowPosition()
        const {width, height} = await browser.getWindowSize()
        rect = {x, y, width, height}
      } else {
        rect = await browser.getWindowRect()
      }
      assert.deepStrictEqual(rect, expected)
    }
  }
  function getSessionId() {
    return async () => {
      const expected = browser.sessionId
      const result = await spec.getSessionId(browser)
      assert.deepStrictEqual(result, expected)
    }
  }
  function getTitle() {
    return async () => {
      const expected = await browser.getTitle()
      const result = await spec.getTitle(browser)
      assert.deepStrictEqual(result, expected)
    }
  }
  function getUrl() {
    return async () => {
      const result = await spec.getUrl(browser)
      assert.deepStrictEqual(result, url)
    }
  }
  function visit() {
    return async () => {
      const blank = 'about:blank'
      await spec.visit(browser, blank)
      const actual = await browser.getUrl()
      assert.deepStrictEqual(actual, blank)
      await browser.url(url)
    }
  }
  function isMobile({expected} = {}) {
    return async () => {
      const result = await spec.isMobile(browser)
      assert.deepStrictEqual(result, expected)
    }
  }
  function isAndroid({expected} = {}) {
    return async () => {
      const result = await spec.isAndroid(browser)
      assert.strictEqual(result, expected)
    }
  }
  function isIOS({expected} = {}) {
    return async () => {
      const result = await spec.isIOS(browser)
      assert.strictEqual(result, expected)
    }
  }
  function isNative({expected} = {}) {
    return async () => {
      const result = await spec.isNative(browser)
      assert.strictEqual(result, expected)
    }
  }
  function getOrientation({expected} = {}) {
    return async () => {
      const result = await spec.getOrientation(browser)
      assert.strictEqual(result, expected)
    }
  }
  function getPlatformVersion({expected} = {}) {
    return async () => {
      const result = await spec.getPlatformVersion(browser)
      assert.strictEqual(result, expected)
    }
  }
})
