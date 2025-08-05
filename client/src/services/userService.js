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
  const response = await axiosInstance.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

export const changePassword = async (id, passwordData) => {
  try {
    const response = await axiosInstance.put(
      `/users/change-password/${id}`,
      passwordData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error changing password for user with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
// Change profile image
export const changeProfileImage = async (id, formData) => {
  try {
    const response = await axiosInstance.put(
      `/users/user/${id}/profile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error changing profile image for user with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
