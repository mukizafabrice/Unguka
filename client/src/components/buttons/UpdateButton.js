import React, { useState } from "react";

const UpdateButton = ({
  onConfirm,
  children = "Update",
  className = "",
  confirmMessage = "Are you sure you want to update this item?",
  confirmTitle = "Confirm Update",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setError(null);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      setShowModal(false);
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        className={`btn btn-warning ${className}`}
        onClick={handleClick}
        disabled={isLoading}
        {...props}
      >
        <i className="bi bi-pencil-square me-2"></i>
        {children}
      </button>

      {/* React-controlled Modal (No Bootstrap JS) */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{confirmTitle}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCancel}
                  ></button>
                </div>
                <div className="modal-body text-start">
                  <p>{confirmMessage}</p>
                  {error && <div className="alert alert-danger">{error}</div>}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span className="ms-2 visually-hidden">
                          Updating...
                        </span>
                      </>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default UpdateButton;
