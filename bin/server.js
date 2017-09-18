const GraphQLServer = require('../functions/onRequest/graphqlServer.onRequest');
const admin = require('firebase-admin');
const config = require('../functions/config.json');
const graphql = require('graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

admin.initializeApp({
  databaseURL: config.firebase.databaseURL,
  credential: admin.credential.cert(config.firebase.serviceAccount),
});

const schema = require('../functions/schemas/items.schema');

const ref = admin.database().ref('test/graphqlServer');
const server = new GraphQLServer({ ref });

const observable = server.start(schema);

observable.filter(x => x.event == 'ready').subscribe(() => {
  console.log('ready!');
});

observable.filter(x => !!x.log).subscribe(x => console.log(x));

const port = 3333;

server.app.listen(port, () => console.log(`Listening on port ${port}`));
