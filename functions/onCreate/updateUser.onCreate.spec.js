describe('Login', function() {
  const admin = require('firebase-admin');
  const config = require('../config.json');

  admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount),
    databaseURL: config.firebase.databaseURL
  });

  const mocks = require('../../mocks/mocks');
  const UpdateUser = require('./updateUser.onCreate');

  const database = admin.database();

  const usersPath = 'quiver-functions/users';
  const usersRef = database.ref(usersPath);
  const userRef = usersRef.child(mocks.mockUser.uid);

  function cleanUp(done) {
    return Promise.all([usersRef.remove()]).then(() => done());
  }

  beforeEach(cleanUp);

  let updateUser, event;
  beforeEach(() => {
    updateUser = new UpdateUser({
      usersPath: usersPath,
      database
    });
    event = new mocks.MockAuthEvent(mocks.mockUser);
  });

  afterEach(cleanUp);

  it('should process auth updateUser', (done) => {
    const updateUserFunction = updateUser.getFunction();

    updateUserFunction(event).then(() => userRef.once('value')).then(snap => {
      const user = snap.val();

      expect(user.uid).toEqual(mocks.mockUser.uid);
      done();
    });
  });
});
