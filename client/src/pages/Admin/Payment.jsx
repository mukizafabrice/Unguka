import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PlusCircle } from "lucide-react"; // Assuming PlusCircle is still desired for the Add button

import {
  fetchPayments,
  createPayments,
  updatePayments,
  deletePayments,
} from "../../services/paymentService"; // Import all payment service functions

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";

import AddPaymentModal from "../../features/modals/AddPaymentModal"; // Import the new AddPaymentModal
import UpdatePaymentModal from "../../features/modals/UpdatePaymentModal"; // Import the new UpdatePaymentModal

function Payment() {
  const [payments, setPayments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null); // To store the payment being updated

  // Function to load payments data from the backend
  const loadPayments = async () => {
    try {
      const paymentsData = await fetchPayments();
      // The fetchPayments service now handles parsing response.data or response directly
      setPayments(paymentsData.data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payments."); // User-friendly error notification
      setPayments([]); // Ensure payments state is an empty array on error
    }
  };

  // Effect hook to load payments when the component mounts
  useEffect(() => {
    loadPayments();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handler for adding a new payment
  const handleAddPayment = async (newPaymentData) => {
    try {
      await createPayments(newPaymentData); // API call to create the payment
      toast.success("Payment added successfully!"); // Success notification
      await loadPayments(); // Re-fetch all payments to update the table with the new entry
      setShowAddModal(false); // Close the Add Payment modal
    } catch (error) {
      console.error("Failed to add payment:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to add payment: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for opening the Update Payment modal
  const handleOpenUpdateModal = (payment) => {
    setSelectedPayment(payment); // Set the payment object to be edited
    setShowUpdateModal(true); // Open the Update Payment modal
  };

  // Handler for saving changes from the Update Payment modal
  const handleUpdatePayment = async (paymentId, updatedPaymentData) => {
    try {
      await updatePayments(paymentId, updatedPaymentData); // API call to update the payment
      toast.success("Payment updated successfully!"); // Success notification
      await loadPayments(); // Re-fetch all payments to update the table with changes
      setShowUpdateModal(false); // Close the Update Payment modal
      setSelectedPayment(null); // Clear the selected payment state
    } catch (error) {
      console.error("Failed to update payment:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to update payment: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a payment
  const handleDeletePayment = async (id) => {
    try {
      await deletePayments(id); // API call to delete the payment
      toast.success("Payment deleted successfully!"); // Success notification
      await loadPayments(); // Re-fetch all payments to update the table (removed item)
    } catch (error) {
      console.error("Failed to delete payment:", error);
      // Display a more specific error message from the backend if available
      toast.error(
        `Failed to delete payment: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Payment Dashboard
          </h4>
          {/* Button to open the Add Payment modal */}
          <button
            className="btn btn-success d-flex align-items-center"
            onClick={() => setShowAddModal(true)} // Correctly opens the AddPaymentModal
          >
            <PlusCircle size={20} className="me-1" /> Add Payment
          </button>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Product Name</th>
                <th>Season</th>
                <th>Amount</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>{" "}
                {/* Colspan for Update and Delete buttons */}
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <tr key={payment._id}>
                    {" "}
                    {/* Use payment._id as the unique key for each row */}
                    <td>{index + 1}</td>
                    {/* Use optional chaining (?.) for nested properties */}
                    <td>{payment.productionId?.userId?.names || "N/A"}</td>
                    <td>
                      {payment.productionId?.productId?.productName || "N/A"}
                    </td>
                    <td>{payment.productionId?.seasonId?.name || "N/A"}</td>
                    <td>{payment.amount}RwF</td>
                    <td>
                      {/* Format the date for display */}
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* Update Button */}
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(payment)} // Pass the entire payment object for editing
                          confirmMessage={`Are you sure you want to update payment for "${
                            payment.productionId?.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        {/* Delete Button */}
                        <DeleteButton
                          onConfirm={() => handleDeletePayment(payment._id)} // Pass the payment's _id for deletion
                          confirmMessage={`Are you sure you want to delete payment "${
                            payment.productionId?.userId?.names || "N/A"
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
                  {/* Message when no payments are found, colSpan matches total columns */}
                  <td colSpan="8" className="text-center py-4">
                    {" "}
                    {/* Adjusted colspan to 8 */}
                    <div className="alert alert-info" role="alert">
                      No payments found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal Component */}
      <AddPaymentModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPayment}
      />

      {/* Update Payment Modal Component */}
      <UpdatePaymentModal
        show={showUpdateModal}
        payment={selectedPayment} // Prop name 'payment' passed to the modal
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdatePayment} // Handler for saving updates from the modal
      />

      {/* ToastContainer for displaying success/error notifications */}
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

export default Payment;
