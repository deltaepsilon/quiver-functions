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
  constructor({ ref, logger }) {
    this.ref = ref;
    this.localDataService = new LocalDataService({ ref });
    this.app = express();
    this.logger = logger;
  }

  start(generateSchema) {
    const data = this.localDataService.data;
    const schema = generateSchema(data);
    let observer;

    const observable = Rx.Observable.create(x => {
      observer = x;
      observer.next({ event: 'listening' });
    });

    const morganLogger = (req, res, next) => {
      const stream = {
        write: log => {
          if (observer) {
            observer.next({ log });
          }
        },
      };
      morgan('tiny', { stream })(req, res, next);
    };

    const middleware = [morganLogger, bodyParser.json()];

    if (this.logger) {
      middleware.unshift(this.logger);
    }

    this.app.use('/graphql', middleware, graphqlExpress({ schema, context: {} }));
    this.app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
    this.app.use('/schema', this.printSchema(schema));

    return this.localDataService.listen().merge(observable);
  }

  printSchema(schema) {
    return (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(printSchema(schema));
    };
  }
};
