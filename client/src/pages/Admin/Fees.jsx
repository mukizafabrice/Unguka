import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchAllFees,
  recordPayment,
  updateFee,
  deleteFee,
} from "../../services/feesService";
import { fetchUsers } from "../../services/userService";
import { fetchSeasons } from "../../services/seasonService";
import { fetchFeeTypes } from "../../services/feeTypeService";

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
import AddFeeModal from "../../features/modals/AddFeeModal";
import UpdateFeeModal from "../../features/modals/UpdateFeeModal";

function Fees() {
  const [fees, setFees] = useState([]);
  const [users, setUsers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // Re-introducing the map for a robust solution

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState(null);

  // Function to fetch all necessary data
  const loadFeesData = async () => {
    try {
      const [feesData, usersData, seasonsData, feeTypesData] =
        await Promise.all([
          fetchAllFees(),
          fetchUsers(),
          fetchSeasons(),
          fetchFeeTypes(),
        ]);
      console.log("Fetched fees data:", feesData);

      setFees(feesData);
      setUsers(usersData);
      setSeasons(seasonsData);
      setFeeTypes(feeTypesData);

      // Build the users map for quick lookup
      const map = {};
      usersData.forEach((user) => {
        map[user._id] = user.names;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Failed to fetch all data:", error);
      toast.error("Failed to load fees dashboard data.");
    }
  };

  useEffect(() => {
    loadFeesData();
  }, []);

  // Handler for recording a new payment
  const handleAddFee = async (feeData) => {
    try {
      await recordPayment(feeData);
      setShowAddModal(false);
      toast.success("Fee record added successfully!");
      await loadFeesData(); // Re-fetch all data to refresh the list
    } catch (error) {
      console.error("Error recording fee:", error);
      toast.error(
        `Failed to record fee: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a fee record
  const handleDeleteFee = async (id) => {
    try {
      await deleteFee(id);
      toast.success("Fee record deleted successfully!");
      await loadFeesData(); // Re-fetch all data to refresh the list
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast.error(
        `Failed to delete fee record: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler to open the update modal with the selected fee's data
  const handleUpdateFee = (fee) => {
    setFeeToEdit(fee);
    setShowUpdateModal(true);
  };

  // Handler for submitting the updated fee
  const handleFeeUpdated = async (id, updatedFeeData) => {
    try {
      await updateFee(id, updatedFeeData);
      toast.success("Fee record updated successfully!");
      setShowUpdateModal(false);
      await loadFeesData(); // Re-fetch all data to refresh the list
    } catch (error) {
      console.error("Error updating fee:", error);
      toast.error(
        `Failed to update fee record: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Fees Dashboard
          </h4>
          <AddButton label="Record Fee" onClick={() => setShowAddModal(true)} />
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0 table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Season</th>
                <th>Fee Type</th>
                <th>Amount Owed</th>
                <th>Amount Paid</th>
                <th>Remaining Amount</th> 
                <th>Status</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.length > 0 ? (
                fees.map((fee, index) => (
                  <tr key={fee._id || index}>
                    <td>{index + 1}</td>
                   
                    <td>
                      {fee.userId?.names || usersMap[fee.userId] || "N/A"}
                    </td>
                    <td>
                      {fee.seasonId?.name || "N/A"} ({fee.seasonId?.year})
                    </td>
                    <td>{fee.feeTypeId?.name || "N/A"}</td>

                    <td>
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                      }).format(fee.amountOwed)}
                    </td>
                    <td>
                      {" "}
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                      }).format(fee.amountPaid)}
                    </td>
                    <td
                      style={{
                        color: fee.remainingAmount > 0 ? "#dc3545" : "#28a745",
                        fontWeight: "bold",
                      }}
                    >
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                      }).format(fee.remainingAmount)}
                    </td>
                    <td>{fee.status}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateFee(fee)}
                          confirmMessage={`Are you sure you want to update the fee for "${
                            fee.userId?.names || usersMap[fee.userId] || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteFee(fee._id)}
                          confirmMessage={`Are you sure you want to delete the fee for "${
                            fee.userId?.names || usersMap[fee.userId] || "N/A"
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
                    {" "}
                    {/* colSpan changed from 8 to 9 */}
                    <div className="alert alert-info" role="alert">
                      No fee records found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddFeeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFee}
        users={users}
        seasons={seasons}
        feeTypes={feeTypes}
      />
      <UpdateFeeModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleFeeUpdated}
        feeToEdit={feeToEdit}
        usersMap={usersMap} // Pass the map to the UpdateModal
      />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
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

export default Fees;
