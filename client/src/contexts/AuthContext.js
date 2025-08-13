import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add an error state

  const login = async (identifier, password) => {
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await authService.login(identifier, password);

      if (response.success) {
        setUser(response.user);
        setToken(response.token);
      } else {
        // If login fails, set the error message
        setError(
          response.message || "Login failed. Please check your credentials."
        );
        setUser(null);
        setToken(null);
      }

      setLoading(false);
      return response;
    } catch (err) {
      // Handle network or unexpected errors
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setToken(authService.getToken());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        error, // Provide the error state
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
