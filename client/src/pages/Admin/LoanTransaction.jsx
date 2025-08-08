// src/pages/LoanTransactions.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLoanTransactions } from "../../services/loanTransactionService";
import { ArrowLeft } from "lucide-react";

const LoanTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const res = await fetchLoanTransactions();
        setTransactions(res.transactions);
      } catch (error) {
        console.error("Failed to fetch loan transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    getTransactions();
  }, []);

  const handleBack = () => navigate(-1);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };
  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = transactions.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center  gap-8">
          <button
            onClick={handleBack}
            className="btn btn-outline-secondary d-flex align-items-center"
          >
            <ArrowLeft className="me-2" size={18} />
            Back
          </button>
          <h2 className="text-primary text-center m-0">Loan Transactions</h2>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>id</th>
                <th>Member</th>
                <th>Amount Paid</th>
                <th>Remaining</th>
                <th>Loan Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                currentRows.map((tx, index) => (
                  <tr key={tx._id}>
                    <td>{index + 1}</td>
                    <td>
                      {tx.loanId?.purchaseInputId?.userId?.names || "N/A"}
                    </td>
                    <td>{formatCurrency(`${tx.amountPaid}`)}</td>
                    <td>{formatCurrency(`${tx.amountRemainingToPay}`)}</td>
                    <td>
                      <span
                        className={`badge ${
                          tx.loanId?.status === "repaid"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {tx.loanId?.status}
                      </span>
                    </td>
                    <td>
                      {tx.transactionDate
                        ? new Date(tx.transactionDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="btn btn-outline-primary"
            >
              ← Previous
            </button>
            <span>
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
      )}
    </div>
  );
};

export default LoanTransactions;
