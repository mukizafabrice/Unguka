// src/pages/User.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUsers, createUser, deleteUser } from "../../services/userService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
import AddUserModal from "../../features/modals/AddUserModal";
import UpdateUserModal from "../../features/modals/UpdateUserModal";

function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Function to load all users from the API
  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (newUserData) => {
    try {
      await createUser(newUserData);
      toast.success("User added successfully!");
      setShowAddModal(false);
      loadUsers(); // Reload users to show the new user
    } catch (error) {
      console.error("Failed to add user:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add user. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleUserUpdated = () => {
    toast.success("User updated successfully!");
    setShowUpdateModal(false);
    loadUsers(); // Reload users to show the updated data
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      toast.success("User deleted successfully!");
      loadUsers(); // Reload users to remove the deleted user from the list
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  const openUpdateModal = (user) => {
    setUserToEdit(user);
    setShowUpdateModal(true);
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
              Member Dashboard
            </h4>
            <p style={{ color: "#333", marginTop: "8px", fontSize: "1rem" }}>
              This dashboard displays the list of cooperative members along with
              their key details and membership status.
            </p>
          </div>
          <AddButton label="Add User" onClick={() => setShowAddModal(true)} />
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Telephone</th>
                <th>National Id</th>
                <th>Role</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.names}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.nationalId}</td>
                    <td>{user.role}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => openUpdateModal(user)}
                          confirmMessage={`Are you sure you want to update member "${
                            user.names || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteUser(user._id)}
                          confirmMessage={`Are you sure you want to delete member "${
                            user.names || "N/A"
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
                      No users found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />

      <UpdateUserModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUserUpdated}
        userData={userToEdit}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default User;
