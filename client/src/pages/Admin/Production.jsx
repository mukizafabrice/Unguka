import React, { useState, useEffect } from "react";

import { fetchProductions } from "../../services/productionService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import { PlusCircle } from "lucide-react";
function Stock() {
  // Fetch season
  const [productions, setProductions] = useState([]);
  useEffect(() => {
    const loadStock = async () => {
      try {
        const productionsData = await fetchProductions();
        setProductions(productionsData);
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
            Productions Dashboard
          </h4>
          {/* New: Add Sale Button */}
          <button
            className="btn btn-success d-flex align-items-center"
            //   onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={20} className="me-2" /> Add Production
          </button>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>ProductName</th>
                <th>Season</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {productions.length > 0 ? (
                productions.slice(0, 3).map((production, index) => (
                  <tr key={production.id}>
                    <td>{index + 1}</td>
                    <td>{production.userId.names}</td>
                    <td>{production.productId.productName}</td>
                    <td>{production.seasonId.name}</td>
                    <td>{production.quantity}</td>
                    <td>{production.totalPrice}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateReason(production)}
                          confirmMessage={`Are you sure you want to update stock for "${
                            production.productId?.productName || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(production._id)}
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
