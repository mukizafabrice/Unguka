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

export const changePassword = async (id, currentPassword, newPassword) => {
  const token = localStorage.getItem("token");
  if (!token) {
    // It's good practice to throw a proper Error object.
    throw new Error("No authentication token found.");
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const body = {
    currentPassword,
    newPassword,
  };

  try {
    const response = await axiosInstance.put(
      `users/${id}/change-password`,
      body,
      config
    );
    // Return the successful response data.
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to change password.";

    // Throw a new Error object with the specific message.
    throw new Error(errorMessage);
  }
};
