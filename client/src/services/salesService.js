import axiosInstance from "../api/axiosInstance";

export const fetchSales = async () => {
  const response = await axiosInstance.get("/sales");
  
  return response.data;
};
export const createSales = async () => {
  const response = await axiosInstance.post("/sales");

  return response.data;
};
export const deleteSales = async (id) => {
  const response = await axiosInstance.delete(`/sales/${id}`);

  return response.data;
};

// src/services/salesService.js
export const updateSales = async (id, data) => {
  const response = await axiosInstance.put(`/sales/${id}`, data);
  return response.data;
};
