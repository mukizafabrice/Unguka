import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import AddButton from "../../components/buttons/AddButton";
import {
  fetchPurchaseOut,
  createPurchaseOut,
  updatePurchaseOut,
  deletePurchaseOut,
} from "../../services/purchaseOutService";

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddPurchaseOutModal from "../../features/modals/AddPurchaseOutModal";
import UpdatePurchaseOutModal from "../../features/modals/UpdatePurchaseOutModal";

function PurchaseOut() {
  const [purchaseOuts, setPurchaseOuts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPurchaseOut, setSelectedPurchaseOut] = useState(null); // Consistent naming

  // Function to load purchase outs data from the backend
  const loadPurchaseOut = async () => {
    try {
      const data = await fetchPurchaseOut();
      setPurchaseOuts(data);
    } catch (error) {
      console.error("Failed to fetch purchase outs:", error);
      toast.error("Failed to load purchases.");
      setPurchaseOuts([]);
    }
  };

  useEffect(() => {
    loadPurchaseOut();
  }, []);

  // Handler for adding a new purchase out
  const handleAddPurchaseOut = async (newPurchaseOutData) => {
    try {
      await createPurchaseOut(newPurchaseOutData);
      toast.success("Purchase added successfully!");
      await loadPurchaseOut();
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

  const handleOpenUpdateModal = (purchaseOut) => {
    setSelectedPurchaseOut(purchaseOut);
    setShowUpdateModal(true);
  };

  // Handler for updating a purchase out
  const handleUpdatePurchaseOut = async (id, updatedPurchaseOutData) => {
    try {
      await updatePurchaseOut(id, updatedPurchaseOutData);
      toast.success("Purchase updated successfully!");
      await loadPurchaseOut();
      setShowUpdateModal(false);
      setSelectedPurchaseOut(null);
    } catch (error) {
      console.error("Failed to update purchase:", error);
      toast.error(
        `Failed to update purchase: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a purchase out
  const handleDeletePurchaseOut = async (id) => {
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
                <th>Unit Price</th>
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
                    <td>
                      {purchaseOut.seasonId?.name +
                        "" +
                        purchaseOut.seasonId?.year}
                    </td>
                    <td>{purchaseOut.quantity}</td>
                    <td>{purchaseOut.unitPrice} RwF</td>
                    <td>{purchaseOut.totalPrice} RwF</td>
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
                            purchaseOut.productId?.productName || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() =>
                            handleDeletePurchaseOut(purchaseOut._id)
                          }
                          confirmMessage={`Are you sure you want to delete purchase "${
                            purchaseOut.productId?.productName || "N/A"
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
                  {/* Corrected colspan to match the total number of columns */}
                  <td colSpan="7" className="text-center py-4">
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
        purchaseOut={selectedPurchaseOut} // Corrected prop name
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdatePurchaseOut}
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

export default PurchaseOut;
