import axiosInstance from "../api/axiosInstance";

const API_URL = "/purchase-out"; // Base URL for purchase-out endpoints, matches routes

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
  console.error("PurchaseOut service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// --- PurchaseOut Management Functions ---

// Fetch all purchase-out records
// Can be filtered by cooperativeId to get records specific to a cooperative
export const fetchAllPurchaseOuts = async (cooperativeId = null) => {
  try {
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get(API_URL, params);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch all purchase-out records.");
  }
};

// Fetch a single purchase-out record by ID
// Requires cooperativeId for authorization and data scoping
export const fetchPurchaseOutById = async (id, cooperativeId) => {
  if (!id || !cooperativeId) {
    return {
      success: false,
      message:
        "Purchase-out ID and Cooperative ID are required to fetch a record.",
    };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`, {
      params: { cooperativeId }, // Pass cooperativeId as a query parameter as expected by controller
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      `Failed to fetch purchase-out record with ID ${id}.`
    );
  }
};

// Create a new purchase-out record
// Expects purchaseData to include productId, seasonId, quantity, unitPrice, and cooperativeId
export const createPurchaseOut = async (purchaseOutData) => {
  try {
    const response = await axiosInstance.post(API_URL, purchaseOutData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create purchase-out record.");
  }
};

// Update a purchase-out record by ID
// Expects purchaseOutData to include cooperativeId in the body for authorization
export const updatePurchaseOut = async (id, purchaseOutData) => {
  try {
    const response = await axiosInstance.put(
      `${API_URL}/${id}`,
      purchaseOutData
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update purchase-out record.");
  }
};

// Delete a purchase-out record by ID
// Requires cooperativeId in the request body for authorization
export const deletePurchaseOut = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to delete purchase-out record.",
    };
  }
  try {
    // Pass cooperativeId in the 'data' property for DELETE requests to send it in the body
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to delete purchase-out record.");
  }
};
