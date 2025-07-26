import axiosInstance from "../api/axiosInstance";

export const fetchCash = async () => {
  const response = await axiosInstance.get("/stocks/cash");
  return response.data;
};
