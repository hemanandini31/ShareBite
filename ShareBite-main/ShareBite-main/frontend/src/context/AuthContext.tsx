import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthResponse } from '../types';

interface AuthContextType {
  user: AuthResponse | null;
  login: (userData: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Normalize role if it has ROLE_ prefix
        if (parsedUser.role && parsedUser.role.startsWith('ROLE_')) {
          parsedUser.role = parsedUser.role.replace('ROLE_', '');
        }
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from local storage", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: AuthResponse) => {
    // Normalize role before saving
    if (userData.role && userData.role.startsWith('ROLE_')) {
      userData.role = userData.role.replace('ROLE_', '') as any;
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
