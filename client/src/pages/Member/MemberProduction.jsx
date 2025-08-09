import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchProductionsById } from "../../services/productionService";

function Production() {
  const [productions, setProductions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const loadProductions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const productionsData = await fetchProductionsById(userId);
      setProductions(productionsData);
    } catch (error) {
      console.error("Failed to fetch productions:", error);
      toast.error("Failed to load productions.");
    }
  };

  useEffect(() => {
    loadProductions();
  }, []);

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
        <div className="dashboard-content-area">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Productions Dashboard
          </h4>
          <p className="text-dark">
            This is your Productions Dashboard, showing all the products you’ve
            produced and their details.
          </p>
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

export default Production;
