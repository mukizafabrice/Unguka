import React, { useState, useEffect } from "react";

import { fetchPayments } from "../../services/paymentService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import { PlusCircle } from "lucide-react";
function Payment() {
  // Fetch season
  const [payments, setPayments] = useState([]);
  useEffect(() => {
    const loadPayment = async () => {
      try {
        const paymentsData = await fetchPayments();
        setPayments(paymentsData.data);
        console.log(paymentsData);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadPayment();
  }, []);

  const handleUpdateReason = () => {
    alert("click to update");
  };
  const handleDeleteSale = () => {
    alert("hello world");
  };
  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Payment Dashboard
          </h4>
          {/* New: Add Sale Button */}
          <button
            className="btn btn-success d-flex align-items-center"
            // onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={20} className="me-1" /> Add Stock
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
                <th>ProductName</th>
                <th>Season</th>
                <th>Amount</th>
                <th>Date</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td>{index + 1}</td>
                    <td>{payment.productionId?.userId?.names}</td>
                    <td>{payment.productionId?.productId?.productName}</td>
                    <td>{payment.productionId?.seasonId?.name}</td>
                    <td>{payment.amount}RwF</td>
                    <td>
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateReason(payment)}
                          confirmMessage={`Are you sure you want to update payment for "${
                            payment.productionId?.userId?.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(payment._id)}
                          confirmMessage={`Are you sure you want to delete payment  "${
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
                  <td colSpan="9" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No payment found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payment;
