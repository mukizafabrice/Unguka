import axiosInstance from "../api/axiosInstance"; 

const API_URL = "/products"; 

// Helper to handle successful API responses consistently
const handleResponse = (response) => {
  return {
    success: true,
    data: response.data,
    message: response.data.message || "Operation successful",
  };
};

// Helper to handle API errors consistently
const handleError = (
  error,
  defaultMessage = "An unexpected error occurred."
) => {
  console.error("Product service call failed:", error);
  return {
    success: false,
    message: error.response?.data?.message || defaultMessage,
    statusCode: error.response?.status,
  };
};

// --- Product Management Functions ---

// Get all products
// Can accept a cooperativeId to filter products specific to a cooperative
// export const fetchProducts = async (cooperativeId = null) => {
//   try {
//     const params = cooperativeId ? { params: { cooperativeId } } : {};
//     const response = await axiosInstance.get(API_URL, params);
//     return handleResponse(response);
//   } catch (error) {
//     return handleError(error, "Failed to fetch products.");
//   }
// };

// productService.js
export const fetchProducts = async (cooperativeId) => {
  try {
    const response = await axiosInstance.get(
      `/products?cooperativeId=${cooperativeId}`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch products",
    };
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post(API_URL, productData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to create product.");
  }
};

// Update a product by ID
export const updateProduct = async (id, productData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, productData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to update product.");
  }
};

// Delete a product by ID
export const deleteProduct = async (id, cooperativeId) => {
  // cooperativeId needed for backend check
  try {
    // For DELETE, if your backend requires cooperativeId in body, pass it
    // If your backend expects it as query param for delete, adjust here.
    const response = await axiosInstance.delete(`${API_URL}/${id}`, {
      data: { cooperativeId },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Failed to delete product.");
  }
};
