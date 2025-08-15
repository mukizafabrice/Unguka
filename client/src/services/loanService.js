import axiosInstance from "../api/axiosInstance";

/**
 * Creates a new loan entry.
 * In a multi-cooperative setup, the `loanData` should include the `cooperativeId`
 * for which the loan is being created, or the backend will infer it from the
 * authenticated user's context.
 * @param {object} loanData - The data for the new loan.
 * @returns {Promise<object>} The created loan data.
 */
export const createLoan = async (loanData) => {
  const response = await axiosInstance.post("/loans", loanData);
  return response.data;
};

/**
 * Fetches all loan entries, with an optional filter for a specific cooperative.
 * @param {string} [cooperativeId] - Optional ID of the cooperative to filter loans by.
 * @returns {Promise<Array<object>>} A list of loan entries.
 */
export const fetchLoans = async (cooperativeId) => {
  // Construct query parameters if cooperativeId is provided
  const params = cooperativeId ? { cooperativeId } : {};
  const response = await axiosInstance.get("/loans", { params });
  return response.data;
};

/**
 * Fetches a single loan entry by its ID.
 * The backend is expected to handle cooperative authorization based on the loan's
 * inherent cooperative ID or the authenticated user's cooperative.
 * @param {string} id - The ID of the loan to fetch.
 * @returns {Promise<object>} The loan data.
 */
export const fetchLoansById = async (id) => {
  const response = await axiosInstance.get(`/loans/${id}`);
  return response.data;
};

/**
 * Updates an existing loan entry.
 * The backend should ensure the update is authorized for the loan's cooperative.
 * @param {string} id - The ID of the loan to update.
 * @param {object} loanData - The updated loan data.
 * @returns {Promise<object>} The updated loan data.
 */
export const updateLoans = async (id, loanData) => {
  try {
    const response = await axiosInstance.put(`/loans/${id}`, loanData);
    return response.data;
  } catch (error) {
    console.error(
      `Error updating loan with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Deletes a loan entry.
 * The backend should verify the user's permission within the loan's cooperative.
 * @param {string} id - The ID of the loan to delete.
 * @returns {Promise<object>} The response data from the deletion.
 */
export const deleteLoans = async (id) => {
  try {
    const response = await axiosInstance.delete(`/loans/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting loan with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Marks a loan as repaid.
 * The backend will handle the cooperative context of the loan being repaid.
 * @param {string} id - The ID of the loan to mark as repaid.
 * @returns {Promise<object>} The response data, indicating success.
 */
export const payLoans = async (id) => {
  try {
    const response = await axiosInstance.put(`/loans/${id}/repay`);

    if (response.data) {
      return response.data;
    } else {
      return {
        success: true,
        message:
          "Loan marked as repaid successfully (no data returned from API).",
      };
    }
  } catch (error) {
    console.error(
      `Error marking loan ${id} as repaid:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
