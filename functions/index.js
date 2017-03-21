const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = functions.config();

admin.initializeApp(config.firebase);

const OnCreate = require('./lib/on-create');
const onCreate = new OnCreate({
  usersPath: 'quiver-functions/users',
  database: admin.database()
});
exports.onCreate = functions.auth.user().onCreate(onCreate.getFunction());

const Login = require('./lib/login');
const login = new Login({
  usersPath: 'quiver-functions/users',
  adminUsers: ['chris@chrisesplin.com']
});
exports.login = functions.database.ref('quiver-functions/queues/current-user/{uid}').onWrite(login.getFunction());