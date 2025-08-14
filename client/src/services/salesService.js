// src/services/salesService.js
import axiosInstance from "../api/axiosInstance"; // Ensure this path is correct relative to this file

const API_URL = "/sales"; // Base URL for sales endpoints

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
  console.error("Sales service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// --- Sales Management Functions ---

// Get all sales
// Can accept a cooperativeId to filter sales specific to a cooperative
export const fetchAllSales = async (cooperativeId = null) => {
  // Renamed from fetchSales to fetchAllSales for clarity
  try {
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get(API_URL, params);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch sales records.");
  }
};

// Get a single sale by ID
// Requires cooperativeId to be passed (e.g., from user context on frontend) for authorization
export const fetchSaleById = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to fetch sale details.",
    };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`, {
      params: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to fetch sale with ID ${id}.`);
  }
};

// Get sales by phone number
// Requires cooperativeId to be passed for authorization
export const fetchSalesByPhoneNumber = async (phoneNumber, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to fetch sales by phone number.",
    };
  }
  try {
    const response = await axiosInstance.get(
      `${API_URL}/phone/${phoneNumber}`,
      { params: { cooperativeId } }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      `Failed to fetch sales for phone number ${phoneNumber}.`
    );
  }
};

// Create a new sales record
// Requires cooperativeId in saleData
export const createSale = async (saleData) => {
  // Renamed from createSales to createSale for consistency
  try {
    // The route for creating sales is /sales/register as per salesRoutes.js
    const response = await axiosInstance.post(`${API_URL}/register`, saleData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create sale record.");
  }
};

// Update a sales record by ID
// Requires cooperativeId in data
export const updateSale = async (id, data) => {
  // Renamed from updateSales to updateSale
  try {
    // The backend updateSale expects cooperativeId in req.body
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to update sale with ID ${id}.`);
  }
};

// Update a sale's status to 'paid'
// Requires cooperativeId in data
export const updateSaleToPaid = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to update sale status.",
    };
  }
  try {
    // The backend updateSaleToPaid expects cooperativeId in req.body
    const response = await axiosInstance.patch(`${API_URL}/${id}/pay`, {
      cooperativeId,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to mark sale ${id} as paid.`);
  }
};

// Delete a sales record by ID
// Requires cooperativeId in data
export const deleteSale = async (id, cooperativeId) => {
  // Renamed from deleteSales to deleteSale
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to delete sale.",
    };
  }
  try {
    // The backend deleteSale expects cooperativeId in req.body, so pass it in the 'data' property
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to delete sale with ID ${id}.`);
  }
};
