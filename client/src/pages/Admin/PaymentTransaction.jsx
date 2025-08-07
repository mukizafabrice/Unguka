import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { fetchPaymentTransactions } from "../../services/paymentTransactionService";
import { ArrowLeft } from "lucide-react";

const PaymentTransaction = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load payments data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const paymentsData = await fetchPaymentTransactions();

      // Map user info, remove season (no longer available)
      const mappedPayments = paymentsData.map((payment) => {
        const userName = payment.userId?.names || "N/A";
        return {
          ...payment,
          userName,
          // seasonName removed because seasons are no longer used
        };
      });

      setPayments(mappedPayments);
      console.log("Payment data loaded successfully.");
    } catch (error) {
      console.error("Error loading payment data:", error);
      toast.error(
        "Error loading payment data. Please check console for details."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const handleBack = () => navigate(-1);
  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center text-black"> Payments Transactions</h2>
      <button
        onClick={handleBack}
        className="btn btn-outline-secondary d-flex align-items-center"
      >
        <ArrowLeft className="me-2" size={18} />
        Back
      </button>
      <div
        className="card p-3 mt-4 overflow-auto"
        style={{ maxHeight: "450px" }}
      >
        <h5>All Payments</h5>
        {loading && (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {!loading && payments.length === 0 && (
          <div className="alert alert-info text-center">
            No payments recorded yet.
          </div>
        )}
        {!loading && payments.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered table-hover mt-3">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Paid Amount</th>
                  <th>Remaining to Pay</th>
                  {/* <th>Status</th> */}
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{p.userName}</td>
                    <td>
                      {formatCurrency(`${p.amountPaid?.toFixed(2) || "0.00"}`)}
                    </td>
                    <td>
                      {formatCurrency(
                        `${p.amountRemainingToPay?.toFixed(2) || "0.00"}`
                      )}
                    </td>
                    {/* 
                    <td>
                      <span
                        className={`badge ${
                          p.status === "paid" ? "bg-success" : "bg-warning"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td> */}
                    <td>
                      {p.transactionDate
                        ? new Date(p.transactionDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTransaction;
