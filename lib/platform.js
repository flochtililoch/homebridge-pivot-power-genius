'use strict';

const wink = require('wink-js'),
      {assertString, assertArray} = require('./utils/assert');

const type = 'powerstrips';

let Accessory;

class Platform {

  constructor (log, config) {
    assertString(config.client_id, "`config.client_id` must be set");
    assertString(config.client_secret, "`config.client_secret` must be set");
    assertString(config.username, "`config.username` must be set");
    assertString(config.password, "`config.password` must be set");
    assertArray(config.outlets, "`config.outlets` must be an array");

    this.log = log;
    this.config = config;
  }

  authenticate () {
    return new Promise((resolve, reject) => {
      const {client_id, client_secret, username, password} = this.config;

      wink.init({client_id, client_secret, username, password}, auth => {
        if (!auth) {
          return reject('Authentication error');
        }
        return resolve();
      });
    });
  }

  accessories(callback) {
    this.authenticate().then(() => {
      wink.user().devices(type, devices => {
        if (!devices) {
          return Promise.reject('API failed returning devices');
        }
        const accessories = devices.data.map(device => new Accessory(device, this.config.outlets, this.log));
        callback(accessories);
      });
    }).catch(error => {
      this.log(error);
    });
  }
}

module.exports = (hap) => {
  Accessory = require('./accessory')(hap);
  return Platform;
};
