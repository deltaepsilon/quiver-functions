const functions = require('firebase-functions');

module.exports = class MockDBEvent {
  constructor({ app, adminApp, data, delta, path, params }) {
    this.data = new functions.database.DeltaSnapshot(app, adminApp, data, delta, path);
    this.params = params;
  }
};
