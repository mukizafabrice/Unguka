import React, { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    console.log(userData);
  }, []);

  if (!user) return <div className="container mt-5">Loading user data...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">User Profile</h2>
      <div className="card p-4">
        <div className="d-flex align-items-center mb-3">
          <img
            src={user.profilePicture || "https://placehold.co/80x80"}
            alt="Profile"
            className="rounded-circle me-3"
            style={{ width: "80px", height: "80px" }}
          />
          <div>
            <h5 className="mb-0">{user.names || "No Name Provided"}</h5>
            <p className="text-muted mb-0">
              {user.email || "No Email Provided"}
            </p>
          </div>
        </div>

        <hr />

        <p>
          <strong>Role:</strong> {user.role || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone || "N/A"}
        </p>
        <p>
          <strong>Joined:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString() || "N/A"}
        </p>

        <div className="mt-4">
          <button className="btn btn-primary me-2">Edit Profile</button>
          <button className="btn btn-secondary">Change Password</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
