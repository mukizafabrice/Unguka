// src/pages/PurchaseInputs.jsx

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PlusCircle } from "lucide-react"; // For the Add button icon

import {
  fetchPurchaseInputs,
  createPurchaseInputs,
  updatePurchaseInputs,
  deletePurchaseInputs,
} from "../../services/purchaseInputsService"; // Import all purchase input service functions

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton"; // Assuming this is a reusable component

import AddPurchaseInputModal from "../../features/modals/AddPurchaseInputModal"; // Import the new AddPurchaseInputModal
import UpdatePurchaseInputModal from "../../features/modals/UpdatePurchaseInputModal"; // Import the new UpdatePurchaseInputModal

function PurchaseInputs() {
  const [purchaseInputs, setPurchaseInputs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPurchaseInput, setSelectedPurchaseInput] = useState(null); // To store the purchase input being updated

  // Function to load purchase inputs data from the backend
  const loadPurchaseInputs = async () => {
    try {
      const data = await fetchPurchaseInputs();
      // The fetchPurchaseInputs service now handles parsing response.data or response directly
      setPurchaseInputs(data);
    } catch (error) {
      console.error("Failed to fetch purchase inputs:", error);
      toast.error("Failed to load purchases."); // User-friendly error notification
      setPurchaseInputs([]); // Ensure state is an empty array on error
    }
  };

  // Effect hook to load purchase inputs when the component mounts
  useEffect(() => {
    loadPurchaseInputs();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handler for adding a new purchase input
  const handleAddPurchaseInput = async (newPurchaseInputData) => {
    try {
      await createPurchaseInputs(newPurchaseInputData); // API call to create the purchase input
      toast.success("Purchase added successfully!"); // Success notification
      await loadPurchaseInputs(); // Re-fetch all purchase inputs to update the table
      setShowAddModal(false); // Close the Add modal
    } catch (error) {
      console.error("Failed to add purchase:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to add purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for opening the Update Purchase Input modal
  const handleOpenUpdateModal = (purchaseInput) => {
    setSelectedPurchaseInput(purchaseInput); // Set the purchase input object to be edited
    setShowUpdateModal(true); // Open the Update modal
  };

  // Handler for saving changes from the Update Purchase Input modal
  const handleUpdatePurchaseInput = async (id, updatedPurchaseInputData) => {
    try {
      await updatePurchaseInputs(id, updatedPurchaseInputData); // API call to update the purchase input
      toast.success("Purchase updated successfully!"); // Success notification
      await loadPurchaseInputs(); // Re-fetch all purchase inputs to update the table
      setShowUpdateModal(false); // Close the Update modal
      setSelectedPurchaseInput(null); // Clear the selected purchase input state
    } catch (error) {
      console.error("Failed to update purchase:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to update purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a purchase input
  const handleDeletePurchaseInput = async (id) => {
    try {
      await deletePurchaseInputs(id); // API call to delete the purchase input
      toast.success("Purchase deleted successfully!"); // Success notification
      await loadPurchaseInputs(); // Re-fetch all purchase inputs to update the table
    } catch (error) {
      console.error("Failed to delete purchase:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to delete purchase: ${
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
            Purchases Dashboard
          </h4>
          {/* Add Purchase Button */}
          <AddButton
            label="Add Purchase"
            onClick={() => setShowAddModal(true)}
          />
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
                <th>Payment Type</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>{" "}
                {/* Colspan for Update and Delete buttons */}
              </tr>
            </thead>
            <tbody>
              {purchaseInputs.length > 0 ? (
                purchaseInputs.map((purchaseInput, index) => (
                  <tr key={purchaseInput._id}>
                    {" "}
                    {/* Use purchaseInput._id as the unique key */}
                    <td>{index + 1}</td>
                    {/* Use optional chaining (?.) for nested properties */}
                    <td>{purchaseInput.userId?.names || "N/A"}</td>
                    <td>
                      {purchaseInput.productId?.productName || "N/A"}
                    </td>{" "}
                    {/* Corrected from productNames */}
                    <td>{purchaseInput.seasonId?.name || "N/A"}</td>
                    <td>{purchaseInput.quantity || "N/A"}</td>{" "}
                    {/* Display quantity */}
                    <td>{purchaseInput.totalPrice || "N/A"}RwF</td>
                    <td>
                      <span
                        className={`badge ${
                          purchaseInput.paymentType === "cash"
                            ? "bg-success"
                            : "bg-warning text-dark" // Added text-dark for contrast
                        }`}
                      >
                        {purchaseInput.paymentType}
                      </span>
                    </td>
                    <td>
                      {/* Format the date for display */}
                      {purchaseInput.createdAt
                        ? new Date(purchaseInput.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* Update Button */}
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(purchaseInput)}
                          confirmMessage={`Are you sure you want to update purchase for "${
                            purchaseInput.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        {/* Delete Button */}
                        <DeleteButton
                          onConfirm={() =>
                            handleDeletePurchaseInput(purchaseInput._id)
                          }
                          confirmMessage={`Are you sure you want to delete purchase "${
                            purchaseInput.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Delete
                        </DeleteButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  {/* Message when no purchases are found, colSpan matches total columns */}
                  <td colSpan="9" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No Purchases found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Input Modal Component */}
      <AddPurchaseInputModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPurchaseInput}
      />

      {/* Update Purchase Input Modal Component */}
      <UpdatePurchaseInputModal
        show={showUpdateModal}
        purchaseInput={selectedPurchaseInput}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdatePurchaseInput}
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

export default PurchaseInputs;
