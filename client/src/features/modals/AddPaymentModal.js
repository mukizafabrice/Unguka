import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchPaymentSummary } from "../../services/paymentService";
import { fetchProductions } from "../../services/productionService";
import { fetchFeeTypes } from "../../services/feeTypeService";

const AddPaymentModal = ({
  show,
  onClose,
  users,
  seasons,
  onCreatePayment,
  loading,
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [productions, setProductions] = useState([]);
  const [selectedProduction, setSelectedProduction] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [summary, setSummary] = useState(null);

  const [feesDetails, setFeesDetails] = useState([]);
  const [loansDetails, setLoansDetails] = useState([]);
  const [previousPaymentsDetails, setPreviousPaymentsDetails] = useState([]);

  const [feeTypes, setFeeTypes] = useState([]); // Effect to reset all states when the modal is closed

  useEffect(() => {
    if (!show) {
      setSelectedUser("");
      setSelectedSeason("");
      setProductions([]);
      setSelectedProduction("");
      setAmountPaid("");
      setSummary(null);
      setFeesDetails([]);
      setLoansDetails([]);
      setPreviousPaymentsDetails([]);
    }
  }, [show]); // Effect to load fee types once

  useEffect(() => {
    const loadFeeTypesData = async () => {
      try {
        const data = await fetchFeeTypes();
        setFeeTypes(data);
        console.log("Fee types loaded:", data);
      } catch (error) {
        console.error("Failed to fetch fee types:", error);
        toast.error("Failed to load fee types.");
      }
    };
    loadFeeTypesData();
  }, []); // Helper function to get fee type name

  const getFeeTypeName = (feeTypeId) => {
    const type = feeTypes.find((ft) => ft._id === feeTypeId);
    if (!type) {
      console.warn(`Fee type not found for ID: ${feeTypeId}`);
    }
    return type ? type.name : "Unknown Fee Type";
  }; // Effect to load productions based on selected user and season

  useEffect(() => {
    const loadProductions = async () => {
      if (selectedUser && selectedSeason) {
        try {
          const data = await fetchProductions(selectedUser, selectedSeason);
          setProductions(data);
          if (data.length > 0) {
            setSelectedProduction(data[0]._id);
          } else {
            setSelectedProduction("");
          }
        } catch (error) {
          toast.error("Failed to load productions.");
          console.error("Error loading productions:", error);
          setProductions([]);
          setSelectedProduction("");
        }
      } else {
        setProductions([]);
        setSelectedProduction("");
      }
    };
    loadProductions();
  }, [selectedUser, selectedSeason]); // Effect to load payment summary automatically

  useEffect(() => {
    const autoLoadSummary = async () => {
      if (selectedUser && selectedSeason && feeTypes.length > 0) {
        try {
          const data = await fetchPaymentSummary(selectedUser, selectedSeason);
          console.log("Fetched payment summary data:", data);

          setSummary({
            productionTotal: data.totalProduction,
            feesDue: data.totalUnpaidFees,
            loansDue: data.totalLoans,
            previousRemaining: data.previousRemaining,
            amountDue: data.netPayable,
            grossAmount:
              productions.find((p) => p._id === selectedProduction)
                ?.totalPrice || data.totalProduction,
          });

          setFeesDetails(
            data.fees.map((fee) => ({
              ...fee,
              feeTypeName: getFeeTypeName(fee.feeTypeId),
              remainingAmount: fee.amountOwed - fee.amountPaid,
            }))
          );
          setLoansDetails(data.loans);
          setPreviousPaymentsDetails(data.payments);

          if (data.netPayable > 0) {
            setAmountPaid(data.netPayable.toFixed(2));
          } else {
            setAmountPaid("0.00");
          }

          toast.success("Summary loaded automatically!");
        } catch (error) {
          toast.error(
            "Failed to load summary automatically. Please check console."
          );
          console.error("Error auto-loading payment summary:", error);
          setSummary(null);
          setFeesDetails([]);
          setLoansDetails([]);
          setPreviousPaymentsDetails([]);
          setAmountPaid("");
        }
      } else {
        setSummary(null);
        setFeesDetails([]);
        setLoansDetails([]);
        setPreviousPaymentsDetails([]);
        setAmountPaid("");
      }
    };

    autoLoadSummary();
  }, [selectedUser, selectedSeason, selectedProduction, productions, feeTypes]); // Handler for submitting the payment

  const handleSubmit = async () => {
    if (!summary) {
      toast.warning("Payment summary is not available.");
      return;
    }
    if (!selectedProduction) {
      toast.warning("Please select a production to process payment against.");
      return;
    }
    const parsedAmountPaid = parseFloat(amountPaid);
    if (isNaN(parsedAmountPaid) || parsedAmountPaid <= 0) {
      toast.warning("Please enter a valid amount to pay.");
      return;
    }
    if (parsedAmountPaid > summary.amountDue) {
      toast.warning(
        `Amount paid ($${parsedAmountPaid.toFixed(
          2
        )}) cannot exceed total amount due ($${summary.amountDue.toFixed(2)}).`
      );
      return;
    }

    const newPayment = {
      productionId: selectedProduction,
      amountPaid: parsedAmountPaid,
    };

    await onCreatePayment(newPayment);
  };

  if (!show) return null;
  console.log("Pay button disabled because:", {
    loading,
    summaryLoaded: !!summary,
    productionSelected: !!selectedProduction,
    validAmount: !isNaN(parseFloat(amountPaid)) && parseFloat(amountPaid) > 0,
    amountValidVsDue: parseFloat(amountPaid) <= (summary?.amountDue || 0),
  });

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
           {" "}
      <div className="modal-dialog modal-lg" role="document">
               {" "}
        <div className="modal-content">
                   {" "}
          <div className="modal-header">
                        <h5 className="modal-title">Add Payment</h5>           {" "}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
                     {" "}
          </div>
                   {" "}
          <div className="modal-body">
                        {/* User Selection */}           {" "}
            <div className="mb-3">
                           {" "}
              <label htmlFor="userSelect" className="form-label">
                                Select User              {" "}
              </label>
                           {" "}
              <select
                id="userSelect"
                className="form-select"
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                }}
              >
                                <option value="">-- Select User --</option>     
                         {" "}
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                                        {user.names}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                         {" "}
            </div>
                        {/* Season Selection */}           {" "}
            <div className="mb-3">
                           {" "}
              <label htmlFor="seasonSelect" className="form-label">
                                Select Season              {" "}
              </label>
                           {" "}
              <select
                id="seasonSelect"
                className="form-select"
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(e.target.value);
                }}
              >
                                <option value="">-- Select Season --</option>   
                           {" "}
                {seasons.map((season) => (
                  <option key={season._id} value={season._id}>
                                        {season.name} {season.year}             
                       {" "}
                  </option>
                ))}
                             {" "}
              </select>
                         {" "}
            </div>
                        {/* Production Selection */}           {" "}
            <div className="mb-3">
                           {" "}
              <label htmlFor="productionSelect" className="form-label">
                                Select Production to Pay Against              {" "}
              </label>
                           {" "}
              <select
                id="productionSelect"
                className="form-select"
                value={selectedProduction}
                onChange={(e) => setSelectedProduction(e.target.value)}
                disabled={
                  !productions.length || !selectedUser || !selectedSeason
                }
              >
                               {" "}
                <option value="">-- Select Production --</option>               {" "}
                {productions.map((prod) => (
                  <option key={prod._id} value={prod._id}>
                                       {" "}
                    {prod.productId?.productName ||
                      `Production ID: ${prod._id.substring(0, 6)}`}{" "}
                                        - Qty: {prod.quantity} - Price: $      
                                  {prod.totalPrice?.toFixed(2)}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                           {" "}
              {!productions.length && selectedUser && selectedSeason && (
                <div className="form-text text-danger">
                                    No productions found for this user and
                  season.                {" "}
                </div>
              )}
                         {" "}
            </div>
                       {" "}
            {/* Summary Details Display - Only show if summary is loaded */}   
                   {" "}
            {summary && (
              <>
                               {" "}
                <h6 className="mt-4 border-bottom pb-2">Summary Totals</h6>     
                         {" "}
                <ul className="list-group mb-3">
                                   {" "}
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Total Production Value:                
                       {" "}
                    <span className="badge bg-primary rounded-pill">
                                            $
                      {summary.productionTotal?.toFixed(2)}                   {" "}
                    </span>
                                     {" "}
                  </li>
                                   {" "}
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Total Unpaid Fees:                    {" "}
                    <span className="badge bg-danger rounded-pill">
                                            ${summary.feesDue?.toFixed(2)}     
                                   {" "}
                    </span>
                                     {" "}
                  </li>
                                   {" "}
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Total Unpaid Loans:                    {" "}
                    <span className="badge bg-warning text-dark rounded-pill">
                                            ${summary.loansDue?.toFixed(2)}     
                                   {" "}
                    </span>
                                     {" "}
                  </li>
                                   {" "}
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Previous Payments with Remaining
                    Balance:                    {" "}
                    <span className="badge bg-info text-dark rounded-pill">
                                            $
                      {summary.previousRemaining?.toFixed(2)}                   {" "}
                    </span>
                                     {" "}
                  </li>
                                   {" "}
                  <li className="list-group-item d-flex justify-content-between align-items-center fw-bold fs-5">
                                        Total Amount Due (Net Payable):        
                               {" "}
                    <span className="badge bg-success rounded-pill">
                                            ${summary.amountDue?.toFixed(2)}   
                                     {" "}
                    </span>
                                     {" "}
                  </li>
                                 {" "}
                </ul>
                                {/* Detailed Fees List */}               {" "}
                <h6 className="mt-4 border-bottom pb-2">
                                    Unpaid Fees Breakdown                {" "}
                </h6>
                               {" "}
                {feesDetails.length > 0 ? (
                  <ul className="list-group mb-3">
                                       {" "}
                    {feesDetails.map((fee) => (
                      <li
                        key={fee._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                                                Fee Type: {fee.feeTypeName} -
                        Owed: $                        {" "}
                        {fee.amountOwed?.toFixed(2)} | Paid: $                  
                              {fee.amountPaid?.toFixed(2)}                     
                         {" "}
                        <span className="badge bg-danger rounded-pill">
                                                    Remaining: $                
                                   {" "}
                          {(fee.amountOwed - fee.amountPaid).toFixed(2)}       
                                         {" "}
                        </span>
                                             {" "}
                      </li>
                    ))}
                                     {" "}
                  </ul>
                ) : (
                  <div className="alert alert-info mt-2">
                                        No outstanding fees for this user in
                    this season.                  {" "}
                  </div>
                )}
                                {/* Detailed Loans List */}               {" "}
                <h6 className="mt-4 border-bottom pb-2">
                                    Outstanding Loans Breakdown                {" "}
                </h6>
                               {" "}
                {loansDetails.length > 0 ? (
                  <ul className="list-group mb-3">
                                       {" "}
                    {loansDetails.map((loan) => (
                      <li
                        key={loan._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                                                Loan for{" "}
                        {loan.type || "General Loan"} on                        {" "}
                        {new Date(loan.createdAt).toLocaleDateString()}         
                                     {" "}
                        <span className="badge bg-warning text-dark rounded-pill">
                                                    Amount Owed: $
                          {loan.amountOwed?.toFixed(2)}                       {" "}
                        </span>
                                             {" "}
                      </li>
                    ))}
                                     {" "}
                  </ul>
                ) : (
                  <div className="alert alert-info mt-2">
                                        No outstanding loans for this user in
                    this season.                  {" "}
                  </div>
                )}
                               {" "}
                {/* Detailed Previous Payments with Remaining Balance List */} 
                             {" "}
                <h6 className="mt-4 border-bottom pb-2">
                                    Previous Payments with Remaining Balance    
                             {" "}
                </h6>
                               {" "}
                {previousPaymentsDetails.length > 0 ? (
                  <ul className="list-group mb-3">
                                       {" "}
                    {previousPaymentsDetails.map((prevPayment) => (
                      <li
                        key={prevPayment._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                                                Payment on                      
                          {new Date(prevPayment.createdAt).toLocaleDateString()}
                                               {" "}
                        <span className="badge bg-info text-dark rounded-pill">
                                                    Remaining: $                
                                   {" "}
                          {prevPayment.amountRemainingToPay?.toFixed(2)}       
                                         {" "}
                        </span>
                                             {" "}
                      </li>
                    ))}
                                     {" "}
                  </ul>
                ) : (
                  <div className="alert alert-info mt-2">
                                        No previous payments with remaining
                    balances for this user                     in this season.  
                                   {" "}
                  </div>
                )}
                                {/* Amount to Pay Input */}               {" "}
                <div className="mb-3 mt-4">
                                   {" "}
                  <label
                    htmlFor="amountPaidInput"
                    className="form-label fw-bold"
                  >
                                        Amount to Pay                  {" "}
                  </label>
                                   {" "}
                  <input
                    id="amountPaidInput"
                    type="number"
                    className="form-control form-control-lg"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={`Enter amount (Max: ${
                      summary.amountDue?.toFixed(2) || "0.00"
                    })`}
                  />
                                   {" "}
                  <div className="form-text">
                                        Current Input: $                    {" "}
                    {amountPaid ? parseFloat(amountPaid).toFixed(2) : "0.00"}   
                                 {" "}
                  </div>
                </div>
                             {" "}
              </>
            )}
                     {" "}
          </div>
                   {" "}
          <div className="modal-footer">
                       {" "}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
                            Close            {" "}
            </button>
                       {" "}
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={
                loading ||
                !summary || // Summary must be loaded
                !selectedProduction || // Production must be selected
                isNaN(parseFloat(amountPaid)) ||
                parseFloat(amountPaid) <= 0 ||
                parseFloat(amountPaid) > summary.amountDue
              }
            >
                            Pay            {" "}
            </button>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default AddPaymentModal;
