import axiosInstance from "../api/axiosInstance";

export const fetchPurchaseInputs = async () => {
  const response = await axiosInstance.get("/purchaseInputs");
  return response.data;
};

export const fetchPurchaseInputsById = async (id) => {
  const response = await axiosInstance.get(`/purchaseInputs/${id}`);
  return response.data;
};
export const createPurchaseInputs = async (purchaseInputData) => {
  try {
    const response = await axiosInstance.post(
      "/purchaseInputs",
      purchaseInputData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating purchase input:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updatePurchaseInputs = async (id, purchaseInputData) => {
  try {
    const response = await axiosInstance.put(
      `/purchaseInputs/${id}`,
      purchaseInputData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating purchase input with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deletePurchaseInputs = async (id) => {
  try {
    const response = await axiosInstance.delete(`/purchaseInputs/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting purchase input with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
