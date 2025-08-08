import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  fetchPaymentSummary,
  createPayment,
} from "../../services/paymentService";
import { fetchFeeTypes } from "../../services/feeTypeService";
import { fetchUsers } from "../../services/userService";

const AddPaymentModal = ({ show, onClose }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState({
    fees: [],
    loans: [],
    payments: [],
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feeTypes, setFeeTypes] = useState([]);

  useEffect(() => {
    if (!show) {
      setSelectedUser("");
      setAmountPaid("");
      setSummary(null);
      setDetails({ fees: [], loans: [], payments: [] });
    }
  }, [show]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [usersData, feeTypesData] = await Promise.all([
          fetchUsers(),
          fetchFeeTypes(),
        ]);
        setUsers(usersData);
        setFeeTypes(feeTypesData);
      } catch (error) {
        console.error("Failed to load initial data", error);
        toast.error("Failed to load users or fee types.");
      } finally {
        setInitialLoading(false);
      }
    };
    if (show) {
      loadInitialData();
    }
  }, [show]);

  const getFeeTypeName = useCallback(
    (feeTypeId) => {
      const type = feeTypes.find((ft) => ft._id === feeTypeId);
      return type ? type.name : "Unknown Fee Type";
    },
    [feeTypes]
  );

  useEffect(() => {
    const loadSummary = async () => {
      if (selectedUser) {
        setLoading(true);
        try {
          // Now backend API only needs userId, no season
          const data = await fetchPaymentSummary(selectedUser);
          setSummary({
            totalProduction: data.totalProduction,
            totalUnpaidFees: data.totalUnpaidFees,
            totalLoans: data.totalLoans,
            previousRemaining: data.previousRemaining,
            currentNet: data.currentNet,
            amountDue: data.netPayable,
            existingPartialPayment: data.existingPartialPayment,
          });
          setDetails({
            fees: data.fees.map((fee) => ({
              ...fee,
              feeTypeName: getFeeTypeName(fee.feeTypeId),
              remainingAmount: fee.amountOwed - (fee.amountPaid || 0),
            })),
            loans: data.loans,
            payments: data.payments,
          });

          // Pre-fill amountPaid based on existing partial or netPayable
          if (data.existingPartialPayment) {
            setAmountPaid(
              data.existingPartialPayment.amountRemainingToPay.toFixed(2)
            );
          } else if (data.netPayable > 0) {
            setAmountPaid(data.netPayable.toFixed(2));
          } else {
            setAmountPaid("0.00");
          }

          toast.success("Payment summary loaded!");
        } catch (error) {
          console.error("Failed to load summary:", error);
          toast.error("Failed to load payment details.");
          setSummary(null);
        } finally {
          setLoading(false);
        }
      } else {
        setSummary(null);
      }
    };
    loadSummary();
  }, [selectedUser, getFeeTypeName]);

  const handleSubmit = async () => {
    if (!summary) {
      toast.warning("Payment summary is not available.");
      return;
    }
    const parsedAmountPaid = parseFloat(amountPaid);
    if (isNaN(parsedAmountPaid) || parsedAmountPaid <= 0) {
      toast.warning("Please enter a valid amount to pay.");
      return;
    }

    let maxAllowedAmount = summary.amountDue;
    if (summary.existingPartialPayment) {
      maxAllowedAmount = summary.existingPartialPayment.amountRemainingToPay;
    }

    if (parsedAmountPaid > maxAllowedAmount) {
      toast.warning(
        `Amount paid ($${parsedAmountPaid.toFixed(
          2
        )}) cannot exceed the remaining amount due ($${maxAllowedAmount.toFixed(
          2
        )}).`
      );
      return;
    }

    try {
      const newPayment = {
        userId: selectedUser,
        amountPaid: parsedAmountPaid,
      };
      await createPayment(newPayment);
      toast.success("Payment submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Payment submission error:", error);
      const serverErrorMessage =
        error?.response?.data?.message || // Express-style error
        error?.response?.data?.error || // Alternate backend format
        error?.message || // Fallback
        "An unexpected error occurred.";

      toast.error(`Payment failed: ${serverErrorMessage}`);
    }
  };

  if (!show) return null;

  const payButtonDisabled =
    loading ||
    initialLoading ||
    !summary ||
    isNaN(parseFloat(amountPaid)) ||
    parseFloat(amountPaid) <= 0 ||
    parseFloat(amountPaid) >
      (summary?.existingPartialPayment?.amountRemainingToPay ||
        summary?.amountDue ||
        0);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Payment</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            {(loading || initialLoading) && (
              <div className="text-center my-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {!initialLoading && (
              <>
                <div className="mb-3">
                  <label htmlFor="userSelect" className="form-label">
                    Select User
                  </label>
                  <select
                    id="userSelect"
                    className="form-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Select User --</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.names}
                      </option>
                    ))}
                  </select>
                </div>

                {summary && !loading && (
                  <>
                    {summary.existingPartialPayment ? (
                      <div className="alert alert-info mt-4">
                        <h5 className="mb-2">Continuing Payment</h5>
                        <p className="fw-bold fs-4 text-center">
                          Remaining Amount to Pay:
                          <span className="badge bg-danger ms-2">
                            {formatCurrency(`$
                            {summary.existingPartialPayment.amountRemainingToPay}`)}{" "}
                          </span>
                        </p>
                        <p className="text-muted text-center">
                          This reflects the outstanding balance from a previous
                          payment.
                        </p>
                      </div>
                    ) : (
                      <>
                        <h6 className="mt-4 border-bottom pb-2">
                          Summary Totals
                        </h6>
                        <ul className="list-group mb-3">
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            Total Production Value:
                            <span className="badge bg-primary rounded-pill">
                              {formatCurrency(`${summary.totalProduction}`)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            Total Unpaid Fees:
                            <span className="badge bg-danger rounded-pill">
                              {formatCurrency(`${summary.totalUnpaidFees}`)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            Total Unpaid Loans:
                            <span className="badge bg-warning text-dark rounded-pill">
                              {formatCurrency(`${summary.totalLoans}`)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center fw-bold fs-5">
                            Net Balance:
                            <span className="badge bg-info rounded-pill">
                              {formatCurrency(`${summary.currentNet}`)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            Previous Payments with Remaining Balance:
                            <span className="badge bg-success rounded-pill">
                              {formatCurrency(`${summary.previousRemaining}`)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center fw-bold fs-5">
                            Total Amount Due:
                            <span className="badge bg-success rounded-pill">
                              {formatCurrency(`${summary.amountDue}`)}
                            </span>
                          </li>
                        </ul>

                        <h6 className="mt-4 border-bottom pb-2">
                          Unpaid Fees Breakdown
                        </h6>
                        {details.fees.length > 0 ? (
                          <ul className="list-group mb-3">
                            {details.fees.map((fee) => (
                              <li
                                key={fee._id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                Fee Type: {fee.feeTypeName}
                                <span className="badge bg-danger rounded-pill">
                                  Remaining:
                                  {formatCurrency(
                                    `${fee.amountOwed - (fee.amountPaid || 0)}`
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="alert alert-info mt-2">
                            No outstanding fees for this user.
                          </div>
                        )}

                        <h6 className="mt-4 border-bottom pb-2">
                          Outstanding Loans Breakdown
                        </h6>
                        {details.loans.length > 0 ? (
                          <ul className="list-group mb-3">
                            {details.loans.map((loan) => (
                              <li
                                key={loan._id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                Loan on{" "}
                                {new Date(loan.createdAt).toLocaleDateString()}
                                <span className="badge bg-warning text-dark rounded-pill">
                                  Amount Owed: {loan.amountOwed}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="alert alert-info mt-2">
                            No outstanding loans for this user.
                          </div>
                        )}

                        <h6 className="mt-4 border-bottom pb-2">
                          Previous Payments with Remaining Balance
                        </h6>
                        {details.payments.length > 0 ? (
                          <ul className="list-group mb-3">
                            {details.payments.map((prevPayment) => (
                              <li
                                key={prevPayment._id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                Payment on{" "}
                                {new Date(
                                  prevPayment.createdAt
                                ).toLocaleDateString()}
                                <span className="badge bg-success rounded-pill">
                                  Remaining:{" "}
                                  {formatCurrency(
                                    `${prevPayment.amountRemainingToPay}`
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="alert alert-info mt-2">
                            No previous payments with remaining balances for
                            this user.
                          </div>
                        )}
                      </>
                    )}
                    <div className="mb-3 mt-4">
                      <label
                        htmlFor="amountPaidInput"
                        className="form-label fw-bold"
                      >
                        Amount to Pay
                      </label>
                      <input
                        id="amountPaidInput"
                        type="number"
                        className="form-control form-control-lg"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder={`Enter amount (Max: ${
                          summary.existingPartialPayment
                            ? summary.existingPartialPayment
                                .amountRemainingToPay
                            : summary.amountDue
                        })`}
                      />
                      <div className="form-text">
                        Amount remain: 
                        {formatCurrency(` ${summary.amountDue - amountPaid}`)}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading || initialLoading}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={payButtonDisabled}
            >
              Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
