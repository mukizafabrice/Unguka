// frontend/src/services/purchaseOutService.js

import axiosInstance from "../api/axiosInstance";

const API_URL = "/purchaseOuts";

const handleResponse = (response) => ({
  success: true,
  data: response.data.data || response.data,
  message: response.data.message || "Operation successful",
});

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

export const fetchAllPurchaseOuts = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch all purchase-out records.");
  }
};

export const createPurchaseOut = async (purchaseOutData) => {
  try {
    const response = await axiosInstance.post(API_URL, purchaseOutData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create purchase-out record.");
  }
};

// Update a purchase-out record
// The backend will get the cooperativeId from the token
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

// Delete a purchase-out record
// The backend will get the cooperativeId from the token
export const deletePurchaseOut = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to delete purchase-out record.");
  }
};
