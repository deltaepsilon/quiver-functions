const LocalDataService = require('./localData.service');
const admin = require('firebase-admin');
const config = require('../config.json');

admin.initializeApp({
  databaseURL: config.firebase.databaseURL,
  credential: admin.credential.cert(config.firebase.serviceAccount),
});

describe('GraphQLServer', () => {
  const GeneratorUtility = require('../../utilities/generator.utility');
  const ref = admin.database().ref('test/localData');
  const itemsCount = 5;
  const connectionsCount = 3;
  beforeAll(done => {
    const generatorUtility = new GeneratorUtility({ ref });
    generatorUtility.generateIfNeeded(itemsCount, connectionsCount).then(done, done.fail);
  });

  let service;
  beforeEach(() => {
    service = new LocalDataService({ ref });
  });

  it('listen', done => {
    service
      .listen()
      .filter(x => x.event == 'ready')
      .take(1)
      .subscribe(e => {
        let totalConnections = 0;

        service.data.forEach(item => {
          totalConnections += Object.keys(item.connections).length;
        });

        expect(service.data.size).toEqual(itemsCount);
        expect(totalConnections).toEqual(itemsCount * connectionsCount);
        done();
      });
  });

  it('child_changed', done => {
    const observable = service.listen();

    observable.filter(x => x.event == 'child_changed').take(1).subscribe(e => {
      expect(e.value.changed).toEqual(true);
      done();
    });

    observable.filter(x => x.event == 'ready').take(1).subscribe(e => {
      ref.child(e.key).update({ changed: true });
    });
  });

  it('child_removed', done => {
    const observable = service.listen();
    let lastKey;

    observable.filter(x => x.event == 'child_removed').take(1).subscribe(e => {
      expect(e.key).toEqual(lastKey);
      done();
    });

    observable.filter(x => x.event == 'ready').take(1).subscribe(e => {
      lastKey = e.key;
      ref.child(e.key).remove();
    });
  });
});
