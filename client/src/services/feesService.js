// services/feesService.js
import axiosInstance from "../api/axiosInstance";
// file-saver is no longer strictly needed if using the native browser download method
// import { saveAs } from "file-saver";

const API_BASE_URL = "/fees";

// --- Fees Retrieval Services ---

/**
 * Fetches all fee records for the user's cooperative.
 * Aligns with the backend route: GET /api/fees
 * cooperativeId is obtained from the backend via token, not in URL.
 */
export const fetchAllFees = async () => {
  // Removed cooperativeId parameter as it's from token
  try {
    const response = await axiosInstance.get(API_BASE_URL); // Corrected endpoint
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching all fees:`, // Updated log message
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetches all fee records for a specific user.
 * Aligns with the backend route: GET /api/fees/user/:userId
 */
export const fetchAllFeesById = async (userId) => {
  // Parameter named userId for clarity
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching all fees for user ${userId}:`, // Updated log message
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetches fee records for a specific user and season within the user's cooperative.
 * Aligns with the backend route: GET /api/fees/user/:userId/season/:seasonId
 * cooperativeId is obtained from the backend via token, not in URL.
 */
export const fetchFeesByUserAndSeason = async (
  userId, // Removed cooperativeId parameter as it's from token
  seasonId
) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/user/${userId}/season/${seasonId}` // Corrected endpoint
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

// --- Fees Management Services ---

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
 * Aligns with the backend route: DELETE /api/fees/:id
 */
export const deleteFee = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting fee:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Adds a payment amount to an existing fee record.
 * Aligns with the backend route: PUT /api/fees/pay/:feeId
 */
export const addPaymentToFee = async (feeId, paymentAmount) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/pay/${feeId}`, {
      paymentAmount,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error adding payment to fee:",
      error.response?.data || error.message
    );
    throw error;
  }
};

<hr />;

export const downloadFeesPDF = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/pdf`, {
      responseType: "blob", // This is crucial for binary file downloads
    });

    // The response.data is already a Blob object.
    const pdfBlob = response.data;

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(pdfBlob);

    // Create a temporary link element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "fees_report.pdf"; // The default filename
    document.body.appendChild(a);
    a.click(); // Programmatically click the link to start the download

    // Clean up the temporary URL and element to free up memory
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};

export const downloadFeesExcel = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/excel`, {
      responseType: "blob", // Crucial for binary file downloads
    });

    const excelBlob = response.data; // response.data is already a Blob
    const url = window.URL.createObjectURL(excelBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "fees_report.xlsx"; // Suggested filename
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url); // Clean up the URL
    a.remove();
  } catch (error) {
    console.error("Error downloading Excel:", error);
    throw error;
  }
};
