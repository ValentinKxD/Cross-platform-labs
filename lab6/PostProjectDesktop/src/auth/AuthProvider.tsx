import { useState, type ReactNode } from 'react';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { ME, type User } from '../graphql';
import { AuthContext } from './AuthContext';
import { clearToken, getToken, saveToken } from './storage';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [hasToken, setHasToken] = useState(() => getToken() !== null);
  const { data, loading } = useQuery(ME, { skip: !hasToken });

  const signIn = (token: string, user: User, remember: boolean) => {
    saveToken(token, remember);
    client.writeQuery({ query: ME, data: { me: user } });
    setHasToken(true);
  };

  const signOut = () => {
    clearToken();
    setHasToken(false);
    client.clearStore();
  };

  return (
    <AuthContext.Provider value={{ user: hasToken ? data?.me ?? null : null, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
