import axiosInstance from "../api/axiosInstance";

const API_URL = "/stocks";

const handleResponse = (response) => {
  return { success: true, data: response.data.data || response.data, message: response.data.message || 'Operation successful' };
};

const handleError = (error, defaultMessage = "An unexpected error occurred.") => {
  console.error("Stock service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

export const fetchStocks = async (cooperativeId = null) => {
  try {
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get(API_URL, params);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch stocks.");
  }
};

export const fetchStockById = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return { success: false, message: "Cooperative ID is required to fetch stock details." };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`, { params: { cooperativeId } });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to fetch stock with ID ${id}.`);
  }
};

export const createStock = async (stockData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/register`, stockData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create stock.");
  }
};

export const updateStock = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update stock.");
  }
};

export const deleteStock = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return { success: false, message: "Cooperative ID is required to delete stock." };
  }
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`, { data: { cooperativeId } });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to delete stock with ID ${id}.`);
  }
};