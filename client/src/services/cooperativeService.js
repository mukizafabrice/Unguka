import axiosInstance from "../api/axiosInstance";

const API_URL = "/cooperatives"; // Base URL for cooperative endpoints

// Create a new cooperative
export const createCooperative = async (cooperativeData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}`, cooperativeData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create cooperative.",
    };
  }
};

// Get all cooperatives
export const getCooperatives = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch cooperatives.",
    };
  }
};

// Get a single cooperative by ID
export const getCooperativeById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch cooperative details.",
    };
  }
};

// Update a cooperative by ID
export const updateCooperative = async (id, cooperativeData) => {
  try {
    const response = await axiosInstance.put(
      `${API_URL}/${id}`,
      cooperativeData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update cooperative.",
    };
  }
};

// Delete a cooperative by ID
export const deleteCooperative = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete cooperative.",
    };
  }
};


