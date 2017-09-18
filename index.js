module.exports = {
  UpdateUser: require('./functions/onCreate/updateUser.onCreate'),
  Login: require('./functions/onWrite/login.onWrite'),
  Environment: require('./functions/onRequest/environment.onRequest'),
  GraphQLServer: require('./functions/onRequest/graphqlServer.onRequest'),
  mocks: require('./mocks/mocks'),
  services: require('./functions/services'),
  utilities: require('./utilities/utilities')
}