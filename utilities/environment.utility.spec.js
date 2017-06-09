const _ = require('lodash');

describe('EnvironmentUtility', function() {
  const config = require('../functions/config.json');

  const utilities = require('./utilities');
  const environmentUtility = new utilities.EnvironmentUtility(config.config.project, config.config.token, config);

  describe('getConfigCommands', () => {
    it('should handle nasty config', () => {
      const config = {
        firebase: {
          apiKey: 'asdfadsfadas'
        },
        config: {
          token: '1/asdfadsfdasf',
          project: 'asdfds',
        },
        public: {
          config: {
            project: 'asdfads',
            root: 'production',
            firestore_options: {
              persistence: true,
            },
            firestoreoptions: {
              persistence: true,
            },
          },
          models: {
            queues: {
              login: 'queues/login',
            },
          },
          localhost: {
            config: {
              project: 'asfds',
              root: 'development',
            },
          },
        },
      };

      const result = environmentUtility.getConfigCommands(config);
      expect(result).toEqual([ 'public.localhost.config.root=development',
      'public.localhost.config.project=asfds',
      'public.models.queues.login=queues/login',
      'public.config.firestoreoptions.persistence=\'true\'',
      'public.config.firestore_options.persistence=\'true\'',
      'public.config.root=production',
      'public.config.project=asdfads',
      'config.project=asdfds',
      'config.token=1/asdfadsfdasf',
      'firebase.apiKey=asdfadsfadas' ]);
    });
  });

  // function cleanUp(done) {
  //   environmentUtility.unsetAll().then(done).catch(error => {
  //     console.log(error)
  //   });
  // }

  // beforeEach(cleanUp);

  // it('should start with an empty config', done => {
  //   testConfig({}).then(done);
  // });

  // it(
  //   'should set config',
  //   done => {
  //     // afterEach(cleanUp);
  //     // return done();

  //     environmentUtility
  //       .setAll()
  //       .then(() => {
  //         const expectedConfig = _.omit(config, ['firebase']);
  //         return testConfig(expectedConfig);
  //       })
  //       .then(done);
  //   },
  //   60000
  // );

  // function testConfig(expectedConfig) {
  //   return environmentUtility.getAll().then(config => {
  //     const isEqual = _.isEqual(config, expectedConfig);

  //     if (!isEqual) {
  //       console.log('testConfig failed');
  //       console.log(config);
  //       console.log(expectedConfig);
  //       // debugger;
  //     }

  //     expect(isEqual).toEqual(true);
  //     return true;
  //   });
  // }
});
