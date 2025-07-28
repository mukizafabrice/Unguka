import React, { useState, useEffect } from "react";

import { fetchStock } from "../../services/stockService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import { PlusCircle } from "lucide-react";
function Stock() {
  // Fetch season
  const [stocks, setStocks] = useState([]);
  useEffect(() => {
    const loadStock = async () => {
      try {
        const productionsData = await fetchStock();
        setStocks(productionsData);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadStock();
  }, []);

  const handleUpdateReason = () => {
    alert("click to update");
  };
  const handleDeleteSale = () => {
    alert("hello world");
  };
  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Stocks Dashboard
          </h4>
          {/* New: Add Sale Button */}
          <button
            className="btn btn-success d-flex align-items-center"
            // onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={20} className="me-2" /> Add Stock
          </button>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>ProductName</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length > 0 ? (
                stocks.slice(0, 3).map((stock, index) => (
                  <tr key={stock.id}>
                    <td>{index + 1}</td>
                    <td>{stock.productId.productName}</td>

                    <td>{stock.quantity}</td>
                    <td>{stock.totalPrice}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateReason(stock)}
                          confirmMessage={`Are you sure you want to update stock for "${
                            stock.stockId?.productId?.productName || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(stock._id)}
                          confirmMessage={`Are you sure you want to delete stock "${
                            stock.stockId?.productId?.productName || "N/A"
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
                      No stock found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Stock;
