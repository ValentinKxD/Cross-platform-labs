import { createContext, useContext } from 'react';
import type { User } from '../graphql';

export interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User, remember: boolean) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth має використовуватися всередині AuthProvider');
  return auth;
}
