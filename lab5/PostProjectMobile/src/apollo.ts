import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { getToken } from './auth/storage';
import { GRAPHQL_URL } from './config';

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
