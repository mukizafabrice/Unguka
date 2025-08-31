import axiosInstance from "../api/axiosInstance";

const API_URL = "/productions";

// Helper to handle successful API responses consistently
const handleResponse = (response) => {
  return {
    success: true,
    data: response.data.data || response.data,
    message: response.data.message || "Operation successful",
  };
};

// Helper to handle API errors consistently
const handleError = (
  error,
  defaultMessage = "An unexpected error occurred."
) => {
  console.error("Production service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// Get all productions
// Can accept cooperativeId to filter productions specific to a cooperative (for managers)
export const fetchAllProductions = async (cooperativeId = null) => {
  // Renamed from fetchProductions
  try {
    const params = cooperativeId ? { params: { cooperativeId } } : {};
    const response = await axiosInstance.get(API_URL, params);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to fetch all productions.");
  }
};

// Get productions by specific userId and seasonId within a cooperative
export const fetchProductionsByUserSeason = async (
  userId,
  seasonId,
  cooperativeId
) => {
  // Renamed from fetchProduction
  if (!userId || !seasonId || !cooperativeId) {
    return {
      success: false,
      message:
        "User ID, Season ID, and Cooperative ID are required to fetch productions.",
    };
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/by-user-season`, {
      params: { userId, seasonId, cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(
      error,
      "Failed to fetch productions by user and season."
    );
  }
};

// Get all productions for a specific user (by ID) within a cooperative
export const fetchProductionsById = async (id) => {
  const response = await axiosInstance.get(`/productions/${id}`);
  return response.data;
};

// Create a new production
// Requires productionData to include cooperativeId
export const createProduction = async (productionData) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/register`,
      productionData
    ); // Matches /register route
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create production.");
  }
};

// Update a production by ID
// Requires data to include cooperativeId for authorization
export const updateProduction = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update production.");
  }
};

// Delete a production by ID
// Requires cooperativeId to be passed in the request body for authorization
export const deleteProduction = async (id, cooperativeId) => {
  if (!cooperativeId) {
    return {
      success: false,
      message: "Cooperative ID is required to delete production.",
    };
  }
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    }); // Pass cooperativeId in data
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to delete production.");
  }
};

export const getProductions = async () => {
  const response = await axiosInstance.get(`${API_URL}/productions`);
  return response.data;
};

const API_BASE_URL = "productions";

export const downloadProductionsPDF = async () => {
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
    a.download = "productions_report.pdf"; // The default filename
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

export const downloadProductionsExcel = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/excel`, {
      responseType: "blob", // Crucial for binary file downloads
    });

    const excelBlob = response.data; // response.data is already a Blob
    const url = window.URL.createObjectURL(excelBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "productions_report.xlsx"; // Suggested filename
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url); // Clean up the URL
    a.remove();
  } catch (error) {
    console.error("Error downloading Excel:", error);
    throw error;
  }
};
