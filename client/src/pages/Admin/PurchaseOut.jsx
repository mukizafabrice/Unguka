// src/pages/PurchaseInputs.jsx

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchPurchaseOut,
  createPurchaseOut,
  updatePurchaseOut,
  deletePurchaseOut,
} from "../../services/purchaseOutService";

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";

import AddPurchaseOutModal from "../../features/modals/AddPurchaseOutModal";
import UpdatePurchaseOutModal from "../../features/modals/UpdatePurchaseOutModal";
function PurchaseInputs() {
  const [purchaseOuts, setPurchaseOuts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPurchaseInput, setSelectedPurchaseInput] = useState(null);

  // Function to load purchase inputs data from the backend
  const loadPurchaseOut = async () => {
    try {
      const data = await fetchPurchaseOut();
      setPurchaseOuts(data);
    } catch (error) {
      console.error("Failed to fetch purchase inputs:", error);
      toast.error("Failed to load purchases.");
      setPurchaseOuts([]);
    }
  };

  useEffect(() => {
    loadPurchaseOut();
  }, []);

  // Handler for adding a new purchase input
  const handleAddPurchaseOut = async (newPurchaseOutData) => {
    try {
      await createPurchaseOut(newPurchaseOutData);
      toast.success("Purchase added successfully!");
      await loadPurchaseOut();
      setShowAddModal(false);
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

  const handleOpenUpdateModal = (purchaseInput) => {
    setSelectedPurchaseInput(purchaseInput);
    setShowUpdateModal(true);
  };

  const handleUpdatePurchaseInput = async (id, updatedPurchaseInputData) => {
    try {
      await updatePurchaseOut(id, updatedPurchaseInputData);
      toast.success("Purchase updated successfully!");
      await loadPurchaseOut();
      setShowUpdateModal(false);
      setSelectedPurchaseInput(null);
    } catch (error) {
      console.error("Failed to update purchase:", error);
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
      await deletePurchaseOut(id);
      toast.success("Purchase deleted successfully!");
      await loadPurchaseOut();
    } catch (error) {
      console.error("Failed to delete purchase:", error);
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
                <th>Product Name</th>
                <th>Season</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOuts.length > 0 ? (
                purchaseOuts.map((purchaseOut, index) => (
                  <tr key={purchaseOut._id}>
                    <td>{index + 1}</td>
                    <td>{purchaseOut.productId?.productName}</td>
                    <td>{purchaseOut.seasonId?.name}</td>
                    <td>{purchaseOut.quantity}</td>
                    <td>{purchaseOut.totalPrice}RwF</td>
                    <td>
                      {purchaseOut.createdAt
                        ? new Date(purchaseOut.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(purchaseOut)}
                          confirmMessage={`Are you sure you want to update purchase for "${
                            purchaseOut.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() =>
                            handleDeletePurchaseInput(purchaseOut._id)
                          }
                          confirmMessage={`Are you sure you want to delete purchase "${
                            purchaseOut.userId?.names || "N/A"
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
      <AddPurchaseOutModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPurchaseOut}
      />
      <UpdatePurchaseOutModal
        show={showUpdateModal}
        purchaseInput={selectedPurchaseInput}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdatePurchaseInput}
      />

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
