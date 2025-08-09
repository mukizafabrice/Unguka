import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchFeeTypes } from "../../services/feeTypeService";

function FeeType() {
  const [feeTypes, setFeeTypes] = useState([]);

  // Function to fetch fee types from the backend
  const loadFeeTypes = async () => {
    try {
      const feeTypesData = await fetchFeeTypes();
      setFeeTypes(feeTypesData);
    } catch (error) {
      console.error("Failed to fetch fee types:", error);
      toast.error("Failed to load fee types.");
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    loadFeeTypes();
  }, []);

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Fee Types Dashboard
          </h4>
          <p className="text-dark">
            The Fee Types Dashboard shows all fee categories in the cooperative.
            It helps manage and track member payments easily.
          </p>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {feeTypes.length > 0 ? (
                feeTypes.map((feeType, index) => (
                  <tr key={feeType._id || index}>
                    <td>{index + 1}</td>
                    <td>{feeType.name}</td>
                    <td>{feeType.amount}</td>
                    <td>{feeType.description || "N/A"}</td>
                    <td>
                      <span
                        className={`badge ${
                          feeType.status === "active"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {feeType.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No fee types found.
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

export default FeeType;
