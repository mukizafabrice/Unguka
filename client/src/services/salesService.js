import axiosInstance from "../api/axiosInstance";

export const fetchSales = async () => {
  const response = await axiosInstance.get("/sales");
  return response.data;
};
export const createSales = async () => {
  const response = await axiosInstance.post("/sales");
  return response.data;
};
