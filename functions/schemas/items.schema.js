const graphql = require('graphql');
const { GraphQLSchema} = graphql;

module.exports = data => {
  const query = require('./types/itemsQuery.type')(data);
  return new GraphQLSchema({ query });
};
