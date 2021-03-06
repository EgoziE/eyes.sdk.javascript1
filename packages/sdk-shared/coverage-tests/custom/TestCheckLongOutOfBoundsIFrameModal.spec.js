'use strict'
const path = require('path')
const cwd = process.cwd()
const spec = require(path.resolve(cwd, 'src/SpecDriver'))
const {getEyes} = require('../../src/test-setup')
const {TestCheckLongOutOfBoundsIFrameModal} = require('./TestFluentApi_utils')

describe.skip('Coverage tests', () => {
  let driver, destroyDriver, eyes

  afterEach(async () => {
    await eyes.abortIfNotClosed()
    await destroyDriver()
  })

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    await spec.visit(driver, 'https://applitools.github.io/demo/TestPages/FramesTestPage/')
    eyes = await getEyes({isCssStitching: true, branchName: 'v2'})
    eyes.setMatchTimeout(0)
  })

  it('TestCheckLongOutOfBoundsIFrameModal', () =>
    TestCheckLongOutOfBoundsIFrameModal({
      testName: 'TestCheckLongOutOfBoundsIFrameModal',
      eyes,
      driver,
    }))
})
