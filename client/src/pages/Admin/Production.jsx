import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for react-toastify

import {
  fetchProductions,
  createProduction,
  updateProduction,
  deleteProduction,
} from "../../services/productionService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
import AddProductionModal from "../../features/modals/AddProductionModal";
import UpdateProductionModal from "../../features/modals/UpdateProductionModal";

function Production() {
  const [productions, setProductions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const loadProductions = async () => {
    try {
      const productionsData = await fetchProductions();
      setProductions(productionsData);
    } catch (error) {
      console.error("Failed to fetch productions:", error);
      toast.error("Failed to load productions."); // Error toast for fetching
    }
  };

  useEffect(() => {
    loadProductions();
  }, []);

  const handleAddProduction = async (newData) => {
    console.log("New production to be added:", newData);
    try {
      await createProduction(newData);
      console.log("Production added successfully!");
      await loadProductions();
      setShowAddModal(false);
      toast.success("Production added successfully!"); // Success toast
    } catch (error) {
      console.error("Failed to add production:", error);
      toast.error("Failed to add production."); // Error toast
    }
  };

  const handleUpdateProduction = async (updatedData) => {
    console.log("Production to be updated:", updatedData);
    try {
      const { _id, ...dataToUpdate } = updatedData;
      await updateProduction(_id, dataToUpdate);
      console.log("Production updated successfully!");
      await loadProductions();
      setShowUpdateModal(false);
      setSelectedProduction(null);
      toast.success("Production updated successfully!"); // Success toast
    } catch (error) {
      console.error("Failed to update production:", error);
      if (error.response) {
        console.error("Backend Error Response:", error.response.data);
        console.error("Backend Error Status:", error.response.status);
        toast.error(
          `Failed to update production: ${
            error.response.data.message || error.response.statusText
          }`
        ); // More specific error toast
      } else {
        toast.error("Failed to update production."); // Generic error toast
      }
    }
  };

  const handleOpenUpdateModal = (production) => {
    setSelectedProduction(production);
    setShowUpdateModal(true);
  };

  const handleDeleteProduction = async (id) => {
    console.log("Deleting production with ID:", id);
    try {
      await deleteProduction(id);
      console.log("Production deleted successfully!");
      await loadProductions();
      toast.success("Production deleted successfully!"); // Success toast
    } catch (error) {
      console.error("Failed to delete production:", error);
      if (error.response) {
        console.error("Backend Error Response:", error.response.data);
        console.error("Backend Error Status:", error.response.status);
        toast.error(
          `Failed to delete production: ${
            error.response.data.message || error.response.statusText
          }`
        ); // More specific error toast
      } else {
        toast.error("Failed to delete production."); // Generic error toast
      }
    }
  };

  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = productions.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(productions.length / rowsPerPage);
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };
  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Productions Dashboard
          </h4>
          <AddButton
            label="Add Production"
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
                <th>UnitPrice</th>
                <th>Amount</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {productions.length > 0 ? (
                currentRows.map((production, index) => (
                  <tr key={production._id}>
                    <td>{index + 1}</td>
                    <td>{production.userId?.names || "N/A"}</td>
                    <td>{production.productId?.productName || "N/A"}</td>
                    <td>
                      {production.seasonId?.name || "N/A"}(
                      {production.seasonId?.year || "N/A"})
                    </td>
                    <td>{production.quantity}</td>
                    <td>{formatCurrency(`${production.unitPrice}`)}</td>
                    <td>{formatCurrency(`${production.totalPrice}`)}</td>
                    <td>
                      {production.createdAt
                        ? new Date(production.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(production)}
                          confirmMessage={`Are you sure you want to update production for "${
                            production.productId?.productName || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() =>
                            handleDeleteProduction(production._id)
                          }
                          confirmMessage={`Are you sure you want to delete production "${
                            production.productId?.productName || "N/A"
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
                      No production found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="btn btn-outline-primary"
          >
            ← Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="btn btn-outline-primary"
          >
            Next →
          </button>
        </div>
      </div>

      <AddProductionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProduction}
      />

      <UpdateProductionModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateProduction}
        initialData={selectedProduction}
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

export default Production;
