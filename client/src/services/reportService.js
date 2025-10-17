import axiosInstance from "../api/axiosInstance";

// Get manager report for cooperative
export const getManagerReport = async (cooperativeId, seasonId = null) => {
  try {
    const query = seasonId ? `&seasonId=${seasonId}` : "";
    const response = await axiosInstance.get(`/reports/manager?cooperativeId=${cooperativeId}${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching manager report:", error);
    throw error;
  }
};

// Get member report for personal activities
export const getMemberReport = async (seasonId = null) => {
  try {
    const query = seasonId ? `?seasonId=${seasonId}` : "";
    const response = await axiosInstance.get(`/reports/member${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching member report:", error);
    throw error;
  }
};

// Download manager report as Word document
export const downloadManagerReportWord = async (cooperativeId, seasonId = null) => {
  try {
    const query = seasonId ? `&seasonId=${seasonId}` : "";
    const response = await axiosInstance.get(`/reports/manager/download-word?cooperativeId=${cooperativeId}${query}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading manager report:", error);
    throw error;
  }
};

// Download member report as Word document
export const downloadMemberReportWord = async (seasonId = null) => {
  try {
    const query = seasonId ? `?seasonId=${seasonId}` : "";
    const response = await axiosInstance.get(`/reports/member/download-word${query}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading member report:", error);
    throw error;
  }
};