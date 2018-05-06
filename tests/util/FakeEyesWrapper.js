const {MatchResult, RenderStatusResults, RenderStatus} = require('@applitools/eyes.sdk.core');
const {URL} = require('url');
const {loadJsonFixture, loadFixtureBuffer} = require('./loadFixture');
const BAD_SCREENSHOT_URL = 'BAD_SCREENSHOT_URL';
const GOOD_SCREENSHOT_URL = 'GOOD_SCREENSHOT_URL';
const BAD_RENDER_ID = 'BAD_RENDER_ID';
const GOOD_RENDER_ID = 'GOOD_RENDER_ID';
const crypto = require('crypto');

function compare(o1, o2) {
  return JSON.stringify(o1) === JSON.stringify(o2);
}

function getSha256Hash(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');
}

class FakeEyesWrapper {
  constructor({goodFilename, goodResourceUrls}) {
    this._logger = {
      verbose: console.log,
    };
    this.goodFilename = goodFilename;
    this.goodResourceUrls = goodResourceUrls;
  }

  async open(_appName, _testName, _viewportSize) {}

  async postRender({
    url: _url,
    resources,
    cdt,
    renderWidth: _renderWidth,
    renderInfo: _renderInfo,
  }) {
    const actualResources = Object.keys(resources).map(resourceUrl => ({
      url: resourceUrl,
      hash: resources[resourceUrl].getSha256Hash(),
    }));
    const isGoodCdt = !cdt || compare(cdt, this.expectedCdt);
    const isGoodResources =
      !actualResources.length || compare(actualResources, this.expectedResources);
    const isGood = isGoodCdt || isGoodResources;
    return isGood ? GOOD_RENDER_ID : BAD_RENDER_ID;
  }

  async getRenderStatus(renderId) {
    const result = new RenderStatusResults();
    result.setStatus(RenderStatus.RENDERED);
    result.setImageLocation(renderId === GOOD_RENDER_ID ? GOOD_SCREENSHOT_URL : BAD_SCREENSHOT_URL);
    return result;
  }

  async getRenderInfo() {}

  async checkWindow({screenshotUrl, tag: _tag}) {
    const result = new MatchResult();
    const asExpected = screenshotUrl === GOOD_SCREENSHOT_URL;
    result.setAsExpected(asExpected);
    return result;
  }

  createRGridDom({cdt: _cdt, resources: _resources}) {}

  async close() {}

  get expectedCdt() {
    return loadJsonFixture(this.goodFilename);
  }

  get expectedResources() {
    return this.goodResourceUrls.map(resourceUrl => ({
      url: resourceUrl,
      hash: getSha256Hash(loadFixtureBuffer(new URL(resourceUrl).pathname.slice(1))),
    }));
  }
}

module.exports = FakeEyesWrapper;
