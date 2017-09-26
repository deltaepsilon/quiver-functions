const graphql = require('graphql');
const { GraphQLList, GraphQLObjectType, GraphQLString } = graphql;

module.exports = ({ subject }) => {
  return new GraphQLObjectType({
    name: 'Query',
    description: 'The root of all... queries',
    fields: () => ({
      async: {
        type: new GraphQLList(GraphQLString),
        resolve: root => {
          const text = 'async finished';
          subject.next(text);
          return text;
        },
      }
    }),
  });
};
