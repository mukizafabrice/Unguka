import React, { useEffect, useState } from "react";
import { ArrowLeft, Camera, Key, Phone } from "lucide-react"; // Icons are still used as they are React components
import { useNavigate } from "react-router-dom";

// Import the two distinct modal components (will also need Bootstrap styling)
import PasswordModal from "../features/modals/PasswordModal";
import ProfileImageModal from "../features/modals/ProfileImageModal";

// Main Profile Component
function App() {
  const [user, setUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Profile component mounted.");
    const userDataString = localStorage.getItem("user");
    console.log("Raw user data from localStorage:", userDataString);

    try {
      const userData = JSON.parse(userDataString);
      setUser(userData);
      console.log("Parsed user data:", userData);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setUser(null);
    }
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!user) {
    console.log("User is null, displaying loading message.");
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <p className="text-muted fs-5 animate-pulse">Loading user data...</p>
      </div>
    );
  }

  console.log("User data available, rendering profile.");

  return (
    <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100 bg-light p-3">
      {/* Back button - remains outside the card for navigation */}
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

      {/* Main User Profile Card - Now much more compact */}
      <div
        className="card shadow-lg rounded-3 p-4 text-center d-flex flex-column align-items-center"
        style={{ maxWidth: "300px" }}
      >
        {/* Profile picture with camera icon */}
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

        {/* User's Name */}
        <h5 className="fw-bold text-dark mb-2">
          {user.names || "No Name Provided"}
        </h5>

        {/* User's Phone Number */}
        <p className="text-muted mb-3 d-flex align-items-center justify-content-center">
          <Phone size={18} className="me-2 text-secondary" />
          {user.phoneNumber || "N/A"}
        </p>

        {/* Change Password Button - Prominently featured */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="btn btn-dark w-100 mt-3 d-flex align-items-center justify-content-center"
        >
          <Key size={18} className="me-2" />
          Change Password
        </button>

        {/* Optional: Add a small "View Full Profile" or "Edit Details" button if needed */}
        {/* <button className="mt-3 btn btn-link text-primary btn-sm">
          View All Details
        </button> */}
      </div>

      {/* Conditional rendering for modals remain unchanged */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
      {showProfileImageModal && (
        <ProfileImageModal onClose={() => setShowProfileImageModal(false)} />
      )}
    </div>
  );
}

export default App;
