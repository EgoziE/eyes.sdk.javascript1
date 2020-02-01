'use strict'
const axios = require('axios')
const {expect} = require('chai')

const RegionType = ['ignore', 'strict', 'content', 'layout', 'floating', 'accessibility']

async function getTestResults(testSummary) {
  expect(testSummary, 'Test summary should not be undefined').to.not.be.undefined
  if (testSummary.constructor.name === 'TestResults') return testSummary
  let testResultContainer = await testSummary.getAllResults()
  return testResultContainer[0].getTestResults()
}

async function getApiData(url, token) {
  let response = await axios.get(
    `${url}?format=json&AccessToken=${token}&apiKey=${process.env.APPLITOOLS_API_KEY}`,
  )
  return response.data
}

function assertProperties(actual, expected) {
  for (let property in expected) {
    if (!Array.isArray(expected[property]) && expected.hasOwnProperty(property)) {
      expect(actual[property], `Property: ${property} is not set as expected`).to.be.eql(
        expected[property],
      )
    }
  }
}

async function assertImage(testSummary, expected, index = 0) {
  let results = await getTestResults(testSummary)
  let data = await getApiData(results.getApiUrls().getSession(), results.getSecretToken())
  let image = data.actualAppOutput[index].image
  assertProperties(image, expected)
}

async function assertImageMatchSettings(testSummary, expected, index = 0) {
  let results = await getTestResults(testSummary)
  let data = await getApiData(results.getApiUrls().getSession(), results.getSecretToken())
  let imageMatchSettings = data.actualAppOutput[index].imageMatchSettings // can be reconsidered but in the DotNet suite only first one is used for assertions
  assertProperties(imageMatchSettings, expected)
  assertRegions()

  function assertRegions() {
    RegionType.forEach(type => {
      if (expected[type]) expect(imageMatchSettings[type]).include.deep.members(expected[type])
    })
  }
}

async function assertDefaultMatchSettings(testSummary, expected) {
  let results = await getTestResults(testSummary)
  let data = await getApiData(results.getApiUrls().getSession(), results.getSecretToken())
  let defaultMatchSettings = data.startInfo.defaultMatchSettings // can be reconsidered but in the DotNet suite only first one is used for assertions
  assertProperties(defaultMatchSettings, expected)
}

module.exports.assertImageMatchSettings = assertImageMatchSettings
module.exports.assertImage = assertImage
module.exports.assertDefaultMatchSettings = assertDefaultMatchSettings
