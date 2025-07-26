import axiosInstance from "../api/axiosInstance";

export const fetchProductions = async () => {
  const response = await axiosInstance.get("/productions");
  return response.data;
};
