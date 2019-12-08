'use strict'

/* eslint-env browser */

/**
 * This file is meant to be used as an input for Browserify for creating a browser version of the SDK, by adding
 * the EyesSDK object to the global "window" instance.
 */
window.EyesSdkCore = require('@applitools/eyes-sdk-core')

console.log("EyesSDK loaded into the 'window' object") // eslint-disable-line no-console
