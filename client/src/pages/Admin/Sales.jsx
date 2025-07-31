import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchSales,
  deleteSales,
  updateSales,
  createSales,
} from "../../services/salesService";

import AddButton from "../../components/buttons/AddButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import UpdateSaleModal from "../../features/modals/UpdateSaleModal";
import AddSaleModal from "../../features/modals/AddSaleModal";
function Sales() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadSales = async () => {
    try {
      const salesData = await fetchSales();

      setSales(salesData.data || salesData);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      toast.error("Failed to load sales.");
      setSales([]);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const indexOfLastSale = currentPage * itemsPerPage;
  const indexOfFirstSale = indexOfLastSale - itemsPerPage;
  const currentSales = sales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleAddSale = async (newSaleData) => {
    try {
      await createSales(newSaleData);
      toast.success("Sale added successfully!");
      await loadSales();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add new sale:", error);
      toast.error(
        `Failed to add sale: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleOpenUpdateModal = (sale) => {
    setSelectedSale(sale);
    setShowUpdateModal(true);
  };
  const handleUpdateSale = async (saleId, updatedSaleData) => {
    try {
      await updateSales(saleId, updatedSaleData);
      toast.success("Sale updated successfully!");
      await loadSales();
      setShowUpdateModal(false);
      setSelectedSale(null);
    } catch (error) {
      console.error("Failed to update sale:", error);
      toast.error(
        `Failed to update sale: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handle deleting a sale
  const handleDeleteSale = async (id) => {
    try {
      await deleteSales(id);
      toast.success("Sale deleted successfully!");
      await loadSales();

      if (currentSales.length === 1 && currentPage > 1) {
        setCurrentPage((prevPage) => prevPage - 1);
      }
    } catch (error) {
      console.error("Failed to delete sale:", error);
      // More specific error message from backend if available
      toast.error(
        `Failed to delete sale: ${
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
            Sales Dashboard
          </h4>
          {/* Add Sale Button */}
          <AddButton label="Add Sale" onClick={handleOpenAddModal} />
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0 align-middle table-sm small">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Season</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
                <th>Buyer</th>
                <th>Tel</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentSales.length > 0 ? (
                currentSales.map((sale, index) => (
                  <tr key={sale._id}>
                    <td>{indexOfFirstSale + index + 1}</td>
                    <td>{sale.stockId?.productId?.productName}</td>
                    <td>{sale.seasonId?.name + "" + sale.seasonId?.year}</td>
                    <td>
                      {sale.quantity}
                      <span className="fw-bold">kg</span>
                    </td>
                    <td>
                      {sale.unitPrice}
                      <span className="fw-bold">rwf</span>
                    </td>
                    <td>
                      {sale.totalPrice}
                      <span className="fw-bold">rwf</span>
                    </td>
                    <td>{sale.buyer}</td>
                    <td>{sale.phoneNumber}</td>
                    <td>
                      <span
                        className={`badge ${
                          sale.status === "paid"
                            ? "bg-success"
                            : "bg-warning text-dark" // Added text-dark for unpaid badge
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td>
                      {sale.createdAt
                        ? new Date(sale.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(sale)}
                          confirmMessage={`Are you sure you want to update sale for "${
                            sale.stockId?.productId?.productName || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(sale._id)}
                          confirmMessage={`Are you sure you want to delete sale "${
                            sale.stockId?.productId?.productName || "N/A"
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
                      No sales found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav aria-label="Sales page navigation" className="mt-4">
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous"
                >
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <li
                    key={number}
                    className={`page-item ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  </li>
                )
              )}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next"
                >
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Update Sale Modal */}
      <UpdateSaleModal
        show={showUpdateModal}
        sale={selectedSale} // Pass the selected sale object to the modal
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSale} // Correctly points to handleUpdateSale
      />

      {/* Add Sale Modal */}
      <AddSaleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSale}
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

export default Sales;
