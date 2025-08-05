import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchPurchaseInputs,
  createPurchaseInputs,
  updatePurchaseInputs,
  deletePurchaseInputs,
} from "../../services/purchaseInputsService";

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";

import AddPurchaseInputModal from "../../features/modals/AddPurchaseInputModal";
import UpdatePurchaseInputModal from "../../features/modals/UpdatePurchaseInputModal";

function PurchaseInputs() {
  const [purchaseInputs, setPurchaseInputs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPurchaseInput, setSelectedPurchaseInput] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const loadPurchaseInputs = async () => {
    try {
      const data = await fetchPurchaseInputs();
      setPurchaseInputs(data);
    } catch (error) {
      console.error("Failed to fetch purchase inputs:", error);
      toast.error("Failed to load purchases.");
      setPurchaseInputs([]);
    }
  };

  useEffect(() => {
    loadPurchaseInputs();
  }, []);

  const handleAddPurchaseInput = async (newPurchaseInputData) => {
    try {
      await createPurchaseInputs(newPurchaseInputData);
      toast.success("Purchase added successfully!");
      await loadPurchaseInputs();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add purchase:", error);
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

  const handleUpdatePurchaseInput = async (updatedPurchaseInputData) => {
    try {
      await updatePurchaseInputs(
        selectedPurchaseInput._id,
        updatedPurchaseInputData
      );
      toast.success("Purchase updated successfully!");
      await loadPurchaseInputs();
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

  const handleDeletePurchaseInput = async (id) => {
    try {
      await deletePurchaseInputs(id);
      toast.success("Purchase deleted successfully!");
      await loadPurchaseInputs();
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
          <table className="table table-dark table-striped table-hover table-sm mb-0 small">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Product Name</th>
                <th>Season</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Amount Paid</th>
                <th>Amount Remaining</th>
                <th>Status</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchaseInputs.length > 0 ? (
                purchaseInputs.map((purchaseInput, index) => (
                  <tr key={purchaseInput._id}>
                    <td>{index + 1}</td>
                    <td>{purchaseInput.userId?.names || "N/A"}</td>
                    <td>{purchaseInput.productId?.productName || "N/A"}</td>
                    <td>
                      {purchaseInput.seasonId?.name}(
                      {purchaseInput.seasonId?.year})
                    </td>
                    <td>{purchaseInput.quantity || "N/A"}</td>
                    <td>{formatCurrency(purchaseInput.unitPrice)}</td>
                    <td>{formatCurrency(purchaseInput.totalPrice)}</td>
                    <td>{formatCurrency(purchaseInput.amountPaid)}</td>
                    <td
                      style={{
                        color:
                          purchaseInput.remainingAmount >
                          purchaseInput.amountPaid
                            ? "#dc3545"
                            : "#28a745",
                        fontWeight: "bold",
                      }}
                    >
                      {formatCurrency(purchaseInput.amountRemaining)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          purchaseInput.status === "paid"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {purchaseInput.status}
                      </span>
                    </td>
                    <td>
                      {purchaseInput.createdAt
                        ? new Date(purchaseInput.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(purchaseInput)}
                          confirmMessage={`Are you sure you want to update purchase for "${
                            purchaseInput.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
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
                  <td colSpan="12" className="text-center py-4">
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

      <AddPurchaseInputModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPurchaseInput}
      />

      <UpdatePurchaseInputModal
        show={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedPurchaseInput(null);
        }}
        onSubmit={handleUpdatePurchaseInput}
        initialData={selectedPurchaseInput}
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
