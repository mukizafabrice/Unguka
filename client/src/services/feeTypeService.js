// src/services/feeTypeService.js
import axiosInstance from "../api/axiosInstance"; // Ensure this path is correct

const API_URL = "/feeTypes"; // Base URL for fee type endpoints

// Helper to handle successful API responses consistently
const handleResponse = (response) => {
  return { success: true, data: response.data.data || response.data, message: response.data.message || 'Operation successful' };
};

// Helper to handle API errors consistently
const handleError = (error, defaultMessage = "An unexpected error occurred.") => {
  console.error("FeeType service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// --- Fee Type Management Functions ---

// Fetch all fee types
// Can accept a cooperativeId to filter fee types specific to a cooperative
export const fetchFeeTypes = async (cooperativeId = null) => {
  try {
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get(API_URL, params);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch fee types.");
  }
};

// Create a new fee type
// Requires feeTypeData to include cooperativeId
export const createFeeType = async (feeTypeData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/register`, feeTypeData); // Matches /register route
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create fee type.");
  }
};

// Update an existing fee type
// Requires feeTypeData to include cooperativeId for authorization
export const updateFeeType = async (id, feeTypeData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, feeTypeData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update fee type.");
  }
};

export const deleteFeeType = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return { success: false, message: "Cooperative ID is required to delete fee type." };
  }
  try {
    // Backend's deleteFeeType expects cooperativeId in req.body, so pass it in the 'data' property
    const response = await axiosInstance.delete(`${API_URL}/${id}`, { data: { cooperativeId } });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to delete fee type.");
  }
};
