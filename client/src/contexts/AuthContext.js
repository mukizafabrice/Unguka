import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(identifier, password);

      if (response.success) {
        setUser(response.user);
        setToken(response.token);

        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
      } else {
        setError(
          response.message || "Login failed. Please check your credentials."
        );
        setUser(null);
        setToken(null);
      }

      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();

    setUser(null);
    setToken(null);

    window.location.href = "/";
  };

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getToken();

    setUser(storedUser);
    setToken(storedToken);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        error,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
