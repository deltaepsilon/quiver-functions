const EnvironmentService = require('../services/environment.service');
const HOSTNAME_REGEXP = /\/\/([^:/]+)/;

module.exports = class Environment {
  constructor(settings) {
    this.settings = settings;
    this.headers = settings && settings.headers || {};
  }

  getFunction() {
    return (req, res) => {
      const environmentService = new EnvironmentService(this.settings);
      const hostnameMatch = req.headers.referer
        ? req.headers.referer.match(HOSTNAME_REGEXP)
        : false;
      const hostname = hostnameMatch ? hostnameMatch[1] : req.hostname;
      const publicEnvironment = environmentService.getPublicEnvironment(hostname);

      for (let header in this.headers) {
        res.set(header, this.headers[header]);
      }
      res.status(200).send(`window.firebaseEnv = ${JSON.stringify(publicEnvironment)}`);
    };
  }
};
