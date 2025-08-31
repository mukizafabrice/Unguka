// src/services/salesService.js
import axiosInstance from "../api/axiosInstance";

const API_URL = "/sales"; // Base URL for sales endpoints

// Helper to handle successful API responses consistently (existing)
const handleResponse = (response) => {
  return {
    success: true,
    data: response.data.data || response.data,
    message: response.data.message || "Operation successful",
  };
};

// Helper to handle API errors consistently (existing)
const handleError = (
  error,
  defaultMessage = "An unexpected error occurred."
) => {
  console.error("Sales service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// --- Sales Management Functions (existing) ---

// Get all sales
export const fetchAllSales = async (cooperativeId = null) => {
  try {
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get(API_URL, params);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch sales records.");
  }
};

// Get a single sale by ID
export const fetchSaleById = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to fetch sale details.",
    };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`, {
      params: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to fetch sale with ID ${id}.`);
  }
};

// Get sales by phone number
export const fetchSalesByPhoneNumber = async (phoneNumber, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to fetch sales by phone number.",
    };
  }
  try {
    const response = await axiosInstance.get(
      `${API_URL}/phone/${phoneNumber}`,
      { params: { cooperativeId } }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      `Failed to fetch sales for phone number ${phoneNumber}.`
    );
  }
};

// Create a new sales record
export const createSale = async (saleData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/register`, saleData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create sale record.");
  }
};

// Update a sales record by ID
export const updateSale = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to update sale with ID ${id}.`);
  }
};

// Update a sale's status to 'paid'
export const updateSaleToPaid = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to update sale status.",
    };
  }
  try {
    const response = await axiosInstance.patch(`${API_URL}/${id}/pay`, {
      cooperativeId,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to mark sale ${id} as paid.`);
  }
};

// Delete a sales record by ID
export const deleteSale = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to delete sale.",
    };
  }
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, `Failed to delete sale with ID ${id}.`);
  }
};

// salesService.js
export const downloadSalesPDF = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/pdf`, {
      responseType: "blob",
    });

    const pdfBlob = response.data;
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales_report.pdf";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error) {
    console.error("Failed to download sales PDF:", error);
    throw error;
  }
};

/**
 * Downloads an Excel report of sales, filtered by cooperative.
 * Aligns with the backend route: GET /api/sales/excel
 */
export const downloadSalesExcel = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/excel`, {
      // Corrected URL
      responseType: "blob", // Crucial for binary file downloads
    });

    // response.data is ALREADY a Blob object
    const excelBlob = response.data;

    const url = window.URL.createObjectURL(excelBlob); // Use the Blob directly
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sales_report.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Clean up the object URL
  } catch (error) {
    console.error("Failed to download sales Excel:", error);
    // You might want to throw the error or return a structured error response
    throw error;
  }
};
