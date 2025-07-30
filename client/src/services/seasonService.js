import axiosInstance from "../api/axiosInstance";

export const fetchSeasons = async () => {
  const response = await axiosInstance.get("/seasons");
  return response.data;
};

export const createSeasons = async (seasonData) => {
  try {
    const response = await axiosInstance.post("/seasons", seasonData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating season:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateSeasons = async (id, seasonData) => {
  try {
    const response = await axiosInstance.put(`/seasons/${id}`, seasonData);
    return response.data;
  } catch (error) {
    console.error(
      `Error updating season with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
export const deleteSeasons = async (id) => {
  try {
    const response = await axiosInstance.delete(`/seasons/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting season with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getSeasonById = async (id) => {
  try {
    const response = await axiosInstance.get(`/seasons/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching season with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
