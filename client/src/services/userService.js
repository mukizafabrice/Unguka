import axiosInstance from "../api/axiosInstance"; // Assuming axiosInstance sets up your base URL etc.

// Centralized error handling helper
const handleServiceResponse = (response) => {
  // For successful 2xx responses
  return {
    success: true,
    message: response.data.message || "Operation successful",
    data: response.data,
  };
};

const handleServiceError = (
  error,
  defaultMessage = "An unexpected error occurred."
) => {
  console.error("Service call failed:", error);
  let errorMessage = defaultMessage;
  let errorData = null;

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx (e.g., 400, 401, 500)
    errorMessage =
      error.response.data.message ||
      error.response.statusText ||
      defaultMessage;
    errorData = error.response.data; // Capture specific error data from backend
    console.error("Server Error Response Data:", error.response.data);
    console.error("Server Error Status:", error.response.status);
  } else if (error.request) {
    // The request was made but no response was received (e.g., network error)
    errorMessage =
      "No response from server. Please check your network connection.";
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message;
  }
  return { success: false, message: errorMessage, data: errorData };
};

// Get all users
export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get("/users");
    return {
      success: true,
      data: response.data,
      message: "Users fetched successfully",
    };
  } catch (error) {
    return handleServiceError(error, "Failed to fetch users.");
  }
};

// Get user by ID
export const fetchUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return {
      success: true,
      data: response.data,
      message: "User fetched successfully",
    };
  } catch (error) {
    return handleServiceError(error, `Failed to fetch user with ID ${id}.`);
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/users/register", userData);
    // Backend should ideally return 201 Created for this
    return handleServiceResponse(response);
  } catch (error) {
    return handleServiceError(
      error,
      "Failed to create user. Please try again."
    );
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return handleServiceResponse(response);
  } catch (error) {
    return handleServiceError(
      error,
      "Failed to update user. Please try again."
    );
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return handleServiceResponse(response);
  } catch (error) {
    return handleServiceError(
      error,
      "Failed to delete user. Please try again."
    );
  }
};

// Change profile image
export const changeProfileImage = async (id, formData) => {
  try {
    const response = await axiosInstance.put(
      `/users/${id}/profile-image`,
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

// Change password
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

export const updateAdmin = async (id) => {
  const response = await axiosInstance.put(`/users/${id}/admin`);
  return response.data;
};
