import { useEffect, useState, type ReactNode } from 'react';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { ME, type User } from '../graphql';
import { AuthContext } from './AuthContext';
import { clearToken, loadToken, saveToken } from './storage';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const { data, loading } = useQuery(ME, { skip: !hasToken });

  useEffect(() => {
    loadToken().then((token) => {
      setHasToken(token !== null);
      setReady(true);
    });
  }, []);

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
    <AuthContext.Provider value={{ user: hasToken ? data?.me ?? null : null, loading: !ready || loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
