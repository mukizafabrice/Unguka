import React, { useState, useEffect, useCallback } from "react";
import { fetchPayments } from "../../services/paymentService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddButton from "../../components/buttons/AddButton";
import AddPaymentModal from "../../features/modals/AddPaymentModal";

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // Load payments data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const paymentsData = await fetchPayments();

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

  const handlePaymentSubmissionSuccess = async () => {
    setShowAddModal(false);
    await loadData();
  };

  const viewpaymentTransaction = () => {
    navigate("/admin/dashboard/payment-transaction");
  };

  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = payments.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(payments.length / rowsPerPage);

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
    <div className="container py-4">
      <h2 className="mb-4 text-center">Manage Payments</h2>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <AddButton
          label="Create Payment"
          onClick={() => setShowAddModal(true)}
          disabled={loading}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={viewpaymentTransaction}
        >
          View PaymentTransactions
        </button>
      </div>
      <AddPaymentModal
        show={showAddModal}
        onClose={handlePaymentSubmissionSuccess}
      />
      <div
        className="card p-3 mt-4 overflow-auto"
        style={{ maxHeight: "400px" }}
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
              <thead className="relative-top">
                <tr>
                  <th>User</th>
                  <th>Paid Amount</th>
                  <th>Amount Due</th>
                  <th>Remaining to Pay</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((p) => (
                  <tr key={p._id}>
                    <td>{p.userName}</td>

                    <td>{formatCurrency(`${p.amountPaid || "0.00"}`)}</td>
                    <td>{formatCurrency(`${p.amountDue || "0.00"}`)}</td>
                    <td>
                      {formatCurrency(`${p.amountRemainingToPay || "0.00"}`)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === "paid" ? "bg-success" : "bg-warning"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  );
};

export default Payment;
