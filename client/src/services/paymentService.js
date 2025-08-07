import axiosInstance from "../api/axiosInstance";

export const fetchPayments = async () => {
  const response = await axiosInstance.get("/payments");
  return response.data;
};

export const fetchPaymentById = async (id) => {
  const response = await axiosInstance.get(`/payments/${id}`);
  return response.data;
};

export const createPayment = async (paymentData) => {
  const response = await axiosInstance.post("/payments/process", paymentData);
  return response.data;
};

export const updatePayment = async (id, updatedData) => {
  const response = await axiosInstance.put(`/payments/${id}`, updatedData);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await axiosInstance.delete(`/payments/${id}`);
  return response.data;
};

export const fetchPaymentSummary = async (userId) => {
  const response = await axiosInstance.get(
    `/payments/summary?userId=${userId}`
  );
  return response.data;
};
