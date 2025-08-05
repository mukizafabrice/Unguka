import React, { useEffect, useState } from "react";
import { ArrowLeft, Camera, Key, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
// No need to import toast or changePassword here
import PasswordModal from "../features/modals/PasswordModal";
import ProfileImageModal from "../features/modals/ProfileImageModal";

function Profile() {
  const [user, setUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    try {
      const userData = JSON.parse(userDataString);
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setUser(null);
    }
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <p className="text-muted fs-5 animate-pulse">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100 bg-light p-3">
      <div
        className="w-100 d-flex justify-content-start mb-3"
        style={{ maxWidth: "300px" }}
      >
        <button
          onClick={handleGoBack}
          className="btn btn-link text-decoration-none text-primary d-flex align-items-center"
        >
          <ArrowLeft className="me-2" size={20} />
          <span className="fw-semibold">Back</span>
        </button>
      </div>
      <div
        className="card shadow-lg rounded-3 p-4 text-center d-flex flex-column align-items-center"
        style={{ maxWidth: "300px" }}
      >
        <div className="position-relative mb-3">
          <img
            src={
              user.profilePicture ||
              "https://placehold.co/80x80/A7F3D0/10B981?text=U"
            }
            alt="Profile"
            className="rounded-circle border border-primary shadow-sm"
            style={{ width: "80px", height: "80px", borderWidth: "3px" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/80x80/A7F3D0/10B981?text=U";
            }}
          />
          <button
            onClick={() => setShowProfileImageModal(true)}
            className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 d-flex justify-content-center align-items-center"
            style={{ width: "30px", height: "30px", padding: "0" }}
            aria-label="Change profile image"
          >
            <Camera size={16} />
          </button>
        </div>
        <h5 className="fw-bold text-dark mb-2">
          {user.names || "No Name Provided"}
        </h5>
        <p className="text-muted mb-3 d-flex align-items-center justify-content-center">
          <Phone size={18} className="me-2 text-secondary" />
          {user.phoneNumber || "N/A"}
        </p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="btn btn-dark w-100 mt-3 d-flex align-items-center justify-content-center"
        >
          <Key size={18} className="me-2" />
          Change Password
        </button>
      </div>
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
      {showProfileImageModal && (
        <ProfileImageModal onClose={() => setShowProfileImageModal(false)} />
      )}
    </div>
  );
}

export default Profile;
