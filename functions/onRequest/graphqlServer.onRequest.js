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
  constructor({ ref }) {
    this.ref = ref;
    this.localDataService = new LocalDataService({ ref });
    this.app = express();
  }

  start(generateSchema) {
    const data = this.localDataService.data;
    const schema = generateSchema(data);
    const observable = Rx.Observable.create(observer => {
      const logging = (req, res, next) => {
        const stream = {
          write: log => observer.next({ log }),
        };
        morgan('tiny')(req, res, next);
      };
      
      this.app.use('/graphql', [logging, bodyParser.json()], graphqlExpress({ schema, context: {} }));
      this.app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
      this.app.use('/schema', this.printSchema(schema));

      observer.next({ event: 'listening' });
    });

    return this.localDataService.listen().merge(observable);
  }

  printSchema(schema) {
    return (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(printSchema(schema));
    };
  }
};
