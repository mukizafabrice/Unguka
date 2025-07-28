import React, { useState, useEffect } from "react";

import { fetchStock } from "../../services/stockService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";

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
        <div className="dashboard-content-area">
          <h4 className="fs-4 fw-medium mb-3" style={{ color: "black" }}>
            Season Dashboard
          </h4>
        </div>
      </div>

      <div className="row">
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
                  <td colSpan="5" className="text-center">
                    No productions found.
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
