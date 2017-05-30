module.exports = class Login {
  constructor(config) {
    if (!config.usersPath) {
      throw 'config.usersPath string missing. Looks like "/users"';
    }
    if (!config.adminUsers) {
      throw 'config.adminUsers array missing. Looks like ["chris@chrisesplin.com", "anotherAdmin@chrisesplin.com"]';
    }
    this.usersPath = config.usersPath;
    this.adminUsers = config.adminUsers;
  }

  getFunction() {
    return event => {
      const user = event.data.val();
      const userRef = event.data.adminRef.root.child(this.usersPath).child(event.params.uid);

      if (!user) return Promise.resolve();

      user.lastLogin = Date.now();

      if (this.adminUsers.includes(user.email)) {
        user.isAdmin = true;
      }

      return userRef.update(user).then(() => {
        return event.data.ref.remove();
      });
    };
  }
};
