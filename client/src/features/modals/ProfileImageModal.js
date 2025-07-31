import React, { useState } from "react";
import { Camera } from "lucide-react";
import { changeProfileImage } from "../../services/userService";

const ProfileImageModal = ({ onClose, onImageUpdated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select a valid image file (e.g., JPG, PNG).");
        setMessageType("danger");
        setSelectedFile(null);
        setPreviewImage("");
        return;
      }

      setSelectedFile(file);
      setMessage("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.onerror = () => {
        setMessage("Failed to read file for preview.");
        setMessageType("danger");
        setSelectedFile(null);
        setPreviewImage("");
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewImage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!selectedFile) {
      setMessage("Please select an image file.");
      setMessageType("danger");
      return;
    }

    setIsUploading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser || !currentUser.id) {
        setMessage("User not logged in or ID not found.");
        setMessageType("danger");
        setIsUploading(false);
        return;
      }
      const userId = currentUser.id;

      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      const result = await changeProfileImage(userId, formData);

      setMessage(result.message || "Profile image updated successfully!");
      setMessageType("success");

      if (result.user && result.user.profilePicture) {
        const updatedUser = {
          ...currentUser,
          profilePicture: result.user.profilePicture,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (onImageUpdated) {
          onImageUpdated(result.user.profilePicture);
        }
      } else {
        setMessage(
          "Image uploaded, but new URL not received. Refresh to see changes."
        );
        setMessageType("warning");
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "An error occurred during upload."
      );
      setMessageType("danger");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-3 shadow-lg p-3">
          <div className="modal-header border-bottom-0 pb-2 mb-3 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
              <Camera size={24} className="me-2 text-secondary" /> Change
              Profile Image
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={isUploading}
            ></button>
          </div>

          <div className="modal-body pt-0">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label
                  htmlFor="image-upload"
                  className="form-label text-muted mb-1"
                >
                  Select New Profile Image
                </label>
                <input
                  type="file"
                  id="image-upload"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  disabled={isUploading}
                />
                {selectedFile && (
                  <small className="form-text text-muted mt-1">
                    Selected: {selectedFile.name}
                  </small>
                )}
              </div>

              {previewImage && (
                <div className="mb-3 text-center">
                  <img
                    src={previewImage}
                    alt="Selected Preview"
                    className="img-fluid rounded shadow-sm"
                    style={{
                      maxHeight: "150px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}

              {message && (
                <div
                  className={`alert alert-${
                    messageType === "error"
                      ? "danger"
                      : messageType === "warning"
                      ? "warning"
                      : "success"
                  } py-2`}
                  role="alert"
                >
                  {message}
                </div>
              )}

              <div className="d-flex justify-content-end pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary me-2"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Uploading...
                    </>
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageModal;
