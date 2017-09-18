module.exports = {
  UpdateUser: require('./functions/onCreate/updateUser.onCreate'),
  Login: require('./functions/onWrite/login.onWrite'),
  Environment: require('./functions/onRequest/environment.onRequest'),
  GraphQLServer: require('./functions/onRequest/graphqlServer.onRequest'),
  services: require('./functions/services/services'),
};
