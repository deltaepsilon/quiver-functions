const graphql = require('graphql');
const { GraphQLList, GraphQLObjectType, GraphQLString, GraphQLInt } = graphql;

module.exports = data => {
  const ItemType = new GraphQLObjectType({
    name: 'Item',
    description: 'An item',
    fields: () => ({
      i: { type: GraphQLInt },
      key: { type: GraphQLString },
      connections: {
        type: new GraphQLList(ItemType),
        resolve: item => {
          return Object.keys(item.connections).reduce((items, key) => {
            const item = data[key];
            item.key = key;
            items.push(item);
            return items;
          }, []);
        },
      },
    }),
  });

  return ItemType;
};
