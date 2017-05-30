module.exports = class EnvironmentService {
  constructor(settings = {}) {
    this.config = settings.config;
    this.public = settings.public || 'public';
    this.shared = settings.shared || 'shared';
  }

  getEnvironment() {
    return require('../.runtimeconfig.json');
  }

  getPublicEnvironment(dirtyHost) {
    const host = dirtyHost ? dirtyHost.replace(/\./g, ':') : undefined;
    const config = this.config;
    const computedConfig = { firebase: config.firebase };

    delete config.firebase.credential;
    delete config.firebase.serviceAccount;

    const publicEnvironment = {
      firebase: config.firebase,
      [this.public]: config[this.public],
      [this.shared]: config[this.shared],
    };

    if (publicEnvironment[this.public] && publicEnvironment[this.public][host]) {
      let overrides = publicEnvironment[this.public][host];
      for (let key in overrides) {
        publicEnvironment[this.public][key] = publicEnvironment[this.public][host][key];
      }
    }
    return publicEnvironment;
  }
};
