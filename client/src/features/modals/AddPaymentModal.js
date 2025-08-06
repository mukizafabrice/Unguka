import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  fetchPaymentSummary,
  createPayment,
} from "../../services/paymentService";
import { fetchFeeTypes } from "../../services/feeTypeService";
import { fetchUsers } from "../../services/userService";
import { fetchSeasons } from "../../services/seasonService";

const AddPaymentModal = ({ show, onClose }) => {
  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
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
      setSelectedSeason("");
      setAmountPaid("");
      setSummary(null);
      setDetails({ fees: [], loans: [], payments: [] });
    }
  }, [show]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [usersData, seasonsData, feeTypesData] = await Promise.all([
          fetchUsers(),
          fetchSeasons(),
          fetchFeeTypes(),
        ]);
        setUsers(usersData);
        setSeasons(seasonsData);
        setFeeTypes(feeTypesData);
      } catch (error) {
        console.error("Failed to load initial data", error);
        toast.error("Failed to load users, seasons, or fee types.");
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
      if (selectedUser && selectedSeason) {
        setLoading(true);
        try {
          const data = await fetchPaymentSummary(selectedUser, selectedSeason);
          setSummary({
            totalProduction: data.totalProduction,
            totalUnpaidFees: data.totalUnpaidFees,
            totalLoans: data.totalLoans,
            previousRemaining: data.previousRemaining,
            currentSeasonNet: data.currentSeasonNet,
            amountDue: data.netPayable,
            // NEW: Store the existing partial payment record for current season
            existingPartialPaymentForCurrentSeason:
              data.existingPartialPaymentForCurrentSeason,
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

          // --- CONDITIONAL PRE-FILL LOGIC ---
          if (data.existingPartialPaymentForCurrentSeason) {
            // If there's an existing partial payment for THIS season, pre-fill with its remaining amount
            setAmountPaid(
              data.existingPartialPaymentForCurrentSeason.amountRemainingToPay.toFixed(
                2
              )
            );
          } else if (data.netPayable > 0) {
            // Otherwise, pre-fill with the overall net payable
            setAmountPaid(data.netPayable.toFixed(2));
          } else {
            setAmountPaid("0.00");
          }
          // --- END CONDITIONAL PRE-FILL LOGIC ---

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
  }, [selectedUser, selectedSeason, getFeeTypeName]);

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

    // --- CONDITIONAL VALIDATION LOGIC ---
    let maxAllowedAmount = summary.amountDue; // Default to overall net payable
    if (summary.existingPartialPaymentForCurrentSeason) {
      // If continuing a partial payment, max allowed is its remaining balance
      maxAllowedAmount =
        summary.existingPartialPaymentForCurrentSeason.amountRemainingToPay;
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
    // --- END CONDITIONAL VALIDATION LOGIC ---

    try {
      const newPayment = {
        userId: selectedUser,
        seasonId: selectedSeason,
        amountPaid: parsedAmountPaid,
      };
      await createPayment(newPayment); // This calls processMemberPayment on backend
      toast.success("Payment submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error(error.response?.data?.message || "Error processing payment.");
    }
  };

  if (!show) return null;

  // Adjust payButtonDisabled logic to use the correct max allowed amount
  const payButtonDisabled =
    loading ||
    initialLoading ||
    !summary ||
    isNaN(parseFloat(amountPaid)) ||
    parseFloat(amountPaid) <= 0 ||
    parseFloat(amountPaid) >
      (summary?.existingPartialPaymentForCurrentSeason?.amountRemainingToPay ||
        summary?.amountDue ||
        0);

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
                <div className="mb-3">
                  <label htmlFor="seasonSelect" className="form-label">
                    Select Season
                  </label>
                  <select
                    id="seasonSelect"
                    className="form-select"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Select Season --</option>
                    {seasons.map((season) => (
                      <option key={season._id} value={season._id}>
                        {season.name} {season.year}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {summary && !loading && !initialLoading && (
              <>
                {/* --- CONDITIONAL RENDERING OF SUMMARY DETAILS --- */}
                {summary.existingPartialPaymentForCurrentSeason ? (
                  // Simplified View for Subsequent Payments
                  <div className="alert alert-info mt-4">
                    <h5 className="mb-2">Continuing Payment for this Season</h5>
                    <p className="fw-bold fs-4 text-center">
                      Remaining Amount to Pay for this Season:
                      <span className="badge bg-danger ms-2">
                        $
                        {summary.existingPartialPaymentForCurrentSeason.amountRemainingToPay?.toFixed(
                          2
                        )}
                      </span>
                    </p>
                    <p className="text-muted text-center">
                      This reflects the outstanding balance from a previous
                      payment for this season.
                    </p>
                  </div>
                ) : (
                  // Detailed View for First Payment of the Season
                  <>
                    <h6 className="mt-4 border-bottom pb-2">Summary Totals</h6>
                    <ul className="list-group mb-3">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        Total Production Value (Current Season):
                        <span className="badge bg-primary rounded-pill">
                          ${summary.totalProduction?.toFixed(2)}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        Total Unpaid Fees (Current Season):
                        <span className="badge bg-danger rounded-pill">
                          ${summary.totalUnpaidFees?.toFixed(2)}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        Total Unpaid Loans (Current Season):
                        <span className="badge bg-warning text-dark rounded-pill">
                          ${summary.totalLoans?.toFixed(2)}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center fw-bold fs-5">
                        Net Balance for Current Season:
                        <span className="badge bg-info rounded-pill">
                          ${summary.currentSeasonNet?.toFixed(2)}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        Previous Payments with Remaining Balance (Cooperative
                        Owes Member):
                        <span className="badge bg-success rounded-pill">
                          ${summary.previousRemaining?.toFixed(2)}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center fw-bold fs-5">
                        Total Amount Due (Net Payable by Cooperative):
                        <span className="badge bg-success rounded-pill">
                          ${summary.amountDue?.toFixed(2)}
                        </span>
                      </li>
                    </ul>
                    <h6 className="mt-4 border-bottom pb-2">
                      Unpaid Fees Breakdown (Current Season)
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
                              Remaining: $
                              {(fee.amountOwed - (fee.amountPaid || 0)).toFixed(
                                2
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="alert alert-info mt-2">
                        No outstanding fees for this user in this season.
                      </div>
                    )}
                    <h6 className="mt-4 border-bottom pb-2">
                      Outstanding Loans Breakdown (Current Season)
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
                              Amount Owed: ${loan.amountOwed?.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="alert alert-info mt-2">
                        No outstanding loans for this user in this season.
                      </div>
                    )}
                    <h6 className="mt-4 border-bottom pb-2">
                      Previous Payments with Remaining Balance (Cooperative Owes
                      Member)
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
                              Remaining: $
                              {prevPayment.amountRemainingToPay?.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="alert alert-info mt-2">
                        No previous payments with remaining balances for this
                        user.
                      </div>
                    )}
                  </>
                )}
                {/* --- END CONDITIONAL RENDERING --- */}

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
                      summary.existingPartialPaymentForCurrentSeason
                        ? summary.existingPartialPaymentForCurrentSeason.amountRemainingToPay?.toFixed(
                            2
                          )
                        : summary.amountDue?.toFixed(2) || "0.00"
                    })`}
                  />
                  <div className="form-text">
                    Current Input: $
                    {amountPaid ? parseFloat(amountPaid).toFixed(2) : "0.00"}
                  </div>
                </div>
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
