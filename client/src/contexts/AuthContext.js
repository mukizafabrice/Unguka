// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(false);

  const login = async (phoneNumber, password) => {
    setLoading(true);
    const response = await authService.login(phoneNumber, password);
    if (response.success) {
      setUser(response.user);
      setToken(response.token);
    }
    setLoading(false);
    return response; // UI can handle success/failure messages here
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    // On mount, sync state with localStorage (useful for page refresh)
    setUser(authService.getCurrentUser());
    setToken(authService.getToken());
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
