import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { getToken } from './auth/storage';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4001/';

const authLink = new SetContextLink(({ headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: GRAPHQL_URL })]),
  cache: new InMemoryCache(),
});
