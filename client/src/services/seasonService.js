import axiosInstance from "../api/axiosInstance";

export const fetchSeasons = async () => {
  const response = await axiosInstance.get("/seasons");
  return response.data;
};
