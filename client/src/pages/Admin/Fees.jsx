import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchFees,
  createFees,
  updateFees,
  deleteFees,
  payFees,
} from "../../services/feesService";

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
import AddFeeModal from "../../features/modals/AddFeeModal";
import UpdateFeeModal from "../../features/modals/UpdateFeeModal";

function Fees() {
  const [fees, setFees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const loadFees = async () => {
    try {
      const feesData = await fetchFees();

      setFees(feesData.data || feesData);
    } catch (error) {
      console.error("Failed to fetch fees:", error);
      toast.error("Failed to load fees.");
      setFees([]);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleAddFee = async (newFeeData) => {
    try {
      await createFees(newFeeData);
      toast.success("Fee added successfully!");
      await loadFees();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add fee:", error);
      toast.error(
        `Failed to add fee: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Handle opening the Update Fee modal
  const handleOpenUpdateModal = (fee) => {
    setSelectedFee(fee); // Set the fee to be updated
    setShowUpdateModal(true);
  };

  // Handle saving changes from Update Fee modal
  const handleUpdateFee = async (feeId, updatedFeeData) => {
    try {
      await updateFees(feeId, updatedFeeData); // API call to update fee
      toast.success("Fee updated successfully!"); // Success toast
      await loadFees(); // Re-fetch all fees to update the table
      setShowUpdateModal(false); // Close modal
      setSelectedFee(null); // Clear selected fee state
    } catch (error) {
      console.error("Failed to update fee:", error);
      toast.error(
        `Failed to update fee: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handle deleting a fee
  const handleDeleteFee = async (id) => {
    try {
      await deleteFees(id); // API call to delete fee
      toast.success("Fee deleted successfully!"); // Success toast
      await loadFees(); // Re-fetch all fees to update the table
    } catch (error) {
      console.error("Failed to delete fee:", error);
      toast.error(
        `Failed to delete fee: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handle paying a fee
  const handlePayFee = async (id) => {
    try {
      await payFees(id, { status: "paid" }); // API call to mark fee as paid
      toast.success("Fee marked as paid successfully!"); // Success toast
      await loadFees(); // Re-fetch all fees to update the table
    } catch (error) {
      console.error("Failed to pay fee:", error);
      toast.error(
        `Failed to mark fee as paid: ${
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
            Fees Dashboard
          </h4>
          {/* Add Fee Button */}
          <AddButton label="Add Fees" onClick={() => setShowAddModal(true)} />
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Season</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.length > 0 ? (
                fees.map((fee, index) => (
                  <tr key={fee._id}>
                    {" "}
                    {/* Use fee._id for the key */}
                    <td>{index + 1}</td>
                    {/* Use optional chaining for nested properties */}
                    <td>{fee.userId?.names || "N/A"}</td>
                    <td>{fee.seasonId?.name || "N/A"}</td>
                    <td>{fee.amount}</td>
                    <td>
                      <span
                        className={`badge ${
                          fee.status === "paid"
                            ? "bg-success"
                            : "bg-warning text-dark" // Added text-dark for unpaid badge
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {fee.createdAt
                        ? new Date(fee.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(fee)} // Pass the fee object
                          confirmMessage={`Are you sure you want to update fees for "${
                            fee.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteFee(fee._id)} // Pass the fee ID
                          confirmMessage={`Are you sure you want to delete fees for "${
                            fee.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Delete
                        </DeleteButton>
                        {fee.status === "unpaid" && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handlePayFee(fee._id)} // Pass the fee ID
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
                  <td colSpan="8" className="text-center py-4">
                    {" "}
                    {/* Adjusted colspan to 8 */}
                    <div className="alert alert-info" role="alert">
                      No fees found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fee Modal */}
      <AddFeeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFee}
      />

      {/* Update Fee Modal */}
      <UpdateFeeModal
        show={showUpdateModal}
        fee={selectedFee} // Pass the selected fee object to the modal
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateFee}
      />

      {/* ToastContainer for displaying notifications */}
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

export default Fees;
