const EventService = require('../services/event.service');

module.exports = class Login {
  constructor({ usersPath, adminUsers, auth }) {
    if (!usersPath) {
      throw 'config.usersPath string missing. Looks something like "/{anyWildcard}/users"';
    }
    if (!adminUsers) {
      throw 'config.adminUsers array missing. Looks like ["chris@chrisesplin.com", "anotherAdmin@chrisesplin.com"]';
    }
    if (!auth) {
      throw 'config.auth missing.';
    }
    this.usersPath = usersPath;
    this.adminUsers = adminUsers;
    this.auth = auth;

    this.eventService = new EventService();
  }

  getFunction() {
    return event => {
      const payload = event.data.val();
      if (!payload) return;

      const token = payload.token;
      const user = {
        lastLogin: Date.now(),
      };

      return Promise.resolve()
        .then(() => {
          return this.auth.verifyIdToken(token);
        })
        .then(token => {
          const userRef = this.getUserRef({ ref: event.data.adminRef, uid: token.uid, params: event.params });

          user.token = token;
          if (this.adminUsers.includes(token.email)) {
            user.isAdmin = true;
          }

          return userRef.update(user);
        })
        .then(() => event.data.ref.remove())
        .then(() => user)
        .catch(error => {
          return event.data.ref.update({ error }).then(() => Promise.reject(error));
        });
    };
  }

  getUserRef({ ref, uid, params }) {
    let usersPath = this.eventService.getAbsolutePath(this.usersPath, params);
    return ref.root.child(usersPath).child(uid);
  }

};
