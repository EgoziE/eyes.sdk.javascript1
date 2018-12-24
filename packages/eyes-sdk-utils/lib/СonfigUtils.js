'use strict';

const cosmiconfig = require('cosmiconfig');
const { Logger } = require('@applitools/eyes-sdk-core');

const logger = new Logger(process.env.APPLITOOLS_SHOW_LOGS); // TODO when switching to DEBUG sometime remove this env var

const explorer = cosmiconfig('applitools', {
  searchPlaces: ['package.json', 'applitools.config.js', 'eyes.config.js', 'eyes.json'],
});

class ConfigUtils {
  static getConfig({ configParams = [], configPath } = {}) {
    let defaultConfig = {};
    try {
      const result = configPath ? explorer.loadSync(configPath) : explorer.searchSync();
      if (result) {
        const { config, filepath } = result;
        logger.log('loading configuration from', filepath);
        defaultConfig = config;
      }
    } catch (ex) {
      logger.log(`an error occurred while loading configuration. configPath=${configPath}\n`, ex);
    }

    const envConfig = {};
    for (const p of configParams) {
      envConfig[p] = process.env[`APPLITOOLS_${ConfigUtils.toEnvVarName(p)}`];
    }

    Object.keys(envConfig).forEach(value => {
      if (envConfig[value] === undefined) delete envConfig[value];
    });

    return Object.assign({}, defaultConfig, envConfig);
  }

  /**
   * @param {string} camelCaseStr
   * @return {string}
   */
  static toEnvVarName(camelCaseStr) {
    return camelCaseStr.replace(/(.)([A-Z])/g, '$1_$2').toUpperCase();
  }
}

exports.ConfigUtils = ConfigUtils;
