'use client';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import apiClient from './api-client';

interface User {
  name: string;
  regNumber?: string;
  userType: 'MIT' | 'NON_MIT';
  personalEmail: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => void;
  checkUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserSession = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session check failed", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  // Use useMemo so the object reference doesn't change on every render
  const value = useMemo(() => ({
    user,
    loading,
    login: setUser,
    logout: () => setUser(null),
    checkUserSession
  }), [user, loading]); 

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};