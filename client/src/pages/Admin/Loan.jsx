import React, { useState, useEffect } from "react";

import { fetchLoans } from "../../services/loanService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
function Loan() {
  // Fetch season
  const [loans, setLoans] = useState([]);
  useEffect(() => {
    const loadLoan = async () => {
      try {
        const loansData = await fetchLoans();
        setLoans(loansData.loans);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadLoan();
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
            Loan Dashboard
          </h4>
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
                <th>Status</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan, index) => (
                  <tr key={loan._id}>
                    <td>{index + 1}</td>
                    <td>{loan.purchaseInputId?.userId?.names}</td>
                    <td>{loan.purchaseInputId?.productId?.productName}</td>
                    <td>{loan.purchaseInputId?.seasonId?.name}</td>
                    <td>{loan.quantity}</td>
                    <td>{loan.totalPrice}</td>
                    <td>
                      <span
                        className={`badge ${
                          loan.status === "repaid" ? "bg-success" : "bg-warning"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateReason(loan)}
                          confirmMessage={`Are you sure you want to update stock for "${
                            loan.purchaseInputId?.productId?.productName ||
                            "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(loan._id)}
                          confirmMessage={`Are you sure you want to delete stock "${
                            loan.purchaseInputId?.productId?.productName ||
                            "N/A"
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

export default Loan;
