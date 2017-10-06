module.exports = class EnvironmentService {
  constructor({config, publicPath = 'public', ignorePort}) {
    this.config = config;
    this.publicPath = publicPath;
    this.ignorePort = ignorePort;
  }

  get environment() {
    return require('../config.json');
  }

  getPublicEnvironment(dirtyHost) {
    const host = this.getHost(dirtyHost);
    const config = this.config;
    const computedConfig = { firebase: config.firebase };

    delete config.firebase.credential;
    delete config.firebase.serviceAccount;

    const publicEnvironment = {
      firebase: config.firebase,
      [this.publicPath]: Object.assign({}, config[this.publicPath]),
    };

    if (publicEnvironment[this.publicPath] && publicEnvironment[this.publicPath][host]) {
      let overrides = publicEnvironment[this.publicPath][host];
      for (let key in overrides) {
        publicEnvironment[this.publicPath][key] = publicEnvironment[this.publicPath][host][key];
      }
    }
    return publicEnvironment;
  }

  getHost(host) {
    if (host) {
      host = host.replace(/\./g, '_');

      if (this.ignorePort) {
        host = host.replace(/:\d+/, '');
      }
    }
    return host;
  }
};
