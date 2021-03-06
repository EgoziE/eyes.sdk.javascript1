'use strict'
const {URL} = require('url')
const cwd = process.cwd()
const {
  StitchMode,
  BatchInfo,
  Configuration,
  Eyes,
  VisualGridRunner,
  ConsoleLogHandler,
} = require(cwd)

const SAUCE_SERVER_URL = 'https://ondemand.saucelabs.com:443/wd/hub'

const SAUCE_CREDENTIALS = {
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
}

const DEVICES = {
  'Android Emulator': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      deviceName: 'Android Emulator',
      platformName: 'Android',
      platformVersion: '6.0',
      deviceOrientation: 'landscape',
      clearSystemFiles: true,
      noReset: true,
      ...SAUCE_CREDENTIALS,
    },
  },
  'Pixel 3a XL': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      deviceName: 'Google Pixel 3a XL GoogleAPI Emulator',
      platformName: 'Android',
      platformVersion: '10.0',
      deviceOrientation: 'portrait',
      ...SAUCE_CREDENTIALS,
    },
  },
  'Samsung Galaxy S8': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      browserName: '',
      name: 'Android Demo',
      platformName: 'Android',
      platformVersion: '7.0',
      appiumVersion: '1.9.1',
      deviceName: 'Samsung Galaxy S8 FHD GoogleAPI Emulator',
      automationName: 'uiautomator2',
      ...SAUCE_CREDENTIALS,
    },
  },
  'iPhone XS': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      platformName: 'iOS',
      platformVersion: '13.0',
      deviceName: 'iPhone XS Simulator',
      ...SAUCE_CREDENTIALS,
    },
  },
}

const BROWSERS = {
  'edge-18': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      browserName: 'MicrosoftEdge',
      browserVersion: '18.17763',
      platformName: 'Windows 10',
    },
    options: {
      name: 'Edge 18',
      avoidProxy: true,
      screenResolution: '1920x1080',
      ...SAUCE_CREDENTIALS,
    },
  },
  'ie-11': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      browserName: 'internet explorer',
      browserVersion: '11.285',
      platformName: 'Windows 10',
    },
    options: {
      name: 'IE 11',
      screenResolution: '1920x1080',
      ...SAUCE_CREDENTIALS,
    },
  },
  'safari-11': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      browserName: 'safari',
      browserVersion: '11.0',
      platformName: 'macOS 10.12',
    },
    options: {
      name: 'Safari 11',
      seleniumVersion: '3.4.0',
      ...SAUCE_CREDENTIALS,
    },
  },
  'safari-12': {
    type: 'sauce',
    url: SAUCE_SERVER_URL,
    capabilities: {
      browserName: 'safari',
      browserVersion: '12.1',
      platformName: 'macOS 10.13',
    },
    options: {
      name: 'Safari 12',
      seleniumVersion: '3.4.0',
      ...SAUCE_CREDENTIALS,
    },
  },
  firefox: {
    url: 'http://localhost:4445/wd/hub',
    capabilities: {
      browserName: 'firefox',
    },
  },
  chrome: {
    capabilities: {
      browserName: 'chrome',
    },
  },
}

function Env(
  {browser, app, device, url, headless = !process.env.NO_HEADLESS, legacy, ...options} = {},
  protocol = 'wd',
) {
  const env = {browser, device, headless, protocol, ...options}
  if (protocol === 'wd') {
    env.url = new URL(url || process.env.CVG_TESTS_WD_REMOTE || process.env.CVG_TESTS_REMOTE)
    env.capabilities = {
      browserName: browser,
      app,
      ...env.capabilities,
    }
    const preset = DEVICES[device] || BROWSERS[browser]
    if (preset) {
      env.url = preset.url ? new URL(preset.url) : env.url
      env.capabilities = Object.assign(env.capabilities, preset.capabilities)
      env.sauce = preset.type === 'sauce'
      if (preset.options) {
        if (preset.type === 'sauce') {
          if (legacy) Object.assign(env.capabilities, preset.options)
          else env.capabilities['sauce:options'] = {...preset.options}
        } else {
          env.options = preset.options
        }
      }
    }
  } else if (protocol === 'cdp') {
    url = url || process.env.CVG_TESTS_CDP_REMOTE
    env.url = url ? new URL(url) : undefined
  }
  return env
}

const batchName = process.env.APPLITOOLS_BATCH_NAME || 'JS Coverage Tests'
const batch = typeof BatchInfo === 'undefined' ? batchName : new BatchInfo(batchName)

function getEyes({
  isVisualGrid,
  isCssStitching,
  configuration,
  branchName = 'master',
  showLogs,
} = {}) {
  const eyes = new Eyes(isVisualGrid ? new VisualGridRunner(10) : undefined)
  const conf = Object.assign(
    {
      apiKey: process.env.APPLITOOLS_API_KEY_SDK,
      batch,
      branchName,
      parentBranchName: 'master',
      dontCloseBatches: true,
      matchTimeout: 0,
      stitchMode: isCssStitching ? StitchMode.CSS : StitchMode.SCROLL,
      saveNewTests: false,
    },
    configuration,
  )
  eyes.setConfiguration(new Configuration(conf))

  if (process.env.APPLITOOLS_SHOW_LOGS || showLogs) {
    eyes.setLogHandler(new ConsoleLogHandler(true))
  }

  return eyes
}

module.exports = {
  Env,
  getEyes,
  batch,
  BROWSERS,
  DEVICES,
}
