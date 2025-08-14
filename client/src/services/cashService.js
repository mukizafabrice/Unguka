import axiosInstance from "../api/axiosInstance";

// ⭐ UPDATED: fetchCash now accepts a cooperativeId
export const fetchCash = async (cooperativeId) => {
  try {
    // If cooperativeId is provided, add it as a query parameter
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get("/cash", params);
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
