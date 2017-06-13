module.exports = class EnvironmentService {
  constructor(settings = {}) {
    this.config = settings.config;
    this.public = settings.public || 'public';
  }

  get environment() {
    return require('../config.json');
  }

  getPublicEnvironment(dirtyHost) {
    const host = dirtyHost ? dirtyHost.replace(/\./g, '_') : undefined;
    const config = this.config;
    const computedConfig = { firebase: config.firebase };

    delete config.firebase.credential;
    delete config.firebase.serviceAccount;

    const publicEnvironment = {
      firebase: config.firebase,
      [this.public]: config[this.public],
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
