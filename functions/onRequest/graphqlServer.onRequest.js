// Credit: https://codeburst.io/graphql-server-on-cloud-functions-for-firebase-ae97441399c0

const bodyParser = require('body-parser');
const morgan = require('morgan');
const Rx = require('rxjs/Rx');
const LocalDataService = require('../services/localData.service');
const express = require('express');
const graphqlServerExpress = require('graphql-server-express');
const graphqlExpress = graphqlServerExpress.graphqlExpress;
const graphiqlExpress = graphqlServerExpress.graphiqlExpress;
const schemaPrinter = require('graphql/utilities/schemaPrinter');
const printSchema = schemaPrinter.printSchema;

module.exports = class GraphQLServer {
  constructor({ ref, transform } = {}) {
    if (ref) {
      this.ref = ref;
      this.localDataService = new LocalDataService({ ref, transform });
    }
    this.app = express();
  }

  start(generateSchema) {
    const data = this.localDataService.data;
    const schema = generateSchema(data);
    const observable = this.listen(schema);

    return this.localDataService.listen().merge(observable);
  }

  listen(generatorOrSchema) {
    const subject = new Rx.Subject();
    const isGenerator = typeof generatorOrSchema == 'function';
    const schema = isGenerator ? generatorOrSchema({ subject }) : generatorOrSchema;
    
    const logger = this.getLogger(subject);
    
    this.app.use('/graphql', [logger, bodyParser.json()], graphqlExpress({ schema, context: {} }));
    this.app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
    this.app.use('/schema', this.printSchema(schema));
    return subject;
  }

  getLogger(subject) {
    return (req, res, next) => {
      const stream = {
        write: log => {
          subject.next({ log });
        },
      };
      morgan('tiny', { stream })(req, res, next);
    };
  }

  printSchema(schema) {
    return (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(printSchema(schema));
    };
  }
};
