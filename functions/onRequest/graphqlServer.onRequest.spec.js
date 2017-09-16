const GraphQLServer = require('./graphqlServer.onRequest');
const admin = require('firebase-admin');
const config = require('../config.json');
const httpMocks = require('node-mocks-http');
const request = require('supertest');

admin.initializeApp({
  databaseURL: config.firebase.databaseURL,
  credential: admin.credential.cert(config.firebase.serviceAccount),
});

describe('GraphQLServer', () => {
  const GeneratorUtility = require('../../utilities/generator.utility');
  const ref = admin.database().ref('test/graphqlServer');
  const itemsCount = 5;
  const connectionsCount = 3;
  beforeAll(done => {
    const generatorUtility = new GeneratorUtility({ ref });
    generatorUtility.generateIfNeeded(itemsCount, connectionsCount).then(done, done.fail);
  });

  let server, schema, req, res;
  beforeEach(() => {
    const generator = require('../schemas/items.schema');

    schema = () => {
      return generator({
        one: { i: 1, connections: { two: true } },
        two: { i: 2, connections: { one: true } },
      });
    };
    server = new GraphQLServer({ ref });
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('printSchema', done => {
    start().then(() => {
      request(server.app)
        .get('/schema')
        .end((err, res) => {
          expect(res.text).toMatch('type');
          done();
        });
    });
  });

  it('graphqlMiddleware', done => {
    start().then(() => {
      request(server.app)
        .get('/graphql?query={items{i,key,connections{i}}}')
        .end((err, res) => {
          expect(res.text).toEqual(
            '{"data":{"items":[{"i":1,"key":"one","connections":[{"i":2}]},{"i":2,"key":"two","connections":[{"i":1}]}]}}'
          );
          done();
        });
    });
  });


  function start() {
    return new Promise(resolve => {
      const observable = server.start(schema);

      observable.filter(x => x.event == 'listening').subscribe(() => {
        resolve(observable);
      });
    });
  }
});
