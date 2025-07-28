import React, { useState, useEffect } from "react";

import { fetchPurchaseInputs } from "../../services/purchaseInputsService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
function PurchaseInputs() {
  // Fetch fees
  const [purchaseInputs, setPurchaseInputs] = useState([]);
  useEffect(() => {
    const loadFees = async () => {
      try {
        const purchaseData = await fetchPurchaseInputs();
        setPurchaseInputs(purchaseData);
      } catch (error) {
        console.error("Failed to fetch purchase:", error);
      }
    };

    loadFees();
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
            Purchases Dashboard
          </h4>
          {/* onClick={() => setShowAddModal(true)}  this  will be added into button in future*/}

          <AddButton label="Add Fees" />
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
                <th>quantity</th>
                <th>Amount</th>
                <th>Payment Type</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchaseInputs.length > 0 ? (
                purchaseInputs.map((purchaseInput, index) => (
                  <tr key={purchaseInput.id}>
                    <td>{index + 1}</td>
                    <td>{purchaseInput.userId?.names}</td>
                    <td>{purchaseInput.productId?.productNames}</td>
                    <td>{purchaseInput.seasonId?.name}</td>
                    <td>{purchaseInput.totalPrice}</td>
                    <td>
                      <span
                        className={`badge ${
                          purchaseInput.status === "cash"
                            ? "bg-success"
                            : "bg-warning"
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

                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateReason(purchaseInput)}
                          confirmMessage={`Are you sure you want to update fees for "${
                            purchaseInput.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(purchaseInput._id)}
                          confirmMessage={`Are you sure you want to delete fees "${
                            purchaseInput.userId?.names || "N/A"
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
                      No Purchases found.
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

export default PurchaseInputs;
