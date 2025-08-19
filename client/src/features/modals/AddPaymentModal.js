import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  fetchPaymentSummary,
  createPayment,
} from "../../services/paymentService";
import { fetchFeeTypes } from "../../services/feeTypeService";
import { fetchUsers } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";

const AddPaymentModal = ({ show, onClose, onSave }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState({ fees: [], loans: [], payments: [] });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feeTypes, setFeeTypes] = useState([]);

  const { user } = useAuth(); // Get user from AuthContext
  const cooperativeId = user?.cooperativeId;
  const loggedInUserId = user?._id; // Get logged-in user's actual ID
  const loggedInUserRole = user?.role; // Get logged-in user's role

  // Reset modal when closed
  useEffect(() => {
    if (!show) {
      setSelectedUser("");
      setAmountPaid("");
      setSummary(null);
      setDetails({ fees: [], loans: [], payments: [] });
    }
  }, [show]);

  // --- NEW LOGIC: Set selectedUser immediately for members ---
  useEffect(() => {
    if (show && loggedInUserRole === "member" && loggedInUserId) {
      // For a member, automatically select their own ID and disable the dropdown
      setSelectedUser(loggedInUserId);
      console.log(
        `[AddPaymentModal] DEBUG: Auto-selected logged-in member: ${loggedInUserId}`
      );
    } else if (show && loggedInUserRole !== "member" && !selectedUser) {
      // For managers/superadmins, if no user is selected yet, clear summary/details
      setSummary(null);
      setDetails({ fees: [], loans: [], payments: [] });
    }
  }, [show, loggedInUserRole, loggedInUserId, selectedUser]); // Depend on show, role, ID, and selectedUser

  // Load initial data (users and fee types)
  useEffect(() => {
    if (!show || !user) {
      setInitialLoading(false);
      return;
    }

    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        let usersData = await fetchUsers();
        usersData = Array.isArray(usersData)
          ? usersData
          : usersData?.data || [];
        console.log(
          `[AddPaymentModal] DEBUG: loadInitialData - Raw usersData from fetchUsers:`,
          usersData.map((u) => u._id)
        );

        // --- UPDATED LOGIC: No longer set selectedUser here for members ---
        // This is now handled by the new useEffect above.
        if (loggedInUserRole === "member") {
          // If a member, only show themselves in the dropdown
          const selfUser = usersData.find((u) => u._id === loggedInUserId);
          setUsers(selfUser ? [selfUser] : []);
          if (!selfUser) {
            // If self user not found in fetched data (unexpected), log warning
            console.warn(
              `[AddPaymentModal] WARNING: Member user (${loggedInUserId}) not found in fetched users data!`
            );
          }
        } else {
          // For managers and superadmins, show all fetched users (within their coop via backend scoping)
          setUsers(usersData);
          console.log(
            `[AddPaymentModal] DEBUG: loadInitialData - Role ${loggedInUserRole}. Setting all fetched users. First user _id: ${usersData[0]?._id}`
          );
        }
        // --- END UPDATED LOGIC ---

        const feeTypesData = await fetchFeeTypes();
        setFeeTypes(
          Array.isArray(feeTypesData) ? feeTypesData : feeTypesData?.data || []
        );
        console.log(
          `[AddPaymentModal] Initial data loaded for role ${loggedInUserRole}.`
        );
      } catch (error) {
        console.error("[AddPaymentModal] Failed to load initial data:", error);
        toast.error("Failed to load users or fee types.");
        setUsers([]);
        setFeeTypes([]);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [show, user, loggedInUserRole, loggedInUserId]); // Depend on user, role, and ID

  const getFeeTypeName = useCallback(
    (feeTypeId) =>
      feeTypes.find((ft) => ft._id === feeTypeId)?.name || "Unknown Fee Type",
    [feeTypes]
  );

  // Load payment summary when user changes
  useEffect(() => {
    // Only load summary if a user is selected AND cooperativeId is available
    if (!selectedUser || !cooperativeId) {
      setSummary(null);
      setLoading(false);
      return;
    }

    const loadSummary = async () => {
      setLoading(true);
      try {
        console.log(
          `[AddPaymentModal] DEBUG: loadSummary triggered. selectedUser: ${selectedUser}, cooperativeId: ${cooperativeId}`
        );
        console.log(
          `[AddPaymentModal] Calling fetchPaymentSummary for userId: ${selectedUser}, cooperativeId: ${cooperativeId}`
        );
        const data = await fetchPaymentSummary(selectedUser, cooperativeId);

        // Defensive checks for data properties
        setSummary({
          totalProduction: data.totalProduction || 0,
          totalUnpaidFees: data.totalUnpaidFees || 0,
          totalLoans: data.totalLoans || 0,
          previousRemaining: data.previousRemaining || 0,
          currentNet: data.currentNet || 0,
          amountDue: data.netPayable || 0,
          existingPartialPayment: data.existingPartialPayment,
        });

        setDetails({
          fees: Array.isArray(data.fees)
            ? data.fees.map((fee) => ({
                ...fee,
                feeTypeName: getFeeTypeName(fee.feeTypeId),
                remainingAmount: fee.amountOwed - (fee.amountPaid || 0),
              }))
            : [],
          loans: Array.isArray(data.loans) ? data.loans : [],
          payments: Array.isArray(data.payments) ? data.payments : [],
        });

        // pre-fill amountPaid
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
        console.error("[AddPaymentModal] Failed to load summary:", error);
        console.error(
          "[AddPaymentModal] Fetch Payment Summary Error Details:",
          error.response?.data || error.message
        );
        toast.error(
          `Failed to load payment details: ${
            error.response?.data?.message || error.message
          }`
        );
        setSummary(null);
        setDetails({ fees: [], loans: [], payments: [] }); // Clear details on error
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [selectedUser, cooperativeId, getFeeTypeName]);

  const handleSubmit = async () => {
    if (!summary) {
      toast.warning("Payment summary is not available.");
      return;
    }

    const parsedAmount = parseFloat(amountPaid);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.warning("Please enter a valid amount to pay.");
      return;
    }

    const maxAmount =
      summary.existingPartialPayment?.amountRemainingToPay ?? summary.amountDue;
    if (parsedAmount > maxAmount) {
      toast.warning(
        `Amount paid (${parsedAmount.toFixed(
          2
        )}) cannot exceed remaining due (${maxAmount.toFixed(2)}).`
      );
      return;
    }

    try {
      console.log(
        `[AddPaymentModal] Calling createPayment for userId: ${selectedUser}, amountPaid: ${parsedAmount}, cooperativeId: ${cooperativeId}`
      );
      await createPayment(
        { userId: selectedUser, amountPaid: parsedAmount },
        cooperativeId
      );
      toast.success("Payment submitted successfully!");
      onClose();
      if (onSave) onSave();
    } catch (error) {
      console.error("[AddPaymentModal] Payment submission error:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An unexpected error occurred.";
      toast.error(`Payment failed: ${message}`);
    }
  };

  if (!show) return null;

  const payButtonDisabled =
    !cooperativeId ||
    loading ||
    initialLoading ||
    !summary ||
    isNaN(parseFloat(amountPaid)) ||
    parseFloat(amountPaid) <= 0 ||
    parseFloat(amountPaid) >
      (summary.existingPartialPayment?.amountRemainingToPay ??
        summary.amountDue ??
        0);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);

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
            <button type="button" className="btn-close" onClick={onClose} />
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
                    disabled={
                      loading || !cooperativeId || loggedInUserRole === "member"
                    } // Disable for members
                  >
                    <option value="">-- Select User --</option>
                    {Array.isArray(users) &&
                      users.map((userOption) => (
                        <option key={userOption._id} value={userOption._id}>
                          {userOption.names}
                        </option>
                      ))}
                  </select>
                </div>

                {summary && !loading && (
                  <>
                    {summary.existingPartialPayment ? (
                      <div className="alert alert-info mt-4 text-center">
                        <h5>Continuing Payment</h5>
                        <p className="fw-bold fs-4">
                          Remaining Amount to Pay:{" "}
                          <span className="badge bg-danger">
                            {formatCurrency(
                              summary.existingPartialPayment
                                ?.amountRemainingToPay
                            )}
                          </span>
                        </p>
                        <p className="text-muted">
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
                          <li className="list-group-item d-flex justify-content-between">
                            Total Production Value:
                            <span className="badge bg-primary rounded-pill">
                              {formatCurrency(summary.totalProduction)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            Total Unpaid Fees:
                            <span className="badge bg-danger rounded-pill">
                              {formatCurrency(summary.totalUnpaidFees)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            Total Unpaid Loans:
                            <span className="badge bg-warning text-dark rounded-pill">
                              {formatCurrency(summary.totalLoans)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between fw-bold fs-5">
                            Net Balance:
                            <span className="badge bg-info rounded-pill">
                              {formatCurrency(summary.currentNet)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            Previous Remaining Payments:
                            <span className="badge bg-success rounded-pill">
                              {formatCurrency(summary.previousRemaining)}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between fw-bold fs-5">
                            Total Amount Due:
                            <span className="badge bg-success rounded-pill">
                              {formatCurrency(summary.amountDue)}
                            </span>
                          </li>
                        </ul>

                        <h6 className="mt-4 border-bottom pb-2">
                          Unpaid Fees Breakdown
                        </h6>
                        {details.fees.length ? (
                          <ul className="list-group mb-3">
                            {Array.isArray(details.fees) &&
                              details.fees.map((fee) => (
                                <li
                                  key={fee._id}
                                  className="list-group-item d-flex justify-content-between"
                                >
                                  {fee.feeTypeName}
                                  <span className="badge bg-danger rounded-pill">
                                    {formatCurrency(fee.remainingAmount)}
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
                        {details.loans.length ? (
                          <ul className="list-group mb-3">
                            {Array.isArray(details.loans) &&
                              details.loans.map((loan) => (
                                <li
                                  key={loan._id}
                                  className="list-group-item d-flex justify-content-between"
                                >
                                  Loan on{" "}
                                  {new Date(
                                    loan.createdAt
                                  ).toLocaleDateString()}
                                  <span className="badge bg-warning text-dark rounded-pill">
                                    {formatCurrency(loan.amountOwed)}
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
                        {details.payments.length ? (
                          <ul className="list-group mb-3">
                            {Array.isArray(details.payments) &&
                              details.payments.map((prev) => (
                                <li
                                  key={prev._id}
                                  className="list-group-item d-flex justify-content-between"
                                >
                                  Payment on{" "}
                                  {new Date(
                                    prev.createdAt
                                  ).toLocaleDateString()}
                                  <span className="badge bg-success rounded-pill">
                                    {formatCurrency(prev.amountRemainingToPay)}
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
                            ?.amountRemainingToPay ?? summary.amountDue
                        })`}
                      />
                      <div className="form-text">
                        Remaining after payment:{" "}
                        {formatCurrency(
                          Math.max(
                            0,
                            (summary.amountDue ?? 0) -
                              parseFloat(amountPaid || 0)
                          )
                        )}
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
