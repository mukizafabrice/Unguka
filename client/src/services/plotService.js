import axiosInstance from "../api/axiosInstance";

export const fetchPlot = async () => {
  const response = await axiosInstance.get("/plots");
  return response.data;
};
// export const fetchStock = async () => {
//   const response = await axiosInstance.get("/stocks");
//   return response.data;
// };
export const createPlot = async (plotData) => {
  const response = await axiosInstance.post("/plots", plotData);
  return response.data;
};
export const updatePlot = async (id, plotData) => {
  const response = await axiosInstance.put(`/plots/${id}`, plotData);
  return response.data;
};
export const deletePlot = async (id) => {
  try {
    const response = await axiosInstance.delete(`/plots/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting plot with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error; // Re-throw the error to be handled by the calling function
  }
};
