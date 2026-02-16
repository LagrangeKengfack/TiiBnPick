"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getClientById } from '@/services/clientService';

export interface User {
  token: string;
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  userType: 'ADMIN' | 'CLIENT' | 'LIVREUR';
  isActive: boolean;
  clientId?: string;
  deliveryPersonId?: string;
  rating?: number;
  totalDeliveries?: number;
  nationalId?: string;
  password?: string;
  memberSince?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
    refreshUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const refreshUser = async () => {
    if (!user || (!user.clientId && !user.id)) return;

    try {
      // Use clientId for clients, or id as fallback
      const targetId = user.clientId || user.id;
      const latestData = await getClientById(targetId);

      if (latestData) {
        const updatedUser: User = {
          ...user,
          ...latestData,
          // Ensure we keep the token from current state if not returned by fetch
          token: user.token
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fallback or better throw error if used outside Provider
    return { user: null, loading: false, login: () => { }, logout: () => { }, refreshUser: async () => { } } as AuthContextType;
  }
  return context;
};

export default AuthContext;
