import React, { useState } from "react";

const DeleteButton = ({
  onConfirm,
  children = "Delete",
  className = "",
  confirmMessage = "Are you sure you want to permanently delete this item? This action cannot be undone.",
  confirmTitle = "Confirm Deletion",
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
      setError("Failed to delete. Please try again.");
      console.error("Delete error:", err);
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
        className={`btn btn-danger ${className}`}
        onClick={handleClick}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span className="ms-2">Deleting...</span>
          </>
        ) : (
          <>
            <i className="bi bi-trash me-1"></i>
            {children}
          </>
        )}
      </button>

      {/* React controlled Modal */}
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
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
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
                        <span className="ms-2">Deleting...</span>
                      </>
                    ) : (
                      "Delete"
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

export default DeleteButton;
