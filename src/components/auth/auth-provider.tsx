
'use client';

import type { User } from '@/lib/types';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; 
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      if (storedToken && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
        setToken(storedToken);
      }
    } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = async (token: string, userData: any) => {
    let finalUserData = { ...userData, access: [] };

    // Fetch access rights
    try {
      const accessResponse = await fetch(`${API_BASE_URL}/auth/access`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const accessResult = await accessResponse.json();
      if (accessResult.success && Array.isArray(accessResult.data)) {
        finalUserData.access = accessResult.data;
      }
    } catch (error) {
      console.error("Failed to fetch access rights", error);
      // Proceed with login but with empty access rights
    }

    localStorage.setItem('accessToken', token);
    localStorage.setItem('userData', JSON.stringify(finalUserData));
    setIsAuthenticated(true);
    setUser(finalUserData);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isNewUser');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, login, logout }}>
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
