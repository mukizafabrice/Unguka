import React, { useState, useEffect } from "react";
import {
  PlusCircle, 
} from "lucide-react";
import {
  fetchSales,
  deleteSales,
  updateSales,
  createSales,
} from "../../services/salesService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import UpdateSaleModal from "../../features/UpdateSaleModal";
import AddSaleModal from "../../features/AddSaleModal"; 

function Sales() {
  const [selectedSale, setSelectedSale] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // New: State for Add Sale modal

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [members, setMembers] = useState(0);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesData = await fetchSales();
        setRecentSales(salesData.data);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
        setRecentSales([]);
      }
    };
    loadSales();
  }, []);

  const indexOfLastSale = currentPage * itemsPerPage;
  const indexOfFirstSale = indexOfLastSale - itemsPerPage;
  const currentSales = recentSales.slice(indexOfFirstSale, indexOfLastSale);

  const totalPages = Math.ceil(recentSales.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleUpdateSale = (sale) => {
    setSelectedSale(sale);
    setShowUpdateModal(true);
  };

  const handleSaveChanges = async (saleId, updatedSaleData) => {
    try {
      const updatedSale = await updateSales(saleId, updatedSaleData);
      setRecentSales((prevSales) =>
        prevSales.map((sale) => (sale._id === saleId ? updatedSale : sale))
      );
      setShowUpdateModal(false);
      // Refresh the page after successful update
      // window.location.reload(); // Removed for smoother UX, state update handles it
    } catch (error) {
      console.error("Failed to save updates:", error);
    }
  };

  // New: Handle adding a new sale
  const handleAddSale = async (newSaleData) => {
    try {
      const createdSale = await createSales(newSaleData);
      setRecentSales((prevSales) => [...prevSales, createdSale]);
      setShowAddModal(false); // Close modal on success
      // If adding a new item, you might want to go to the last page or first page
      // setCurrentPage(totalPages); // Go to the last page where new item might appear
    } catch (error) {
      console.error("Failed to add new sale:", error);
    }
  };

  const handleDeleteSale = async (id) => {
    console.log(`Attempting to delete sale with ID: ${id}`);
    try {
      await deleteSales(id);
      setRecentSales((prevSales) =>
        prevSales.filter((sale) => sale._id !== id)
      );
      console.log(`Sale ${id} deleted from UI.`);
      if (currentSales.length === 1 && currentPage > 1) {
        setCurrentPage((prevPage) => prevPage - 1);
      }
    } catch (error) {
      console.error("Failed to delete sale:", error);
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Sales Dashboard
          </h4>
          {/* New: Add Sale Button */}
          <button
            className="btn btn-success d-flex align-items-center"
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={20} className="me-2" /> Add Sale
          </button>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Season</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Buyer</th>
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
                    <td>{sale.stockId?.productId?.productName || "N/A"}</td>
                    <td>{sale.seasonId?.name || "N/A"}</td>
                    <td>
                      {sale.quantity}
                      <span className="fw-bold">kg</span>
                    </td>
                    <td>
                      {sale.totalPrice}
                      <span className="fw-bold">rwf</span>
                    </td>
                    <td>{sale.buyer}</td>
                    <td>
                      <span
                        className={`badge ${
                          sale.status === "paid" ? "bg-success" : "bg-warning"
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
                          onConfirm={() => handleUpdateSale(sale)}
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

      <UpdateSaleModal
        show={showUpdateModal}
        sale={selectedSale}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleSaveChanges}
      />

      {/* New: Add Sale Modal */}
      <AddSaleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSale}
      />
    </div>
  );
}

export default Sales;
