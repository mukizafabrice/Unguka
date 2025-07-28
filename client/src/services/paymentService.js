import axiosInstance from "../api/axiosInstance";

export const fetchPayments = async () => {
  const response = await axiosInstance.get("/payments");
  return response.data;
};
