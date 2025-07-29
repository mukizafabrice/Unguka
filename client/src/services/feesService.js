import axiosInstance from "../api/axiosInstance";

export const fetchFees = async () => {
  const response = await axiosInstance.get("/fees");
  return response.data;
};

export const createFees = async (feesData) => {
  const response = await axiosInstance.post("/fees", feesData);
  return response.data;
};

export const updateFees = async (id, data) => {
  const response = await axiosInstance.put(`/fees/${id}`, data);
  return response.data;
};
export const payFees = async (id, data) => {
  const response = await axiosInstance.patch(`/fees/pay/${id}`, data);
  return response.data;
};

export const deleteFees = async (id) => {
  try {
    const response = await axiosInstance.delete(`/fees/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting fees with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
