// src/services/purchaseInputService.js
import axiosInstance from "../api/axiosInstance"; // Ensure this path is correct

const API_URL = "/purchaseInputs"; // Base URL for purchase input endpoints

// Helper to handle successful API responses consistently
const handleResponse = (response) => {
  // Assuming successful responses from your backend controllers often have a 'data' key
  return {
    success: true,
    data: response.data.purchase || response.data,
    message: response.data.message || "Operation successful",
  };
};

// Helper to handle API errors consistently
const handleError = (
  error,
  defaultMessage = "An unexpected error occurred."
) => {
  console.error("PurchaseInput service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// --- Purchase Input Management Functions ---

// Get all purchase inputs
// Can accept cooperativeId and userId to filter purchase inputs
export const fetchPurchaseInputs = async (
  cooperativeId = null,
  userId = null
) => {
  try {
    const params = {};
    if (cooperativeId) {
      params.cooperativeId = cooperativeId;
    }
    if (userId) {
      params.userId = userId;
    }

    const response = await axiosInstance.get(API_URL, { params });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch purchase inputs.");
  }
};

// Get a single purchase input by ID
// Requires cooperativeId to be passed (e.g., from user context on frontend) for authorization
export const fetchPurchaseInputById = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to fetch purchase input details.",
    };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`, {
      params: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to fetch purchase input with ID ${id}.`);
  }
};

// Create a new purchase input
// Requires userId, productId, seasonId, quantity, unitPrice, amountPaid, interest, and cooperativeId in purchaseInputData
export const createPurchaseInput = async (purchaseInputData) => {
  try {
    // Note: The backend route is '/register' for POST
    const response = await axiosInstance.post(
      `${API_URL}/register`,
      purchaseInputData
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create purchase input.");
  }
};

// Update a purchase input by ID
// Requires purchaseInputData to include cooperativeId for authorization
export const updatePurchaseInput = async (id, purchaseInputData) => {
  try {
    const response = await axiosInstance.put(
      `${API_URL}/${id}`,
      purchaseInputData
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update purchase input.");
  }
};

// Delete a purchase input by ID
// Requires cooperativeId to be passed (e.g., from user context on frontend) for authorization
export const deletePurchaseInput = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to delete purchase input.",
    };
  }
  try {
    // Backend's deletePurchaseInput expects cooperativeId in req.body, so pass it in the 'data' property
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to delete purchase input with ID ${id}.`);
  }
};
