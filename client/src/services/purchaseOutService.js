import axiosInstance from "../api/axiosInstance";

export const fetchPurchaseOut = async () => {
  const response = await axiosInstance.get("/purchaseOuts");
  return response.data;
};

export const createPurchaseOut = async (purchaseData) => {
  const response = await axiosInstance.post("/purchaseOuts", purchaseData);
  return response.data;
};
export const updatePurchaseOut = async (id, data) => {
  const response = await axiosInstance.put(`/purchaseOuts/${id}`, data);
  return response.data;
};
export const deletePurchaseOut = async (id) => {
  try {
    const response = await axiosInstance.delete(`/purchaseOuts/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting purchase out with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error; // Re-throw the error to be handled by the calling function
  }
};
