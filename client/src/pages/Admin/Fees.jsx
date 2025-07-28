import React, { useState, useEffect } from "react";

import { fetchFees } from "../../services/feesService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
function Stock() {
  // Fetch fees
  const [fees, setFees] = useState([]);
  useEffect(() => {
    const loadFees = async () => {
      try {
        const feesData = await fetchFees();
        setFees(feesData);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
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
            Fees Dashboard
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
                <th>Season</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.length > 0 ? (
                fees.map((fee, index) => (
                  <tr key={fee.id}>
                    <td>{index + 1}</td>
                    <td>{fee.userId?.names}</td>
                    <td>{fee.seasonId?.name}</td>
                    <td>{fee.amount}</td>
                    <td>
                      <span
                        className={`badge ${
                          fee.status === "paid" ? "bg-success" : "bg-warning"
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {fee.createdAt
                        ? new Date(fee.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateReason(fee)}
                          confirmMessage={`Are you sure you want to update fees for "${
                            fee.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(fee._id)}
                          confirmMessage={`Are you sure you want to delete fees "${
                            fee.userId?.names || "N/A"
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
                      No fee found.
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
