import axiosInstance from "../api/axiosInstance";

export const fetchPlot = async () => {
  const response = await axiosInstance.get("/plots");
  return response.data;
};
// export const fetchStock = async () => {
//   const response = await axiosInstance.get("/stocks");
//   return response.data;
// };
