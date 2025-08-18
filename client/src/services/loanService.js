import axiosInstance from "../api/axiosInstance";

/**
 * Creates a new loan entry. The backend will automatically link the loan
 * to the authenticated manager's cooperative.
 * @param {object} loanData - The data for the new loan.
 * @param {string} loanData.userId - The ID of the user receiving the loan.
 * @param {number} loanData.amountOwed - The amount of the loan.
 * @param {number} loanData.interest - The interest rate.
 * @returns {Promise<object>} The created loan data.
 */
export const createLoan = async (loanData) => {
  // We don't send `cooperativeId` from the frontend.
  // The backend securely gets it from the user's token.
  const response = await axiosInstance.post("/loans", loanData);
  return response.data;
};

/**
 * Fetches all loan entries for the authenticated user's cooperative.
 * This is meant for managers and superadmins. The backend handles filtering.
 * @returns {Promise<Array<object>>} A list of all loan entries for the cooperative.
 */
export const fetchAllCooperativeLoans = async () => {
  const response = await axiosInstance.get("/loans");
  return response.data;
};

/**
 * Fetches a single loan entry by its ID. The backend will ensure
 * the loan belongs to the authenticated user's cooperative.
 * @param {string} id - The ID of the loan to fetch.
 * @returns {Promise<object>} The loan data.
 */
export const fetchLoansById = async (id) => {
  const response = await axiosInstance.get(`/loans/${id}`);
  return response.data;
};

/**
 * Fetches all loans for a specific user. The backend handles access control
 * based on the authenticated user's role and cooperative.
 * @param {string} userId - The ID of the user whose loans to fetch.
 * @returns {Promise<Array<object>>} A list of the user's loan entries.
 */
export const fetchUserLoans = async (userId) => {
  const response = await axiosInstance.get(`/loans/user/${userId}`);
  return response.data;
};

/**
 * Updates an existing loan entry. The backend ensures the update is
 * authorized for the loan's cooperative.
 * @param {string} id - The ID of the loan to update.
 * @param {object} loanData - The updated loan data.
 * @returns {Promise<object>} The updated loan data.
 */
export const updateLoan = async (id, loanData) => {
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
 * Deletes a loan entry. The backend verifies the user's permission
 * within the loan's cooperative.
 * @param {string} id - The ID of the loan to delete.
 * @returns {Promise<object>} The response data from the deletion.
 */
export const deleteLoan = async (id) => {
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
