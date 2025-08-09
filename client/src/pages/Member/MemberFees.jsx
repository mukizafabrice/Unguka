import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchAllFeesById } from "../../services/feesService";

function Fees() {
  const [fees, setFees] = useState([]);
  // Function to fetch all necessary data
  const loadFeesData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const feesData = await fetchAllFeesById(userId);
      setFees(feesData);
    } catch (error) {
      console.error("Failed to fetch fees:", error);
      toast.error("Failed to load fees.");
    }
  };

  useEffect(() => {
    loadFeesData();
  }, []);

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Fees Dashboard
          </h4>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0 table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Season</th>
                <th>Fee Type</th>
                <th>Amount Owed</th>
                <th>Amount Paid</th>
                <th>Remaining Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length > 0 ? (
                fees.map((fee, index) => (
                  <tr key={fee._id || index}>
                    <td>{index + 1}</td>

                    <td>{fee.userId?.names}</td>
                    <td>
                      {fee.seasonId?.name || "N/A"} ({fee.seasonId?.year})
                    </td>
                    <td>{fee.feeTypeId?.name || "N/A"}</td>

                    <td>
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                      }).format(fee.amountOwed)}
                    </td>
                    <td>
                      {" "}
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                      }).format(fee.amountPaid)}
                    </td>
                    <td
                      style={{
                        color: fee.remainingAmount > 0 ? "#dc3545" : "#28a745",
                        fontWeight: "bold",
                      }}
                    >
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                      }).format(fee.remainingAmount)}
                    </td>
                    <td>{fee.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No fee records found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

export default Fees;
