const Environment = require('./environment.onRequest');
const config = require('../config.json');
const environment = new Environment({ config });
const httpMocks = require('node-mocks-http');

describe('Environment', () => {
  let func, req, res;
  beforeEach(() => {
    func = environment.getFunction();
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('should serve from functions.config()', () => {
    func(req, res);

    const env = extractEnv(res);
    expect(!!env.firebase.databaseURL).toEqual(true);
  });

  it('should allow overriding config', () => {
    const config = { firebase: 1, public: 2 };
    const testEnvironment = new Environment({ config });
    func = testEnvironment.getFunction();

    func(req, res);

    const env = extractEnv(res);
    expect(env).toEqual(config);
  });

  describe('Public vs. Private', () => {
    it('serves only firebase, public and shared', () => {
      func(req, res);

      const env = extractEnv(res);
      expect(Object.keys(env)).toEqual(['firebase', 'public']);
    });

    it('does not serve config.credentials', () => {
      func(req, res);

      const env = extractEnv(res);
      expect(!!env.firebase.credential).toEqual(false);
    });

    it('does not serve config.serviceAccount', () => {
      func(req, res);

      const env = extractEnv(res);
      expect(!!env.firebase.serviceAccount).toEqual(false);
    });

    describe('Alternate paths', () => {
      beforeEach(() => {
        const testEnvironment = new Environment({ config, public: 'test_public', shared: 'test_shared' });
        func = testEnvironment.getFunction();
      });

      it('public', () => {
        func(req, res);

        const env = extractEnv(res);
        expect(env['test_public'].c).toEqual('test_public: c');
      });
    });
  });

  describe('handles defaults', () => {
    it('starts with defaults', () => {
      func(req, res);

      const env = extractEnv(res);
      expect(env.public.a).toEqual('defaults: a');
    });

    it('overwrites localhost', () => {
      req = httpMocks.createRequest({ host: 'localhost' });

      func(req, res);
      const env = extractEnv(res);
      expect(env.public.a).toEqual('localhost: a');
    });

    it('overwrites subdomain:domain:tld', () => {
      req = httpMocks.createRequest({ host: 'subdomain.domain.tld' });

      func(req, res);
      const env = extractEnv(res);
      expect(env.public.a).toEqual('subdomain:domain:tld: a');
    });
  });

  function extractEnv(res) {
    const response = res._getData();
    const json = response.match(/{.+}/)[0];
    return JSON.parse(json);
  }
});
