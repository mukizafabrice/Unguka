import axiosInstance from "../api/axiosInstance";

// ✅ The base URL is correct. All subsequent routes will build upon this.
const API_BASE_URL = "/fees";

export const fetchAllFees = async (cooperativeId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/${cooperativeId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching fees for coop ${cooperativeId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchAllFeesById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all fees:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchFeesByUserAndSeason = async (
  cooperativeId,
  userId,
  seasonId
) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/${cooperativeId}/user/${userId}/season/${seasonId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching fees by user and season:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Records a new payment.
 * Aligns with the backend route: POST /api/fees
 */
export const recordPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post(API_BASE_URL, paymentData);
    return response.data;
  } catch (error) {
    console.error(
      "Error recording payment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateFee = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/${id}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating fee:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteFee = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting fee:", error.response?.data || error.message);
    throw error;
  }
};

// Assuming you have an axios instance set up

export const addPaymentToFee = async (feeId, paymentAmount) => {
  try {
    const response = await axiosInstance.put(`/fees/pay/${feeId}`, {
      paymentAmount,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error adding payment to fee:",
      error.response?.data || error.message
    );
    throw error;
  }
};
