import axiosInstance from "../api/axiosInstance";
export const fetchLoanTransactions = async (id) => {
  const response = await axiosInstance.get(`loanTransactions/${id}`);
  return response.data;
};

export const fetchLoanTransactionsById = async (id) => {
  const response = await axiosInstance.get(`/loanTransactions/${id}`);
  return response.data;
};
