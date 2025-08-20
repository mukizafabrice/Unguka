import axiosInstance from "../api/axiosInstance";

export const fetchCash = async (cooperativeId) => {
  try {
    const response = await axiosInstance.get(
      `/cash?cooperativeId=${cooperativeId}`
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    // Centralized error handling as used in other services
    console.error("Failed to fetch cash:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch cash balance.",
      statusCode: error.response?.status,
    };
  }
};
