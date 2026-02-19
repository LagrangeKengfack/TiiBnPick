"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getClientById } from '@/services/clientService';
import { getDeliveryPerson } from '@/services/deliveryPersonService';

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
  street?: string;
  city?: string;
  commercialName?: string;
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
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Trigger a refresh with the parsed user if possible, 
        // or just let the next render's effect handle it.
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Trigger refresh when user is first loaded
  useEffect(() => {
    if (user && !loading) {
      refreshUser();
    }
  }, [loading]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Use window.location.href to force a full page reload and clear all memory state
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.push('/');
    }
  };

  const refreshUser = async () => {
    if (!user || (!user.clientId && !user.id)) return;

    try {
      let latestData;
      if (user.userType === 'LIVREUR' && user.deliveryPersonId) {
        latestData = await getDeliveryPerson(user.deliveryPersonId);
      } else if (user.userType === 'CLIENT') {
        const targetId = user.clientId || user.id;
        latestData = await getClientById(targetId);
      }

      if (latestData) {
        const updatedUser: User = {
          ...user,
          ...latestData,
          // Map backend 'id' (deliveryPersonId or clientId) to the correct field
          // and keep the original person 'id'
          id: user.id,
          deliveryPersonId: user.userType === 'LIVREUR' ? (latestData.id || user.deliveryPersonId) : user.deliveryPersonId,
          clientId: user.userType === 'CLIENT' ? (latestData.id || user.clientId) : user.clientId,
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
