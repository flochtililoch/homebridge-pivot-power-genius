'use strict';

const proxyquire = require('proxyquire'),
      sinon = require('sinon'),
      Accessory = require('../stub/accessory'),
      Wink = require('../stub/wink'),
      PlatformPlugin = proxyquire('../../lib/platform', {
        './accessory': Accessory,
        'wink-js': Wink
      });

const Platform = PlatformPlugin({});

const log = () => {};
const config = require('../stub/config');

let platform, spy, promise;

describe('Platform', () => {
  afterEach(() => {
    sinon.sandbox.restore();
  });
  describe('constructor', () => {
    describe('with invalid configuration', () => {
      describe('with invalid client_id', () => {
        let invalidConfig;
        before(() => {
          invalidConfig = Object.assign({}, config, {client_id: undefined});
        });
        it('throws an error', () => {
          expect(() => {
            new Platform(log, invalidConfig)
          }).to.throw('`config.client_id` must be set');
        });
      });
      describe('with invalid client_secret', () => {
        let invalidConfig;
        before(() => {
          invalidConfig = Object.assign({}, config, {client_secret: undefined});
        });
        it('throws an error', () => {
          expect(() => {
            new Platform(log, invalidConfig)
          }).to.throw('`config.client_secret` must be set');
        });
      });
      describe('with invalid username', () => {
        let invalidConfig;
        before(() => {
          invalidConfig = Object.assign({}, config, {username: undefined});
        });
        it('throws an error', () => {
          expect(() => {
            new Platform(log, invalidConfig)
          }).to.throw('`config.username` must be set');
        });
      });
      describe('with invalid password', () => {
        let invalidConfig;
        before(() => {
          invalidConfig = Object.assign({}, config, {password: undefined});
        });
        it('throws an error', () => {
          expect(() => {
            new Platform(log, invalidConfig)
          }).to.throw('`config.password` must be set');
        });
      });
      describe('with undefined outlets', () => {
        let invalidConfig;
        before(() => {
          invalidConfig = Object.assign({}, config, {outlets: undefined});
        });
        it('throws an error', () => {
          expect(() => {
            new Platform(log, invalidConfig)
          }).to.throw('`config.outlets` must be an array');
        });
      });
      describe('with invalid outlets', () => {
        let invalidConfig;
        before(() => {
          invalidConfig = Object.assign({}, config, {outlets: {}});
        });
        it('throws an error', () => {
          expect(() => {
            new Platform(log, invalidConfig)
          }).to.throw('`config.outlets` must be an array');
        });
      });
    });
    describe('with valid configuration', () => {
      before(() => {
        platform = new Platform(log, config)
      });
      it('keeps a reference of log and config arguments in its instance', () => {
        expect(platform.log).to.equal(log);
        expect(platform.config).to.equal(config);
      });
    });
  });

  describe('authenticate', () => {
    before(() => {
      platform = new Platform(log, config);
      spy = sinon.sandbox.spy(Wink, 'init');
    });

    describe('handles success', () => {
      before(() => {
        Wink.rejectAuth = false;
        promise = platform.authenticate();
      });
      it('correcly calls Wink.init', () => {
        expect(spy.calledOnce).to.be.true;
        expect(spy.firstCall.args[0]).to.deep.equal({
          client_id: config.client_id,
          client_secret: config.client_secret,
          username: config.username,
          password: config.password
        });
      })
      it('eventually resolves', () => assert.isFulfilled(promise));
    });

    describe('handles failures', () => {
      before(() => {
        Wink.rejectAuth = true;
      });
      it('eventually rejects', () => assert.isRejected(platform.authenticate()));
    });
  });

  describe('accessories', () => {
    // TODO
  });
});
