import axios from "axios";

// This URL is for your login endpoint
const LOGIN_URL = "http://192.168.43.129:8000/api/users/login";

const login = async (identifier, password) => {
  try {
    // The backend is expecting 'identifier' and 'password' keys
    const payload = { identifier, password };

    const response = await axios.post(LOGIN_URL, payload);

    if (response.data) {
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return { success: true, user, token };
    }
  } catch (error) {
    const message =
      error.response?.data?.message || "Login failed. Please try again.";
    return { success: false, message };
  }
};

// ... (rest of the service remains the same)

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
  } catch (e) {
    console.error("Failed to parse user data from localStorage:", e);
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
