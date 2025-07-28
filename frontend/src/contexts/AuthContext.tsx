'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, API_URL } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  username: string;
  role?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiRequest('/api/auth/user');
      setUser(response.user);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      console.log('🔐 Starting primary registration process...', { email, username });
      
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });
      
      console.log('✅ Primary registration successful');
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
    } catch (primaryError: unknown) {
      console.error('❌ Primary registration failed, trying fallback...', primaryError);
      
      try {
        console.log('🔄 Attempting fallback registration...');
        
        const fallbackData = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Fallback-Request': 'true',
            'X-Request-ID': `fallback-${Date.now()}`
          },
          body: JSON.stringify({ email, username, password }),
          signal: AbortSignal.timeout(30000)
        });
        
        if (!fallbackData.ok) {
          const errorText = await fallbackData.text();
          throw new Error(`Fallback registration failed: ${fallbackData.status} ${errorText}`);
        }
        
        const response = await fallbackData.json();
        console.log('✅ Fallback registration successful');
        localStorage.setItem('token', response.token);
        setUser(response.user);
        
      } catch (fallbackError: unknown) {
        const primaryMsg = primaryError instanceof Error ? primaryError.message : 'Unknown primary error';
        const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
        
        console.error('❌ Both primary and fallback registration failed:', {
          primaryError: primaryMsg,
          fallbackError: fallbackMsg
        });
        
        const errorMessage = `Registration failed: ${primaryMsg}. Fallback also failed: ${fallbackMsg}. Please try again or contact support.`;
        throw new Error(errorMessage);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
