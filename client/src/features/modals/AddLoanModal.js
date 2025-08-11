import React, { useState, useEffect } from "react";
import { fetchUsers } from "../../services/userService";

function AddLoanModal({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    userId: "",
    amountOwed: "",
    interest: "",
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fetchUsers();
        setUsers(userData);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      {show && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title">Add New Loan</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                ></button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* User dropdown */}
                  <div className="mb-3">
                    <label className="form-label">Member</label>
                    <select
                      className="form-select"
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Member --</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.names}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Owed */}
                  <div className="mb-3">
                    <label className="form-label">Amount Owed</label>
                    <input
                      type="number"
                      className="form-control"
                      name="amountOwed"
                      value={formData.amountOwed}
                      onChange={handleChange}
                      placeholder="Enter amount owed"
                      required
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="mb-3">
                    <label className="form-label">Interest Rate (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      placeholder="Enter interest rate"
                      required
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Loan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddLoanModal;
