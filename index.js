'use strict';

const packageName = require('./package').name,
      platformName = 'Wink Pivot Power Genius';

module.exports = function (homebridge) {
  process.env.WINK_NO_CACHE = true;
  const Platform = require('./lib/platform')(homebridge.hap);
  homebridge.registerPlatform(packageName, platformName, Platform);
};
