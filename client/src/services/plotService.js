// src/services/plotService.js
import axiosInstance from "../api/axiosInstance"; // Ensure this path is correct relative to this file

const API_URL = "/plots"; // Base URL for plot endpoints

// Helper to handle successful API responses consistently
const handleResponse = (response) => {
  // Assuming successful responses from your backend controllers often have a 'data' key
  return {
    success: true,
    data: response.data.data || response.data,
    message: response.data.message || "Operation successful",
  };
};

// Helper to handle API errors consistently
const handleError = (
  error,
  defaultMessage = "An unexpected error occurred."
) => {
  console.error("Plot service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// --- Plot Management Functions ---

// Get all plots
// Can accept userId and cooperativeId to filter plots specific to a member/cooperative
export const fetchPlots = async (userId = null, cooperativeId = null) => {
  try {
    const params = {};
    if (userId) {
      params.userId = userId;
    }
    if (cooperativeId) {
      params.cooperativeId = cooperativeId;
    }

    const response = await axiosInstance.get(API_URL, { params });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch plots.");
  }
};

// Get a single plot by ID
// Requires cooperativeId to be passed (e.g., from user context on frontend) for authorization
export const fetchPlotById = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to fetch plot details.",
    };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`, {
      params: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to fetch plot with ID ${id}.`);
  }
};

// Create a new plot
// Requires userId, cooperativeId, size, and upi in plotData
export const createPlot = async (plotData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/register`, plotData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create plot.");
  }
};

// Update a plot by ID
// Requires plotData to include cooperativeId for authorization
export const updatePlot = async (id, plotData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, plotData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update plot.");
  }
};

// Delete a plot by ID
// Requires cooperativeId to be passed (e.g., from user context on frontend) for authorization
export const deletePlot = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to delete plot.",
    };
  }
  try {
    // Backend's deletePlot expects cooperativeId in req.body, so pass it in the 'data' property
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to delete plot with ID ${id}.`);
  }
};
