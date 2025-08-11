import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchLoansById } from "../../services/loanService";
function Loan() {
  const [loans, setLoans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const loadLoans = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const loansData = await fetchLoansById(userId);
      setLoans(loansData || []);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      toast.error("Failed to load loans.");
      setLoans([]);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const viewLoanTransaction = () => {
    navigate("/member/dashboard/loan-transaction");
  };
  const rowsPerPage = 6;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = loans.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(loans.length / rowsPerPage);
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area">
          <div className="d-flex align-items-center justify-content-between">
            <div className="w-50">
              <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
                Loan Dashboard
              </h4>
              <p className="text-dark text-sm">
                A place to view and manage loan status, amounts, due dates, and
                payments.
              </p>
            </div>

            <button
              className="btn btn-success btn-sm"
              onClick={viewLoanTransaction}
            >
              <Eye />
              View loanTransaction
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Product</th>
                <th>Season</th>
                <th>Quantity</th>
                <th>Amount Owed</th>
                <th>Interest rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                currentRows.map((loan, index) => (
                  <tr key={loan._id}>
                    <td>{index + 1}</td>
                    <td>{loan.purchaseInputId?.userId?.names || "N/A"}</td>
                    <td>
                      {loan.purchaseInputId?.productId?.productName || "N/A"}
                    </td>
                    <td>
                      {loan.purchaseInputId?.seasonId?.name || "N/A"} (
                      {loan.purchaseInputId?.seasonId?.year})
                    </td>
                    <td>{loan.purchaseInputId?.quantity}kg</td>
                    <td>{formatCurrency(`${loan.amountOwed}`)}</td>
                    <td>{loan.interest}</td>
                    <td>
                      <span
                        className={`badge ${
                          loan.status === "repaid"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No loans found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="btn btn-outline-primary"
          >
            ← Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="btn btn-outline-primary"
          >
            Next →
          </button>
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

export default Loan;
