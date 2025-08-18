import axiosInstance from "../api/axiosInstance";

// ✅ The base URL is correct. All subsequent routes will build upon this.
const API_BASE_URL = "/fees";

// =======================================================
// ✅ CORRECTED SERVICE FUNCTIONS
// =======================================================

/**
 * Fetches all fees for a specific cooperative.
 * Aligns with the backend route: GET /api/fees/:cooperativeId
 */
export const fetchAllFees = async (cooperativeId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/${cooperativeId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching fees for coop ${cooperativeId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches all fees for a specific user within a cooperative.
 * Aligns with the backend route: GET /api/fees/user/:cooperativeId/:userId
 */
export const fetchAllFeesById = async (cooperativeId, userId) => {
  try {
    // ✅ FIX: Corrected URL path to match the backend controller's expected route.
    const response = await axiosInstance.get(
      `${API_BASE_URL}/user/${cooperativeId}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all fees by user ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetches fees for a specific user and season within a cooperative.
 * Aligns with the backend route: GET /api/fees/:cooperativeId/user/:userId/season/:seasonId
 */
export const fetchFeesByUserAndSeason = async (
  cooperativeId,
  userId,
  seasonId
) => {
  try {
    // ✅ FIX: Corrected URL path to match the backend controller's expected route.
    const response = await axiosInstance.get(
      `${API_BASE_URL}/${cooperativeId}/user/${userId}/season/${seasonId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching fees by user and season:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Records a new payment.
 * Aligns with the backend route: POST /api/fees
 */
export const recordPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post(API_BASE_URL, paymentData);
    return response.data;
  } catch (error) {
    console.error(
      "Error recording payment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Updates an existing fee record.
 * Aligns with the backend route: PUT /api/fees/:id
 */
export const updateFee = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/${id}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating fee:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a fee record.
 * The backend now gets cooperativeId from the token. The frontend should NOT send it.
 * Aligns with the backend route: DELETE /api/fees/:id
 */
export const deleteFee = async (id) => {
  try {
    // ✅ FIX: The `cooperativeId` is no longer needed in the request body.
    // The backend now gets it securely from the user's token.
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting fee:", error.response?.data || error.message);
    throw error;
  }
};