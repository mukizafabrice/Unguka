import axiosInstance from "../api/axiosInstance";

export const fetchPayments = async () => {
  const response = await axiosInstance.get("/payments");
  return response.data;
};

export const createPayments = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/payments", paymentData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating payment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updatePayments = async (id, paymentData) => {
  try {
    const response = await axiosInstance.put(`/payments/${id}`, paymentData);
    return response.data;
  } catch (error) {
    console.error(
      `Error updating payment with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deletePayments = async (id) => {
  try {
    const response = await axiosInstance.delete(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting payment with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
