import axiosInstance from "../api/axiosInstance";

const API_BASE_URL = "/fees";

export const fetchAllFees = async (cooperativeId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/${cooperativeId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all fees:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchAllFeesById = async (cooperativeId, userId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/user/${cooperativeId}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all fees by user ID:",
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
      `${API_BASE_URL}/${cooperativeId}/${userId}/${seasonId}`
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

export const deleteFee = async (id, cooperativeId) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`, {
      data: { cooperativeId },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting fee:", error.response?.data || error.message);
    throw error;
  }
};
