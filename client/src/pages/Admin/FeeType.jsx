import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchFeeTypes,
  createFeeType,
  updateFeeType,
  deleteFeeType,
} from "../../services/feeTypeService";

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
import AddFeeTypeModal from "../../features/modals/AddFeeTypeModal";
import UpdateFeeTypeModal from "../../features/modals/UpdateFeeTypeModal";

function FeeType() {
  const [feeTypes, setFeeTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [feeTypeToEdit, setFeeTypeToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Function to fetch fee types from the backend
  const loadFeeTypes = async () => {
    try {
      const feeTypesData = await fetchFeeTypes();
      setFeeTypes(feeTypesData);
    } catch (error) {
      console.error("Failed to fetch fee types:", error);
      toast.error("Failed to load fee types.");
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    loadFeeTypes();
  }, []);

  // Handler for adding a new fee type
  const handleAddFeeType = async (feeTypeData) => {
    try {
      await createFeeType(feeTypeData);
      setShowAddModal(false);
      toast.success("Fee Type added successfully!");
      await loadFeeTypes(); // Re-fetch all fee types to refresh the list
    } catch (error) {
      console.error("Error adding fee type:", error);
      toast.error(
        `Failed to add fee type: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a fee type
  const handleDeleteFeeType = async (id) => {
    try {
      await deleteFeeType(id);
      toast.success("Fee Type deleted successfully!");
      await loadFeeTypes(); // Re-fetch all fee types to refresh the list
    } catch (error) {
      console.error("Error deleting fee type:", error);
      toast.error(
        `Failed to delete fee type: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler to open the update modal with the selected fee type's data
  const handleUpdateFeeType = (feeType) => {
    setFeeTypeToEdit(feeType);
    setShowUpdateModal(true);
  };

  // Handler for submitting the updated fee type
  const handleFeeTypeUpdated = async (id, updatedFeeTypeData) => {
    try {
      await updateFeeType(id, updatedFeeTypeData);

      toast.success("Fee Type updated successfully!");
      setShowUpdateModal(false);
      await loadFeeTypes(); // Re-fetch all fee types to refresh the list
    } catch (error) {
      console.error("Error updating fee type:", error);
      toast.error(
        `Failed to update fee type: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = feeTypes.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(feeTypes.length / rowsPerPage);

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

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Fee Types Dashboard
          </h4>
          <AddButton
            label="Add Fee Type"
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
                <th>Name</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {feeTypes.length > 0 ? (
                currentRows.map((feeType, index) => (
                  <tr key={feeType._id || index}>
                    <td>{index + 1}</td>
                    <td>{feeType.name}</td>
                    <td>{feeType.amount}</td>
                    <td>{feeType.description || "N/A"}</td>
                    <td>{feeType.status}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateFeeType(feeType)}
                          confirmMessage={`Are you sure you want to update "${feeType.name}"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteFeeType(feeType._id)}
                          confirmMessage={`Are you sure you want to delete "${feeType.name}"?`}
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
                  <td colSpan="6" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No fee types found.
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
          <span className="text-white">
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

      <AddFeeTypeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFeeType}
      />
      <UpdateFeeTypeModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleFeeTypeUpdated}
        feeTypeToEdit={feeTypeToEdit}
      />

      {/* ToastContainer should ideally be in your top-level App.js */}
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

export default FeeType;
