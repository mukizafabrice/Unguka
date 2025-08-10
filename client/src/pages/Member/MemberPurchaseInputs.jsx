import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchPurchaseInputsById } from "../../services/purchaseInputsService";

function PurchaseInputs() {
  const [purchaseInputs, setPurchaseInputs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const loadPurchaseInputs = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const data = await fetchPurchaseInputsById(userId);
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

  const rowsPerPage = 6;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = purchaseInputs.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(purchaseInputs.length / rowsPerPage);
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
            Purchases Dashboard
          </h4>
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
              </tr>
            </thead>
            <tbody>
              {purchaseInputs.length > 0 ? (
                currentRows.map((purchaseInput, index) => (
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
