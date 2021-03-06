const tags = ['chrome', 'chromium', 'firefox', 'webkit', 'safari']
module.exports = {
  spec: [
    './test/coverage/generic/*.spec.js',
    '../sdk-shared/coverage-tests/custom/**.spec.js',
  ],
  parallel: true,
  jobs: 5,
  timeout: 0,
  reporter: 'spec-xunit-file',
  require: ['../sdk-shared/coverage-tests/util/mocha-hooks.js'],
  grep: new RegExp(`^[\\w\\s]*?(\\((?:@(${tags.join('|')}) ?)+\\))?$`)
}
