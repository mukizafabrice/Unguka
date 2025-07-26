import axiosInstance from "../api/axiosInstance";

export const fetchProduct = async () => {
  const response = await axiosInstance.get("/products");
  return response.data;
};
