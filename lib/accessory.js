'use strict';

const wink = require('wink-js'),
      {assert, assertString, assertArray} = require('./utils/assert');

const type = 'outlets';

let Service, Characteristic;

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
	this.log("Strip " + this.name + " ('" + this.model + " - S/N '" + this.serialNumber + "') initialized.");
	
	var that = this;
	
    this.outlets = raw.outlets.map(outlet => {
      const override = this.outlet(overrides, outlet.uuid) || {};
      const outletConfig = Object.assign({
        uuid: outlet.uuid,
        name: outlet.name,
        hapService: 'Outlet',
		log : this.log
      }, override);
      assert(Service[outletConfig.hapService] !== undefined, `${outletConfig.hapService} is not a known HAP service.`);
      return outletConfig
    });
  }

  outlet (outlets, uuid) {
    if(outlets && outlets.filter){
		return outlets.filter(outlet => outlet.uuid === uuid)[0];
	}else{
		return null;
	}
  }

  remoteOutlet (uuid) {
    return wink.device_group(type).device_id(uuid);
  }

  getOutlet (uuid, done) {
    this.remoteOutlet(uuid).get(response => {
      const {errors, data} = response;
      if (errors.length > 0 || !data) {
        return reject(`error fetching device: ${this.name}.`);
      }
      done(undefined, data);
    });
  }

  setOutlet (uuid, powered, done) {
	  var that = this;
    this.remoteOutlet(uuid).update({desired_state: {powered}}, () => {	
		that.outlets.map(function(outlet){
			if(outlet.uuid == uuid) that.log(outlet.name + " set to state: " + powered);
		})
      done(undefined, this.outlet(device.outlets, uuid));
    });
  }

  accessoryServices () {
    const responseHandler = done => {
      return (error, outlet) => {
		return done(undefined, (outlet)?outlet.powered:null);
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
