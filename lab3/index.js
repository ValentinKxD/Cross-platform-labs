import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { getUserFromAuthHeader } from './auth.js';

const PORT = Number(process.env.PORT) || 4001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // У відповідях з помилками - лише повідомлення і код, без stacktrace
  includeStacktraceInErrorResponses: false,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
  // Для кожного запиту визначаємо користувача за заголовком Authorization
  context: async ({ req }) => {
    const user = getUserFromAuthHeader(req.headers.authorization);
    return { user };
  },
});

console.log(`GraphQL API PostProject запущено за адресою: ${url}`);
