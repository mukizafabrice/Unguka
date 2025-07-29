import axiosInstance from "../api/axiosInstance";

export const fetchCash = async () => {
  const response = await axiosInstance.get("/stocks/cash");
  return response.data;
};
export const fetchStock = async () => {
  const response = await axiosInstance.get("/stocks");
  return response.data;
};

export const createStock = async (stockData) => {
  const response = await axiosInstance.post("/stocks", stockData);
  return response.data;
};

export const updateStock = async (id, data) => {
  const response = await axiosInstance.put(`/stocks/${id}`, data);
  return response.data;
};
export const deleteStock = async (id) => {
  try {
    const response = await axiosInstance.delete(`/stocks/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting stock with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error; // Re-throw the error to be handled by the calling function
  }
};
