import axiosInstance from "../api/axiosInstance";
export const fetchPaymentTransactions = async () => {
  const response = await axiosInstance.get("/paymentTransactions");
  return response.data;
};
