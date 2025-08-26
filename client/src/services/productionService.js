import axiosInstance from "../api/axiosInstance";

const API_URL = "/productions";

// Helper to handle successful API responses consistently
const handleResponse = (response) => {
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
  console.error("Production service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// Get all productions
// Can accept cooperativeId to filter productions specific to a cooperative (for managers)
export const fetchAllProductions = async (cooperativeId = null) => {
  // Renamed from fetchProductions
  try {
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get(API_URL, params);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch all productions.");
  }
};

// Get productions by specific userId and seasonId within a cooperative
export const fetchProductionsByUserSeason = async (
  userId,
  seasonId,
  cooperativeId
) => {
  // Renamed from fetchProduction
  if (!userId || !seasonId || !cooperativeId) {
    return {
      success: false,
      message:
        "User ID, Season ID, and Cooperative ID are required to fetch productions.",
    };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/by-user-season`, {
      params: { userId, seasonId, cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to fetch productions by user and season."
    );
  }
};

// Get all productions for a specific user (by ID) within a cooperative
export const fetchProductionsById = async (id) => {
  const response = await axiosInstance.get(`/productions/${id}`);
  return response.data;
};

// Create a new production
// Requires productionData to include cooperativeId
export const createProduction = async (productionData) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/register`,
      productionData
    ); // Matches /register route
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create production.");
  }
};

// Update a production by ID
// Requires data to include cooperativeId for authorization
export const updateProduction = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update production.");
  }
};

// Delete a production by ID
// Requires cooperativeId to be passed in the request body for authorization
export const deleteProduction = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to delete production.",
    };
  }
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    }); // Pass cooperativeId in data
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to delete production.");
  }
};

export const getProductions = async () => {
  const response = await axiosInstance.get(`${API_URL}/productions`);
  return response.data;
};
