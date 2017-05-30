module.exports = {
  UpdateUser: require('./functions/onCreate/updateUser.onCreate'),
  Login: require('./functions/onWrite/login.onWrite'),
  Environment: require('./functions/onRequest/environment.onRequest'),
  mocks: require('./mocks/mocks'),
  utilities: require('./utilities/utilities')
}