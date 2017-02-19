'use strict';

const wink = require('wink-js'),
      {assert, assertString, assertArray} = require('./utils/assert');

const type = 'outlets';

let Service, Characteristic;

const responseHandler = done => (response) => {
  const errorHandler = message => done(`error fetching device: ${this.name}: ${message}`);
  if (!response) {
    errorHandler('No API response');
  }
  const {errors, data} = response;
  if (!data) {
    errorHandler('No data');
  }
  if (errors.length > 0) {
    errorHandler(`Errors: ${errors}`);
  }
  done(undefined, data);
};

class Accessory {

  constructor (raw, overrides, log) {
    assertString(raw.powerstrip_id, '`raw.powerstrip_id` must be set');
    assertString(raw.name, '`raw.name` must be set');
    assertString(raw.device_manufacturer, '`raw.device_manufacturer` must be set');
    assertString(raw.model_name, '`raw.model_name` must be set');
    assertString(raw.serial, '`raw.serial` must be set');
    assertArray(raw.outlets, '`raw.outlets` must be an array');
    assertArray(overrides, "`overrides` must be an array");

    this.log = log;
    this.id = raw.powerstrip_id;
    this.name = raw.name;
    this.manufacturer = raw.device_manufacturer;
    this.model = raw.model_name;
    this.serialNumber = raw.serial;
    this.outlets = raw.outlets.map(outlet => {
      const override = this.outlet(overrides, outlet.uuid) || {};
      const outletConfig = Object.assign({
        uuid: outlet.uuid,
        name: outlet.name,
        hapService: 'Outlet'
      }, override);
      assert(Service[outletConfig.hapService] !== undefined, `${outletConfig.hapService} is not a known HAP service.`);
      return outletConfig
    });
  }

  outlet (outlets, uuid) {
    return outlets.filter(outlet => outlet.uuid === uuid)[0];
  }

  remoteOutlet (uuid) {
    return wink.device_group(type).device_id(uuid);
  }

  responseHandler(done) {
    return (response) => {
      const errorHandler = message => done(`error fetching device: ${this.name}: ${message}`);
      if (!response) {
        errorHandler('No API response');
      }
      const {errors, data} = response;
      if (!data) {
        errorHandler('No data');
      }
      if (errors.length > 0) {
        errorHandler(`Errors: ${errors}`);
      }
      done(undefined, data);
    }
  }

  logLine(message, uuid) {
    this.log(`${message} for outlet "${uuid}" (powerstrip "${this.id}")`);
  }

  getOutlet (uuid, done) {
    this.logLine('getting state', uuid);
    this.remoteOutlet(uuid).get(this.responseHandler(done));
  }

  setOutlet (uuid, powered, done) {
    this.logLine(`setting state to "${powered ? 'on' : 'off'}"`, uuid);
    this.remoteOutlet(uuid).update({desired_state: {powered}}, this.responseHandler(done));
  }

  accessoryServices () {
    const responseHandler = done => {
      return (error, outlet) => {
        if (error || !outlet) {
          this.log('error', error);
          return done(error);
        }
        const { powered, uuid } = outlet;
        this.logLine(`state is "${powered ? 'on' : 'off'}"`, uuid);
        return done(undefined, powered);
      }
    };

    return this.outlets.map(({uuid, name, hapService}) => {
      const service = new Service[hapService]();

      service.subtype = uuid;
      service.setCharacteristic(Characteristic.Name, name)
      service.getCharacteristic(Characteristic.On)
        .on('get', done => this.getOutlet(uuid, responseHandler(done)))
        .on('set', (value, done) => this.setOutlet(uuid, value, responseHandler(done)))

      return service;
    })
  }

  informationService () {
    const service = new Service.AccessoryInformation();

    service
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serialNumber)
      .setCharacteristic(Characteristic.Name, this.name);

    return service;
  }

  getServices () {
    return [
      ...this.accessoryServices(),
      this.informationService()
    ];
  }

}

module.exports = (hap) => {
  Service = hap.Service;
  Characteristic = hap.Characteristic;
  return Accessory;
};
