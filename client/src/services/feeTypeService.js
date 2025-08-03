import axiosInstance from "../api/axiosInstance";

// Fetch all fee types
export const fetchFeeTypes = async () => {
  try {
    const response = await axiosInstance.get("/feeTypes");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching fee types:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Create a new fee type
export const createFeeType = async (feeTypeData) => {
  try {
    const response = await axiosInstance.post("/feeTypes", feeTypeData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating fee type:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Update an existing fee type
export const updateFeeType = async (id, feeTypeData) => {
  try {
    const response = await axiosInstance.put(`/feeTypes/${id}`, feeTypeData);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating fee type:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Delete a fee type
export const deleteFeeType = async (id) => {
  try {
    const response = await axiosInstance.delete(`/feeTypes/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting fee type:",
      error.response?.data || error.message
    );
    throw error;
  }
};
