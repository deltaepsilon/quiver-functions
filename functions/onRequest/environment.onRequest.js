const EnvironmentService = require('../services/environment.service');

module.exports = class Environment {
  constructor(settings = {}) {
    this.public = settings.public || 'public';
    this.shared = settings.shared || 'shared';
    this.config = settings.config;
  }

  getFunction() {
    return (req, res) => {
      const config = this.config;
      const environmentService = new EnvironmentService({ config, public: this.public, shared: this.shared });
      const publicEnvironment = environmentService.getPublicEnvironment(req.host);

      res.status(200).send(`
        <script>
          window.firebaseEnv = ${JSON.stringify(publicEnvironment)}
        </script>
      `);
    };
  }
};
