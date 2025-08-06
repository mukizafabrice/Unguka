import axiosInstance from "../api/axiosInstance";
export const fetchLoanTransactions = async () => {
  const response = await axiosInstance.get("/loanTransactions");
  return response.data;
};
