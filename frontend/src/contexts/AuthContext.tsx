import React, { createContext, useContext, useState, useCallback } from 'react';
import type { IUser } from '../types/user';
import { loginRequest, registerRequest, updateMeRequest } from '../api/auth.api';
import api from '../api/axiosInstance'; //

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean; // Now derived from presence of user
}

interface AuthContextType extends AuthState {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Rehydrate session: we only keep user data, token is in HttpOnly cookie */
const loadStoredAuth = (): { user: IUser | null } => {
  try {
    const raw = localStorage.getItem('auth_user');
    const user: IUser | null = raw ? (JSON.parse(raw) as IUser) : null;
    return { user };
  } catch {
    return { user: null };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<{ user: IUser | null }>(loadStoredAuth);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await loginRequest(email, password);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setAuth({ user });
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { user } = await registerRequest(email, password, name);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setAuth({ user });
  }, []);

  const updateName = useCallback(async (name: string) => {
    const { user } = await updateMeRequest(name);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setAuth({ user });
  }, []);

  const logout = useCallback(async () => {
    try {
      // NEW: Notify backend to clear the cookie
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token'); // Clean up old leftovers
      setAuth({ user: null });
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user: auth.user,
      isAuthenticated: !!auth.user,
      isAdmin: auth.user?.role === 'ADMIN',
      login,
      register,
      updateName,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};