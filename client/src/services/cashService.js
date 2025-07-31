import axiosInstance from "../api/axiosInstance";
export const fetchCash = async () => {
  const response = await axiosInstance.get("/cash");
  return response.data;
};
