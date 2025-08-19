// In: src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  // IMPORTANT: Set your backend's base URL here.
  // This ensures all requests made with axiosInstance go to your API.
  baseURL: "http://localhost:8000/api", // Adjust to your actual backend URL
  timeout: 100000, // Optional: Request timeout in milliseconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: This runs BEFORE every request made with axiosInstance
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve token from local storage
    if (token) {
      // If a token exists, attach it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Return the modified config
  },
  (error) => {
    // Handle request errors (e.g., network issues before sending)
    return Promise.reject(error);
  }
);

// Response Interceptor (Optional, but good for global error handling)
// This can be used to handle 401s globally, e.g., redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If a 401 Unauthorized response comes back, you might want to log out the user
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized request. Logging out user.");
      // You might want to import your authService here and call logout()
      // e.g., import authService from './authService'; authService.logout();
      // Or dispatch a Redux action for logout
      // window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error); // Re-throw the error so it can be caught by individual service calls
  }
);

export default axiosInstance;
