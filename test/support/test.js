'use strict';

const chai = require('chai'),
      chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.assert = chai.assert;
