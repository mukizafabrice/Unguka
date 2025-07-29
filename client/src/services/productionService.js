import axiosInstance from "../api/axiosInstance";

export const fetchProductions = async () => {
  const response = await axiosInstance.get("/productions");
  return response.data;
};

export const createProduction = async (productionData) => {
  const response = await axiosInstance.post("/productions", productionData);
  return response.data;
};
export const updateProduction = async (id, data) => {
  const response = await axiosInstance.put(`/productions/${id}`, data);
  return response.data;
};

export const deleteProduction = async (id) => {
  try {
    const response = await axiosInstance.delete(`/productions/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting production with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error; // Re-throw the error to be handled by the calling function
  }
};
