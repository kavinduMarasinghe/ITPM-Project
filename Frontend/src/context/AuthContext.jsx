import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('eventaura_token');
    const savedUser = localStorage.getItem('eventaura_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('eventaura_token', res.data.token);
      localStorage.setItem('eventaura_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.data.message);
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('eventaura_token', res.data.token);
      localStorage.setItem('eventaura_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.data.message);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('eventaura_token');
    localStorage.removeItem('eventaura_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
