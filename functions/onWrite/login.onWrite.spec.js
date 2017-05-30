describe('Login', function() {
  const admin = require('firebase-admin');
  const config = require('../config.json');

  admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount),
    databaseURL: config.firebase.databaseURL
  });

  const mocks = require('../../mocks/mocks');
  const Login = require('./login.onWrite');

  const db = admin.database();

  const usersPath = 'quiver-functions/test/users';
  const usersRef = db.ref(usersPath);
  const uid = 'fake-uid'
  const userRef = usersRef.child(uid);


  const loginQueuePath = 'quiver-functions/test/queues/current-user';
  const loginQueueRef = db.ref(loginQueuePath);

  function cleanUp(done) {
    return Promise.all([usersRef.remove(), loginQueueRef.remove()]).then(done);
  }

  beforeEach(cleanUp);

  let login, event;
  beforeEach(() => {
    login = new Login({
      usersPath: usersPath,
      adminUsers: [mocks.mockUser.email]
    });
    event = new mocks.MockDBEvent(loginQueueRef, {uid: uid}, mocks.mockUser);
  });

  // afterEach(cleanUp);

  it('should process a user login queue item', (done) => {
    const loginFunction = login.getFunction();

    loginFunction(event).then(() => userRef.once('value')).then(snap => {
      const user = snap.val();

      expect(snap.key).toEqual(uid);
      done();
    });
  });
});
