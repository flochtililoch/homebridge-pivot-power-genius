'use strict';

const Wink = {
  init: (args, done) => {
    if (Wink.rejectAuth) {
      done();
    } else {
      done(true);
    }
  },
  user: () => {
    return {
      devices: () => {

      }
    };
  }
};

module.exports = Wink;
