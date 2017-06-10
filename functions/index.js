const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = functions.config();

admin.initializeApp(config.firebase);

const UpdateUser = require('./onCreate/updateUser.onCreate');
const updateUser = new UpdateUser({
  usersPath: 'quiver-functions/users',
  database: admin.database(),
});
exports.updateUser = functions.auth.user().onCreate(updateUser.getFunction());

const Login = require('./onWrite/login.onWrite');
const login = new Login({
  usersPath: 'quiver-functions/users',
  adminUsers: ['chris@chrisesplin.com'],
  auth: admin.auth()
});
exports.login = functions.database.ref('quiver-functions/queues/current-user/{uid}').onWrite(login.getFunction());

const Environment = require('./onRequest/environment.onRequest');
const environment = new Environment({ config });
exports.environment = functions.https.onRequest(environment.getFunction());
