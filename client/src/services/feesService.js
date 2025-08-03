import axiosInstance from "../api/axiosInstance";

const API_BASE_URL = "/fees"; 

// Fetch all fees (for admin view)
export const fetchAllFees = async () => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all fees:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Record a new payment
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

// Update an existing fee record
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

// Delete a fee record
export const deleteFee = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting fee:", error.response?.data || error.message);
    throw error;
  }
};
