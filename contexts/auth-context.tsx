"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AdminUser } from '@/types/auth';
import { login as authLogin, logout as authLogout, isAuthenticated, getCurrentAdmin, isAdmin as checkIsAdmin } from '@/lib/auth-utils';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; admin: AdminUser | null; isAdmin: boolean }>({
    isAuthenticated: false,
    admin: null,
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión al cargar
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const admin = getCurrentAdmin();
      const userIsAdmin = checkIsAdmin();
      setAuthState({
        isAuthenticated: authenticated,
        admin: admin,
        isAdmin: userIsAdmin,
      });
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const success = authLogin(email, password);
    if (success) {
      const admin = getCurrentAdmin();
      const userIsAdmin = checkIsAdmin();
      setAuthState({
        isAuthenticated: true,
        admin: admin,
        isAdmin: userIsAdmin,
      });
    }
    return success;
  };

  const logout = () => {
    authLogout();
    setAuthState({
      isAuthenticated: false,
      admin: null,
      isAdmin: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        admin: authState.admin,
        isAdmin: authState.isAdmin,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

