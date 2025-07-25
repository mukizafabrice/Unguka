import axios from "axios";

const API_URL = "http://localhost:8000/api/users/login"; // Update to deployed URL when needed

// Login function
const login = async (phoneNumber, password) => {
  try {
    const response = await axios.post(API_URL, { phoneNumber, password });

    // Store token and user data in localStorage
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { success: true, user, token };
  } catch (error) {
    const message =
      error.response?.data?.message || "Login failed. Please try again.";
    return { success: false, message };
  }
};

// Logout function
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Get logged-in user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

const authService = {
  login,
  logout,
  getToken,
  getCurrentUser,
};

export default authService;
