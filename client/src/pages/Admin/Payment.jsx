import React, { useState, useEffect, useCallback } from "react";
import { fetchPayments } from "../../services/paymentService"; // Only fetching payments for display
// Removed direct imports for fetchUsers and fetchSeasons as per the request
// import { fetchUsers } from "../../services/userService";
// import { fetchSeasons } from "../../services/seasonService";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddButton from "../../components/buttons/AddButton";
import AddPaymentModal from "../../features/modals/AddPaymentModal"; // Adjust path if needed

const Payment = () => {
  const [payments, setPayments] = useState([]);
  // Removed users and seasons state variables as they are no longer directly fetched here
  // const [users, setUsers] = useState([]);
  // const [seasons, setSeasons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // loadData now only fetches payments.
  // It assumes that the paymentsData returned by fetchPayments()
  // already contains populated user and season details.
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const paymentsData = await fetchPayments(); // This should ideally return populated data

      // Map payment data to include user and season names for display.
      // This relies on the backend populating userId and seasonId in the Payment documents.
      const mappedPayments = paymentsData.map((payment) => {
        // Access populated fields directly. If not populated by backend, these will be 'N/A'.
        const userName = payment.userId?.names || "N/A";
        const seasonName =
          payment.seasonId?.name && payment.seasonId?.year
            ? `${payment.seasonId.name} ${payment.seasonId.year}`
            : "N/A";

        return {
          ...payment,
          userName,
          seasonName,
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
  }, []); // Empty dependency array means this function is created once

  // Effect to load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]); // loadData is stable due to useCallback

  // This function is passed to the modal. After a successful payment,
  // it triggers a reload of the payments list to reflect the new record.
  const handlePaymentSubmissionSuccess = async () => {
    setShowAddModal(false); // Close the modal
    await loadData(); // Reload all payment data
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Manage Payments</h2>
      <AddButton
        label="Add Payment"
        onClick={() => setShowAddModal(true)}
        disabled={loading} // Disable button if main payment list is loading
      />

      {/* AddPaymentModal is rendered here. 
          It now fetches its own users and seasons data internally.
          The onClose callback triggers a data reload for the main table. */}
      <AddPaymentModal
        show={showAddModal}
        onClose={handlePaymentSubmissionSuccess}
      />

      <div className="card p-3 mt-4">
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
                  <th>Season</th>
                  <th>Paid Amount</th>
                  <th>Amount Due</th>
                  <th>Remaining to Pay</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  {/* The "Actions" column is removed as per discussion */}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{p.userName}</td> {/* Display mapped user name */}
                    <td>{p.seasonName}</td> {/* Display mapped season name */}
                    <td>${p.amountPaid?.toFixed(2) || "0.00"}</td>
                    <td>${p.amountDue?.toFixed(2) || "0.00"}</td>
                    <td>${p.amountRemainingToPay?.toFixed(2) || "0.00"}</td>
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
    </div>
  );
};

export default Payment;
