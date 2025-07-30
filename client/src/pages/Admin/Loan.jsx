import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchLoans,
  // createLoans, // Removed
  updateLoans,
  deleteLoans,
  payLoans, // Function to mark loan as repaid
} from "../../services/loanService";

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
// import AddButton from "../../components/buttons/AddButton"; // Removed
// import AddLoanModal from "../../features/modals/AddLoanModal"; // Removed
import UpdateLoanModal from "../../features/modals/UpdateLoanModal"; // Import the UpdateLoanModal

function Loan() {
  const [loans, setLoans] = useState([]);
  // const [showAddModal, setShowAddModal] = useState(false); // Removed
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null); // To store the loan being updated

  // Function to load loans data from the backend
  const loadLoans = async () => {
    try {
      const loansData = await fetchLoans();
      setLoans(loansData.loans);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      toast.error("Failed to load loans."); // User-friendly error notification
      setLoans([]); // Ensure loans state is an empty array on error
    }
  };

  // Effect hook to load loans when the component mounts
  useEffect(() => {
    loadLoans();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleOpenUpdateModal = (loan) => {
    setSelectedLoan(loan);
    setShowUpdateModal(true);
  };

  // Handler for saving changes from the Update Loan modal
  const handleUpdateLoan = async (loanId, updatedLoanData) => {
    try {
      await updateLoans(loanId, updatedLoanData); // API call to update the loan
      toast.success("Loan updated successfully!"); // Success notification
      await loadLoans(); // Re-fetch all loans to update the table with changes
      setShowUpdateModal(false); // Close the Update Loan modal
      setSelectedLoan(null); // Clear the selected loan state
    } catch (error) {
      console.error("Failed to update loan:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to update loan: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a loan
  const handleDeleteLoan = async (id) => {
    try {
      await deleteLoans(id); // API call to delete the loan
      toast.success("Loan deleted successfully!"); // Success notification
      await loadLoans(); // Re-fetch all loans to update the table (removed item)
    } catch (error) {
      console.error("Failed to delete loan:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to delete loan: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for marking a loan as repaid
  const handlePayLoan = async (id) => {
    try {
      await payLoans(id); // API call to mark loan as repaid
      toast.success("Loan marked as repaid successfully!"); // Success notification
      await loadLoans(); // Re-fetch all loans to update the table (status change)
    } catch (error) {
      console.error("Failed to pay loan:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to mark loan as repaid: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Loan Dashboard
          </h4>
          {/* Removed Add Loan Button */}
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Product Name</th>
                <th>Season</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th colSpan={2}>Action</th>{" "}
                {/* Colspan for Update, Delete, Pay buttons */}
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan, index) => (
                  <tr key={loan._id}>
                    {" "}
                    {/* Use loan._id as the unique key for each row */}
                    <td>{index + 1}</td>
                    {/* Use optional chaining (?.) for nested properties */}
                    <td>{loan.purchaseInputId?.userId?.names || "N/A"}</td>
                    <td>
                      {loan.purchaseInputId?.productId?.productName || "N/A"}
                    </td>
                    <td>{loan.purchaseInputId?.seasonId?.name || "N/A"}</td>
                    <td>{loan.quantity}</td>
                    <td>{loan.totalPrice}</td>
                    <td>
                      <span
                        className={`badge ${
                          loan.status === "repaid"
                            ? "bg-success"
                            : "bg-warning text-dark" // Added text-dark for better contrast on warning badge
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* Update Button */}
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(loan)} // Pass the entire loan object for editing
                          confirmMessage={`Are you sure you want to update loan for "${
                            loan.purchaseInputId?.productId?.productName ||
                            "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        {/* Delete Button */}
                        <DeleteButton
                          onConfirm={() => handleDeleteLoan(loan._id)} // Pass the loan's _id for deletion
                          confirmMessage={`Are you sure you want to delete loan for "${
                            loan.purchaseInputId?.productId?.productName ||
                            "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Delete
                        </DeleteButton>
                        {/* Pay Button (conditionally rendered if status is pending) */}
                        {loan.status === "pending" && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handlePayLoan(loan._id)} // Pass the loan's _id to mark as repaid
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  {/* Message when no loans are found, colSpan matches total columns */}
                  <td colSpan="9" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No loans found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Removed Add Loan Modal Component */}

      {/* Update Loan Modal Component */}
      <UpdateLoanModal
        show={showUpdateModal}
        loan={selectedLoan} // Prop name 'loan' passed to the modal
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateLoan} // Handler for saving updates from the modal
      />

      {/* ToastContainer for displaying success/error notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Loan;
