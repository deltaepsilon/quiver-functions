module.exports = class MockAuthEvent {
  constructor(user) {
    if (!user) {
      throw 'user required to initialize MockAuthEvent';
    } else {
      this.data = user;
    }
    this.eventId = '123456-fake-id-string';
    this.eventType = 'providers/firebase.auth/eventTypes/user.create';
    this.resource = 'projects/fake-project-id';
    this.notSupported = {};
    this.params = {};
    this.timestamp = new Date().toString();
  }
};