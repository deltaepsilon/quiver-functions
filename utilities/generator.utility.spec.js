const Utility = require('./generator.utility');
const admin = require('firebase-admin');
const config = require('../functions/config.json');

admin.initializeApp({
  databaseURL: config.firebase.databaseURL,
  credential: admin.credential.cert(config.firebase.serviceAccount)
});

describe('GeneratorUtility', () => {
  let utility;
  beforeEach(() => {
    utility = new Utility({admin});
  });

  describe('generate', () => {
    it('creates x records with n relationships', () => {
      const data = utility.generate(10, 5);
      const keys = Object.keys(data);
      const connections = keys.reduce((connections, key) => {
        const connectionKeys = Object.keys(data[key].connections);
        return connections.concat(connectionKeys)
      }, []);
      
      expect(keys.length).toEqual(10);
      expect(connections.length).toEqual(50);
    });
  });
});