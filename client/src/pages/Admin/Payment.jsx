import React, { useState, useEffect, useCallback } from "react";
import {
  fetchPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "../../services/paymentService";
import { fetchUsers } from "../../services/userService";
import { fetchSeasons } from "../../services/seasonService";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddButton from "../../components/buttons/AddButton";
import AddPaymentModal from "../../features/modals/AddPaymentModal"; // Adjust path if needed

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editAmountPaid, setEditAmountPaid] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false); // Used for both modal submission and general data loading indicator

  // Using useCallback to memoize loadData, preventing unnecessary re-renders
  // and ensuring it's stable for useEffect dependencies if ever added.
  const loadData = useCallback(async () => {
    setLoading(true); // Indicate loading when fetching initial data
    try {
      // Fetch all necessary data concurrently
      const [usersData, seasonsData, paymentsData] = await Promise.all([
        fetchUsers(),
        fetchSeasons(),
        fetchPayments(),
      ]);
      setUsers(usersData);
      setSeasons(seasonsData);
      setPayments(paymentsData);
      console.log("Initial data loaded successfully.");
    } catch (error) {
      console.error(
        "Error loading initial data (Users, Seasons, Payments):",
        error
      );
      toast.error(
        "Error loading initial data. Please check console for details."
      );
    } finally {
      setLoading(false); // End loading
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    loadData();
  }, [loadData]); // loadData is stable due to useCallback

  // Handler for creating a new payment from the modal
  const handleCreatePayment = async (newPayment) => {
    setLoading(true); // Indicate loading during payment creation
    try {
      console.log("Attempting to create payment:", newPayment);
      await createPayment(newPayment);
      toast.success("Payment recorded successfully!");
      setShowAddModal(false); // Close the modal on success
      await loadData(); // Reload all data to show the new payment
    } catch (error) {
      console.error("Payment creation failed:", error);
      // More specific error messages could be extracted from error.response.data if available
      toast.error(
        error.response?.data?.message ||
          "Payment creation failed. Please try again."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  // Handlers for editing existing payments in the table
  const startEdit = (payment) => {
    setEditPaymentId(payment._id);
    setEditAmountPaid(payment.amountPaid.toString()); // Convert to string for input value
  };

  const cancelEdit = () => {
    setEditPaymentId(null);
    setEditAmountPaid("");
  };

  const handleUpdate = async () => {
    if (!editPaymentId) {
      toast.error("No payment selected for update.");
      return;
    }
    const parsedAmountPaid = parseFloat(editAmountPaid);
    if (isNaN(parsedAmountPaid) || parsedAmountPaid <= 0) {
      toast.warning(
        "Please enter a valid amount to update (must be positive)."
      );
      return;
    }

    try {
      setLoading(true); // Indicate loading during update
      const paymentToUpdate = payments.find((p) => p._id === editPaymentId);
      if (!paymentToUpdate) {
        toast.error("Payment not found for update.");
        setLoading(false);
        return;
      }

      const updatedPayment = {
        amountPaid: parsedAmountPaid,
      };

      console.log("Updating payment:", editPaymentId, updatedPayment);
      await updatePayment(editPaymentId, updatedPayment);
      toast.success("Payment updated successfully!");
      setEditPaymentId(null);
      setEditAmountPaid("");
      await loadData();
    } catch (error) {
      console.error("Payment update failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Payment update failed. Please try again."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  // Handler for deleting a payment
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this payment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true); // Indicate loading during deletion
      console.log("Attempting to delete payment with ID:", id);
      await deletePayment(id);
      toast.success("Payment deleted successfully!");
      await loadData(); // Reload data to remove the deleted payment
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete payment. Please try again."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Manage Payments</h2>
      <AddButton
        label="Add Payment"
        onClick={() => setShowAddModal(true)}
        disabled={loading}
      />

      <AddPaymentModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        users={users} // Passed to modal for dropdown
        seasons={seasons} // Passed to modal for dropdown
        onCreatePayment={handleCreatePayment} // The function to call when payment is submitted
        loading={loading} // Pass loading state to disable modal buttons during API calls
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
            {" "}
            {/* Added responsive table */}
            <table className="table table-bordered table-hover mt-3">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Season</th>
                  <th>Paid Amount</th>
                  <th>Amount Due</th>
                  <th>Remaining to Pay</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{p.userId?.names || "N/A"}</td>{" "}
                    {/* Handle null user data */}
                    <td>
                      {p.seasonId?.name && p.seasonId?.year
                        ? `${p.seasonId.name} ${p.seasonId.year}`
                        : "N/A"}
                    </td>
                    <td>
                      {editPaymentId === p._id ? (
                        <input
                          type="number"
                          value={editAmountPaid}
                          onChange={(e) => setEditAmountPaid(e.target.value)}
                          className="form-control"
                          style={{ maxWidth: "120px" }}
                        />
                      ) : (
                        `$${p.amountPaid?.toFixed(2) || "0.00"}`
                      )}
                    </td>
                    <td>${p.amountDue?.toFixed(2) || "0.00"}</td>
                    <td>${p.amountRemainingToPay?.toFixed(2) || "0.00"}</td>
                    <td>
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {editPaymentId === p._id ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={handleUpdate}
                            disabled={loading} // Disable save during loading
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={cancelEdit}
                            disabled={loading} // Disable cancel during loading
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => startEdit(p)}
                            disabled={loading} // Disable edit during loading
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(p._id)}
                            disabled={loading} // Disable delete during loading
                          >
                            Delete
                          </button>
                        </>
                      )}
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
