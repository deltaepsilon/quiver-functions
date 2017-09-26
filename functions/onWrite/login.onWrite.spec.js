describe('Login', function() {
  const functions = require('firebase-functions');
  const admin = require('firebase-admin');
  const config = require('../config.json');

  admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount),
    databaseURL: config.firebase.databaseURL,
  });

  const mocks = require('../../mocks/mocks');
  const Login = require('./login.onWrite');

  const db = admin.database();

  const usersPath = 'quiver-functions/test/users';
  const usersRef = db.ref(usersPath);
  const uid = 'fake-uid';
  const userRef = usersRef.child(uid);

  const loginQueuePath = 'quiver-functions/test/queues/login';
  const loginQueueRef = db.ref(loginQueuePath);

  function cleanUp(done) {
    return Promise.all([usersRef.remove(), loginQueueRef.remove()]).then(() => done(), done.fail);
  }

  beforeEach(cleanUp);

  let login, func, app;
  beforeEach(() => {
    login = new Login({
      usersPath: usersPath,
      adminUsers: [mocks.mockUser.email],
      auth: admin.auth(),
    });

    func = login.getFunction();
    app = admin.app();
  });

  afterEach(cleanUp);

  describe('test', () => {
    it('should work', () => {
      expect(true).toEqual(true);
    });
  });

  describe('getFunction', () => {
    it('should handle a verification failure', done => {
      const event = new mocks.MockDBEvent({app, adminApp: app, delta: {token: 123}});
      spyOn(event.data.ref, 'update').and.returnValue(Promise.resolve());
      spyOn(login.auth, 'verifyIdToken').and.returnValue(Promise.reject(1));

      func(event).then(() => userRef.once('value')).then(done.fail).catch(err => {
        expect(err).toEqual(1);
        expect(event.data.ref.update.calls.allArgs()).toEqual([[{ error: 1 }]]);
        done();
      });
    });

    it('should update the user', done => {
      const event = new mocks.MockDBEvent({app, adminApp: app, delta: {token: 123}});
      const spy = jasmine.createSpy('spy');
      const token = { uid: 1, email: mocks.mockUser.email };
      spyOn(login, 'getUserRef').and.returnValue({ update: spy });
      spyOn(login.auth, 'verifyIdToken').and.returnValue(Promise.resolve(token));

      func(event)
        .then(payload => {
          const args = spy.calls.argsFor(0);
          const updatedUser = args[0];
          expect(typeof updatedUser.lastLogin).toEqual('number');
          expect(payload.isAdmin).toEqual(true);
          expect(typeof payload.lastLogin).toEqual('number');
          expect(payload.token).toEqual(token);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getUserRef', () => {
    it('should return ref with this.usersPath and uid', () => {
      const ref = db.ref('some/ridiculous/path');
      const uid = 123;
      const params = { environment: 'test' };
      expect(login.getUserRef({ ref, uid, params }).toString()).toMatch(
        new RegExp(`quiver-functions/test/users/${uid}`)
      );
    });
  });

  describe('admin', () => {
    let event, spy, token;
    beforeEach(() => {
      event = new mocks.MockDBEvent({app, adminApp: app, delta: {token: 123}});
      spy = jasmine.createSpy('spy');
      token = { uid: 1, email: mocks.mockUser.email };
      spyOn(login, 'getUserRef').and.returnValue({ update: spy });
      spyOn(login.auth, 'verifyIdToken').and.returnValue(Promise.resolve(token));
    });

    it('should set isAdmin: true when email matches', done => {
      func(event)
        .then(payload => {
          expect(payload.isAdmin).toEqual(true);
          done();
        })
        .catch(done.fail);
    });

    it('should set isAdmin: false when email does not match', done => {
      token.email = 'another-email';
      func(event)
        .then(payload => {
          expect(payload.isAdmin).toEqual(null);
          done();
        })
        .catch(done.fail);
    });
  });
});
