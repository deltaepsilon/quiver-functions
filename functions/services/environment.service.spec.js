const Service = require('./environment.service');
const config = require('../config.json');

describe('EnvironmentService', () => {
  let service;
  beforeEach(() => {
    service = new Service({ config });
  });

  describe('getPublicEnvironment', () => {
    it('should resolve localhost', () => {
      const expected = {
        firebase: {
          apiKey: 'AIzaSyAgB7JVLSl-3TQGL-qvQ7mdSYjmpPNV7xQ',
          authDomain: 'quiver-two.firebaseapp.com',
          databaseURL: 'https://quiver-two.firebaseio.com',
          storageBucket: 'quiver-two.appspot.com',
        },
        public: {
          a: 'localhost: a',
          b: 'localhost: b',
          localhost: { a: 'localhost: a', b: 'localhost: b' },
          models: { queues: { 'current-user': 'quiver-functions/queues/current-user' } },
          subdomain_domain_tld: {
            a: 'subdomain.domain.tld: a',
            b: 'subdomain.domain.tld: b',
          },
        },
      };
      expect(service.getPublicEnvironment('localhost')).toEqual(expected);
    });

    it('should resolve subdomain_domain_tld', () => {
      const expected = {
        firebase: {
          apiKey: 'AIzaSyAgB7JVLSl-3TQGL-qvQ7mdSYjmpPNV7xQ',
          authDomain: 'quiver-two.firebaseapp.com',
          databaseURL: 'https://quiver-two.firebaseio.com',
          storageBucket: 'quiver-two.appspot.com',
        },
        public: {
          a: 'subdomain.domain.tld: a',
          b: 'subdomain.domain.tld: b',
          localhost: { a: 'localhost: a', b: 'localhost: b' },
          models: { queues: { 'current-user': 'quiver-functions/queues/current-user' } },
          subdomain_domain_tld: { a: 'subdomain.domain.tld: a', b: 'subdomain.domain.tld: b' },
        },
      };
      expect(service.getPublicEnvironment('subdomain_domain_tld')).toEqual(expected);
    });
  });
});
