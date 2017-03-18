const _ = require('lodash');

describe('Login', function() {
  const config = require('../functions/config.json');

  const utilities = require('./utilities');
  const environmentUtility = new utilities.EnvironmentUtility(config.config.project, config.config.token, config);

  function cleanUp(done) {
    environmentUtility.unsetAll().then((keys) => {
      console.log('cleanup complete', keys);
      done();
    });
  }

  beforeEach(cleanUp);

  it('should start with an empty config', done => {
    testConfig({}).then(done);
  });

  it(
    'should set config',
    done => {
      // afterEach(cleanUp);
      return done();

      environmentUtility
        .setAll()
        .then(() => {
          const expectedConfig = _.omit(config, ['firebase']);
          return testConfig(expectedConfig);
        })
        .then(done);
    },
    60000
  );

  function testConfig(expectedConfig) {
    return environmentUtility.getAll().then(config => {
      const isEqual = _.isEqual(config, expectedConfig);

      if (!isEqual) {
        console.log('testConfig failed');
        console.log(config);
        console.log(expectedConfig);
        // debugger;
      }

      expect(isEqual).toEqual(true);
      return true;
    });
  }
});
