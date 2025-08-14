// src/services/seasonService.js
import axiosInstance from "../api/axiosInstance";

const API_URL = "/seasons";

const handleResponse = (response) => {
  return {
    success: true,
    data: response.data.data || response.data,
    message: response.data.message || "Operation successful",
  };
};

const handleError = (
  error,
  defaultMessage = "An unexpected error occurred."
) => {
  console.error("Season service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

export const fetchSeasons = async (cooperativeId = null) => {
  try {
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get(API_URL, params);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch seasons.");
  }
};

export const fetchSeasonById = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to fetch season details.",
    };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`, {
      params: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to fetch season with ID ${id}.`);
  }
};

export const createSeason = async (seasonData) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/register`,
      seasonData
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create season.");
  }
};

export const updateSeason = async (id, seasonData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, seasonData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update season.");
  }
};

export const deleteSeason = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to delete season.",
    };
  }
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to delete season with ID ${id}.`);
  }
};
