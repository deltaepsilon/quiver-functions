const functions = require('firebase-functions');

const OnCreate = require('./lib/on-create');
const onCreate = new OnCreate({
  usersPath: 'quiver-functions/users'
});
exports.onCreate = functions.auth.user().onCreate(onCreate.getFunction());

const Login = require('./lib/login');
const login = new Login({
  usersPath: 'quiver-functions/users',
  adminUsers: ['chris@chrisesplin.com']
});
exports.login = functions.database.ref('/queues/login/{uid}').onWrite(login.getFunction());