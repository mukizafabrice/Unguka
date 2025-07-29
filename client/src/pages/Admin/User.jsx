import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchUsers } from "../../services/userService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
import { createUser, deleteUser } from "../../services/userService";
import AddUserModal from "../../features/modals/AddUserModal";
import UpdateUserModal from "../../features/modals/UpdateUserModal";

function User() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const openUpdateModal = (user) => {
    setUserToEdit(user);
    setShowUpdateModal(true);
  };
  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
    setShowUpdateModal(false);
  };

  const handleAddUser = async (newUserData) => {
    try {
      const response = await createUser(newUserData);
      setMessage({ type: "success", text: "User added successfully!" });
      setUsers((prev) => [...prev, response]);
      setShowAddModal(false);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to add user. Please try again.",
      });
    }
  };

  // Fetch season
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const loadStock = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadStock();
  }, []);

  const handleUpdateReason = () => {
    alert("click to update");
  };

  //delete user
  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
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
              {users.length > 0 ? (
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
                      No stock found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add User Modal */}
      <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />
      {/* Update User Modal */}
      <UpdateUserModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUserUpdated}
        userData={userToEdit}
      />
    </div>
  );
}

export default User;
