import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      authService.logout().catch(() => {});
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Check token and restore profile on initial load
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const res = await authService.getProfile();
          if (isMounted) {
            setUser(res.data.user);
            setToken(storedToken);
          }
        } catch (err) {
          if (isMounted) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            setToken(null);
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const newToken = res.data.token;
    const newUser = res.data.user;

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user_info', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const newToken = res.data.token;
    const newUser = res.data.user;

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user_info', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
