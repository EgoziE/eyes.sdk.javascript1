'use strict';

const path = require('path');
const fs = require('fs');

const { GeneralUtils } = require('../utils/GeneralUtils');
const { LogHandler } = require('./LogHandler');

/**
 * Write log massages to the browser/node console
 */
class FileLogHandler extends LogHandler {
  /**
   * @param {boolean} isVerbose Whether to handle or ignore verbose log messages.
   * @param {string} [filename] The file in which to save the logs.
   * @param {boolean} [append=true] Whether to append the logs to existing file, or to overwrite the existing file.
   */
  constructor(isVerbose, filename = 'eyes.log', append = true) {
    super();

    this._filename = filename;
    this._append = append;
    this.setIsVerbose(isVerbose);
  }

  /**
   * Create a winston file logger
   */
  open() {
    this.close();

    const file = path.normalize(this._filename);
    const opts = {
      flags: this._append ? 'a' : 'w',
      encoding: 'utf8',
    };

    this._writer = fs.createWriteStream(file, opts);
  }

  /**
   * Close the winston file logger
   */
  close() {
    if (this._writer) {
      this._writer.end('\n');
      this._writer = undefined;
    }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Handle a message to be logged.
   *
   * @param {boolean} verbose Whether this message is flagged as verbose or not.
   * @param {string} logString The string to log.
   */
  onMessage(verbose, logString) {
    if (this._writer && (!verbose || this._isVerbose)) {
      this._writer.write(`${GeneralUtils.toISO8601DateTime()} Eyes: ${logString}\n`);
    }
  }
}

exports.FileLogHandler = FileLogHandler;
