module.exports = class UpdateUser {
  constructor(config) {
    if (!config.usersPath) {
      throw 'config.usersPath string missing. Looks like "/users"';
    }
    if (!config.database) {
      throw 'config.database is missing. You must pass in a valid database using admin.database()';
    }
    this.usersPath = config.usersPath;
    this.database = config.database;
  }

  getFunction() {
    return event => {
      const functions = require('firebase-functions');

      const userRef = this.database.ref(this.usersPath).child(event.data.uid);
      const user = event.data;

      return userRef.update(user);
    };
  }
};
