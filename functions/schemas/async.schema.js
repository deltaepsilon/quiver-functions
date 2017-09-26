const graphql = require('graphql');
const { GraphQLSchema} = graphql;

module.exports = args => {
  const query = require('./types/async.type')(args);
  return new GraphQLSchema({ query });
};
