import React, { useState, useEffect } from "react";
import { fetchStock } from "../../services/stockService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Stock() {
  const [stocks, setStocks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const stockData = await fetchStock();
      setStocks(stockData);
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      toast.error("Failed to load stocks.");
    }
  };
  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = stocks.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(stocks.length / rowsPerPage);
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
        <div className="dashboard-content-area  flex-wrap">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Stocks Dashboard
          </h4>
          <p className="text-muted mt-2">
            Manage and track current stock levels and updates in real time.
          </p>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Amount</th>
                {/* Removed Action column */}
              </tr>
            </thead>
            <tbody>
              {stocks.length > 0 ? (
                currentRows.map((stock, index) => (
                  <tr key={stock._id}>
                    <td>{index + 1}</td>
                    <td>{stock.productId?.productName || "N/A"}</td>
                    <td>{stock.quantity}</td>
                    <td>{stock.totalPrice}</td>
                    {/* Removed Action buttons column */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    {" "}
                    {/* Adjusted colspan */}
                    <div className="alert alert-info" role="alert">
                      No stock found.
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

export default Stock;
