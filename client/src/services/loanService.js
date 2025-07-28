import axiosInstance from "../api/axiosInstance";

export const fetchLoans = async () => {
  const response = await axiosInstance.get("/loans");
  return response.data;
};
