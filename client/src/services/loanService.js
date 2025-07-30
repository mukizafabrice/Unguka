import axiosInstance from "../api/axiosInstance";

export const fetchLoans = async () => {
  const response = await axiosInstance.get("/loans");
  return response.data;
};

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

// Function to delete a loan entry
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
