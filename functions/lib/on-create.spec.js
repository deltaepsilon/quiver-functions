describe('Login', function() {
  const admin = require('firebase-admin');
  const config = require('../config.json');

  admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount),
    databaseURL: config.firebase.databaseURL
  }, 'onCreateSpecApp');

  const mocks = require('../../mocks/mocks');
  const OnCreate = require('./on-create');

  const db = admin.database();

  const usersPath = 'quiver-functions/users';
  const usersRef = db.ref(usersPath);
  const userRef = usersRef.child(mocks.mockUser.uid);

  function cleanUp(done) {
    return Promise.all([usersRef.remove()]).then(done);
  }

  beforeEach(cleanUp);

  let onCreate, event;
  beforeEach(() => {
    onCreate = new OnCreate({
      usersPath: usersPath
    });
    event = new mocks.MockAuthEvent(mocks.mockUser);
  });

  afterEach(cleanUp);

  it('should process auth onCreate', (done) => {
    const onCreateFunction = onCreate.getFunction();

    onCreateFunction(event).then(() => userRef.once('value')).then(snap => {
      const user = snap.val();

      expect(user.uid).toEqual(mocks.mockUser.uid);
      done();
    });
  });
});
