import axios from "axios";
// const API_URL = `${process.env.REACT_APP_API_URL}/api`;
const API_URL = "http://172.20.10.2:8000/api";
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized request. Logging out user.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
