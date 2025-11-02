import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const register = async (data) => {
    try {
      const response = await api.post('/api/auth/register', data);
      toast.success(response.data.message || 'Registration successful! Check your email for OTP.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const sendOTP = async (email, name) => {
    try {
      const response = await api.post('/api/auth/send-otp', { email, name });
      toast.success('OTP sent to your email!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post('/api/auth/verify-otp', { email, otp });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Email verified successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const endpoint = credentials.phone 
        ? '/api/auth/login' 
        : '/api/auth/login-email';
      const response = await api.post(endpoint, credentials);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    register,
    sendOTP,
    verifyOTP,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

