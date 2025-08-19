import axiosInstance from "../api/axiosInstance";

// Fetch all announcements
export const fetchAnnouncements = async (cooperativeId) => {
  const response = await axiosInstance.get(
    `/announcements?cooperativeId=${cooperativeId}`
  );
  return response.data;
};

// Create a new announcement
export const createAnnouncement = async (announcementData) => {
  const response = await axiosInstance.post("/announcements", announcementData);
  return response.data;
};

// Get a single announcement by ID
export const getAnnouncementById = async (id) => {
  const response = await axiosInstance.get(`/announcements/${id}`);
  return response.data;
};

// Update an announcement
export const updateAnnouncement = async (id, updatedData) => {
  const response = await axiosInstance.put(`/announcements/${id}`, updatedData);
  return response.data;
};

// Delete an announcement
export const deleteAnnouncement = async (id) => {
  const response = await axiosInstance.delete(`/announcements/${id}`);
  return response.data;
};
