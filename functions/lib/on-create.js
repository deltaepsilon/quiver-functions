module.exports = class OnCreate {
  constructor(config) {
    if (!config.usersPath) {
      throw 'config.usersPath string missing. Looks like "/users"';
    }
    this.usersPath = config.usersPath;
  }

  getFunction() {
    return event => {
      const functions = require('firebase-functions');
      const admin = require('firebase-admin');
      const config = functions.config();
      const adminConfig = {
        databaseURL: config.firebase.databaseURL,
        credential: config.firebase.credential
      };

      try {
        admin.initializeApp(adminConfig);
      } catch (e) {
        admin.initializeApp(adminConfig, 'loginApp');
      }

      const userRef = admin.database().ref(this.usersPath).child(event.data.uid);
      const user = event.data;

      return userRef.update(user);
    };
  }
};
