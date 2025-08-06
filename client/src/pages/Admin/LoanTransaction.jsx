// src/pages/LoanTransactions.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLoanTransactions } from "../../services/loanTransactionService";
import { ArrowLeft } from "lucide-react";

const LoanTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handleBack}
            className="btn btn-outline-secondary d-flex align-items-center"
          >
            <ArrowLeft className="me-2" size={18} />
            Back
          </button>
          <h2 className="text-primary m-0">Loan Transactions</h2>
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
                <th>Loan Status</th>
                <th>Amount Paid</th>
                <th>Remaining</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <tr key={tx._id}>
                    <td>{index + 1}</td>
                    <td>{tx.userId?.names || "N/A"}</td>
                    <td>{tx.loanId?.status || "N/A"}</td>
                    <td>{tx.amountPaid} RWF</td>
                    <td>{tx.amountRemainingToPay} RWF</td>
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
        </div>
      )}
    </div>
  );
};

export default LoanTransactions;
