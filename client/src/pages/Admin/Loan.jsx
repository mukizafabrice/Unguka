import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchLoans,
  updateLoans,
  deleteLoans,
} from "../../services/loanService";

import PayLoanModal from "../../features/modals/PayLoanModal";
import UpdateButton from "../../components/buttons/UpdateButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateLoanModal from "../../features/modals/UpdateLoanModal";

function Loan() {
  const [loans, setLoans] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const navigate = useNavigate();
  const loadLoans = async () => {
    try {
      const loansData = await fetchLoans();
      // The backend returns an array directly, so we use loansData directly.
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

  const handleOpenPayModal = (loan) => {
    setSelectedLoan(loan);
    setShowPayModal(true);
  };

  const handleOpenUpdateModal = (loan) => {
    setSelectedLoan(loan);
    setShowUpdateModal(true);
  };

  const handleUpdateLoan = async (loanId, updatedLoanData) => {
    try {
      await updateLoans(loanId, updatedLoanData);
      toast.success("Loan updated successfully!");
      await loadLoans();
      setShowUpdateModal(false);
      setSelectedLoan(null);
    } catch (error) {
      console.error("Failed to update loan:", error);
      toast.error(
        `Failed to update loan: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const handlePayLoan = async (loanId, amountPaid) => {
    try {
      await updateLoans(loanId, { amountPaid });
      toast.success("Loan payment processed successfully!");
      await loadLoans();
      setShowPayModal(false);
      setSelectedLoan(null);
    } catch (error) {
      console.error("Failed to process payment:", error);
      toast.error(
        `Failed to process payment: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleDeleteLoan = async (id) => {
    try {
      await deleteLoans(id);
      toast.success("Loan deleted successfully!");
      await loadLoans();
    } catch (error) {
      console.error("Failed to delete loan:", error);
      toast.error(
        `Failed to delete loan: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  const viewLoanTransaction = () => {
    navigate("/admin/dashboard/loan-transaction");
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area">
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
              Loan Dashboard
            </h4>
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
                <th colSpan={3}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan, index) => (
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
                    <td>
                      <div className="d-flex gap-2">
                        {loan.status === "pending" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenPayModal(loan)}
                          >
                            Pay
                          </button>
                        )}
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(loan)}
                          confirmMessage={`Are you sure you want to update loan for "${
                            loan.purchaseInputId?.productId?.name || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteLoan(loan._id)}
                          confirmMessage={`Are you sure you want to delete loan for "${
                            loan.purchaseInputId?.productId?.name || "N/A"
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
      </div>

      <PayLoanModal
        show={showPayModal}
        loan={selectedLoan}
        onClose={() => setShowPayModal(false)}
        onSubmit={handlePayLoan}
      />

      <UpdateLoanModal
        show={showUpdateModal}
        loan={selectedLoan}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateLoan}
      />

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
