import { ApolloServer } from "@apollo/server";
import { User } from "./User";
import { GraphqlContext } from "../interfaces";

async function createApolloGraphqlServer() {
  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
      ${User.typeDefs}
      type Query {
        ${User.queries}
      }
      type Mutation {
        ${User.mutations}
      }
    `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
      Mutation: {
        ...User.resolvers.mutations,
      },
    },
  });

  await graphqlServer.start();

  return graphqlServer;
}

export default createApolloGraphqlServer;
