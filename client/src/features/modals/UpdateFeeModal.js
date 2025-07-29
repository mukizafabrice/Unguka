import React, { useState, useEffect } from "react";
import { fetchUsers } from "../../services/userService"; // Assuming this service exists
import { fetchSeasons } from "../../services/seasonService"; // Assuming this service exists

const UpdateFeeModal = ({ show, onClose, onSubmit, fee }) => {
  // Renamed prop from 'initialData' to 'fee' for clarity
  const [formData, setFormData] = useState({
    _id: "", // To store the fee ID for the update request
    userId: "",
    seasonId: "",
    amount: "",
    status: "",
  });

  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [seasonsError, setSeasonsError] = useState(null);

  // Effect to manage body class for scroll prevention
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Fetch users and seasons for dropdowns and populate form with initial fee data
  useEffect(() => {
    if (show) {
      const loadDropdownData = async () => {
        setLoadingUsers(true);
        setLoadingSeasons(true);
        setUsersError(null);
        setSeasonsError(null);

        try {
          const [usersResponse, seasonsResponse] = await Promise.all([
            fetchUsers(),
            fetchSeasons(),
          ]);

          if (
            usersResponse &&
            Array.isArray(usersResponse.data || usersResponse)
          ) {
            setUsers(usersResponse.data || usersResponse);
          } else {
            console.warn("User data is not an array:", usersResponse);
            setUsers([]);
            setUsersError("User data format incorrect or empty.");
          }

          if (
            seasonsResponse &&
            Array.isArray(seasonsResponse.data || seasonsResponse)
          ) {
            setSeasons(seasonsResponse.data || seasonsResponse);
          } else {
            console.warn("Season data is not an array:", seasonsResponse);
            setSeasons([]);
            setSeasonsError("Season data format incorrect or empty.");
          }
        } catch (error) {
          console.error(
            "Failed to load dropdown data for update modal:",
            error
          );
          setUsersError("Failed to load members/seasons. Check connection.");
          setSeasonsError("Failed to load members/seasons. Check connection.");
          setUsers([]);
          setSeasons([]);
        } finally {
          setLoadingUsers(false);
          setLoadingSeasons(false);
        }
      };

      loadDropdownData();

      // Populate form data with the current 'fee' prop
      if (fee) {
        setFormData({
          _id: fee._id || "",
          userId: fee.userId?._id || "", // Access nested ID
          seasonId: fee.seasonId?._id || "", // Access nested ID
          amount: fee.amount || "",
          status: fee.status || "unpaid",
        });
      }
    }
  }, [show, fee]); // Re-run when modal visibility or selected 'fee' changes

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      amount: Number(formData.amount), // Ensure amount is a number
    };
    onSubmit(dataToSubmit._id, dataToSubmit); // Pass ID and updated data to parent
  };

  return (
    <>
      {/* Modal Backdrop: Render first for correct z-index stacking */}
      <div className="modal-backdrop fade show"></div>

      {/* Main Modal Content */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="updateFeeModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title text-dark" id="updateFeeModalLabel">
                  Update Fee
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body row">
                {/* General Fetch Errors */}
                {(usersError || seasonsError) && (
                  <div className="col-12 mb-3">
                    <div className="alert alert-danger" role="alert">
                      {usersError && <p className="mb-1">{usersError}</p>}
                      {seasonsError && <p className="mb-0">{seasonsError}</p>}
                    </div>
                  </div>
                )}

                {/* User Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="userId" className="form-label text-dark">
                    Member
                  </label>
                  {loadingUsers ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading members...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading members...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="userId"
                        id="userId"
                        className="form-select"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                        disabled={usersError || users.length === 0}
                      >
                        <option value="">Select a member</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.names}
                          </option>
                        ))}
                      </select>
                      {users.length === 0 && !usersError && (
                        <small className="text-muted mt-1 d-block">
                          No members available.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Season Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="seasonId" className="form-label text-dark">
                    Season
                  </label>
                  {loadingSeasons ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading seasons...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading seasons...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="seasonId"
                        id="seasonId"
                        className="form-select"
                        value={formData.seasonId}
                        onChange={handleChange}
                        required
                        disabled={seasonsError || seasons.length === 0}
                      >
                        <option value="">Select a season</option>
                        {seasons.map((season) => (
                          <option key={season._id} value={season._id}>
                            {season.name}
                          </option>
                        ))}
                      </select>
                      {seasons.length === 0 && !seasonsError && (
                        <small className="text-muted mt-1 d-block">
                          No seasons available.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Amount */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="amount" className="form-label text-dark">
                    Amount (RWF)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="form-control"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                {/* Status */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="status" className="form-label text-dark">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateFeeModal;
