import axiosInstance from "../api/axiosInstance";

export const fetchFees = async () => {
  const response = await axiosInstance.get("/fees");
  return response.data;
};
