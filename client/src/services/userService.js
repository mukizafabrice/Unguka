import axiosInstance from "../api/axiosInstance";

// Get all users
export const fetchUsers = async () => {
  const response = await axiosInstance.get("/users");
  return response.data;
};

// Get user by ID
export const fetchUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

// Create new user
export const createUser = async (userData) => {
  const response = await axiosInstance.post("/users/register", userData);
  return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`/users/update/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};
