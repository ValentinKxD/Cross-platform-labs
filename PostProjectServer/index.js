import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { getUserFromAuthHeader } from './auth.js';
import { connectDB } from './services/db.js';

const PORT = Number(process.env.PORT) || 4001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // У відповідях з помилками - лише повідомлення і код, без stacktrace
  includeStacktraceInErrorResponses: false,
});

try {
  await connectDB(process.env.MONGO_URI);
} catch (error) {
  console.error('Не вдалося підключитися до MongoDB:', error.message);
  process.exit(1);
}

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
  // Для кожного запиту визначаємо користувача за заголовком Authorization
  context: async ({ req }) => {
    const user = await getUserFromAuthHeader(req.headers.authorization);
    return { user };
  },
});

console.log(`GraphQL API PostProject запущено за адресою: ${url}`);
