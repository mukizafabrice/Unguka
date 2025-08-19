import axiosInstance from "../api/axiosInstance";

/**
 * Fetches all payment transactions.
 * For superadmins, an optional cooperativeId can be passed to filter by cooperative.
 * For other roles, cooperativeId is implicitly handled by the backend's JWT.
 * @param {string} [cooperativeId] - Optional cooperative ID for superadmin queries.
 * @returns {Promise<Array>} A promise that resolves to an array of payment transaction data.
 */
export const fetchPaymentTransactions = async (cooperativeId = null) => {
  let url = "/paymentTransactions";
  if (cooperativeId) {
    url += `?cooperativeId=${cooperativeId}`; // Append cooperativeId only if provided (for superadmins)
  }
  const response = await axiosInstance.get(url);
  return response.data;
};

/**
 * Fetches payment transactions for a specific user ID.
 * The backend controller will handle cooperative scoping and user authorization
 * based on the authenticated user's token and the requested userId.
 * @param {string} id - The ID of the user whose payments are to be fetched.
 * @returns {Promise<Array>} A promise that resolves to an array of payment transaction data for the user.
 */
export const fetchPaymentTransactionsById = async (id) => {
  // The backend's getAllPaymentTransactionsById controller will handle cooperative
  // scoping and authorization based on the authenticated user's token (req.user)
  // and the ID provided here.
  const response = await axiosInstance.get(`/paymentTransactions/${id}`);
  return response.data;
};
