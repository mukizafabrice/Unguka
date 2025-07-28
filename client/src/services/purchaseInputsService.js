import axiosInstance from "../api/axiosInstance";

export const fetchPurchaseInputs = async () => {
  const response = await axiosInstance.get("/purchaseInputs");
  return response.data;
};
