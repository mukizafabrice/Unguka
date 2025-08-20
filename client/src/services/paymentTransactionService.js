import axiosInstance from "../api/axiosInstance";

export const fetchPaymentTransactions = async (cooperativeId = null) => {
  let url = "/paymentTransactions";
  if (cooperativeId) {
    url += `?cooperativeId=${cooperativeId}`; // Append cooperativeId only if provided (for superadmins)
  }
  const response = await axiosInstance.get(url);
  return response.data;
};

export const fetchPaymentTransactionsById = async (id) => {
  const response = await axiosInstance.get(`/paymentTransactions/${id}`);
  return response.data;
};
