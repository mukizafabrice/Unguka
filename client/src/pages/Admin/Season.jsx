import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PlusCircle } from "lucide-react";

import {
  fetchSeasons,
  createSeasons,
  updateSeasons,
  deleteSeasons,
} from "../../services/seasonService"; // Import all season service functions

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
// Assuming AddButton is a reusable component, but here we'll use a direct button for "Add Season"
// import AddButton from "../../components/buttons/AddButton";

import AddSeasonModal from "../../features/modals/AddSeasonModal"; // Import the new AddSeasonModal
import UpdateSeasonModal from "../../features/modals/UpdateSeasonModal"; // Import the new UpdateSeasonModal

function Season() {
  const [seasons, setSeasons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null); // To store the season being updated

  // Function to load seasons data from the backend
  const loadSeasons = async () => { // Renamed from loadProductions for clarity
    try {
      const seasonsData = await fetchSeasons();
      // The fetchSeasons service now handles parsing response.data or response directly
      setSeasons(seasonsData);
    } catch (error) {
      console.error("Failed to fetch seasons:", error); // Corrected error message
      toast.error("Failed to load seasons."); // User-friendly error notification
      setSeasons([]); // Ensure seasons state is an empty array on error
    }
  };

  // Effect hook to load seasons when the component mounts
  useEffect(() => {
    loadSeasons();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handler for adding a new season
  const handleAddSeason = async (newSeasonData) => {
    try {
      await createSeasons(newSeasonData); // API call to create the season
      toast.success("Season added successfully!"); // Success notification
      await loadSeasons(); // Re-fetch all seasons to update the table with the new entry
      setShowAddModal(false); // Close the Add Season modal
    } catch (error) {
      console.error("Failed to add season:", error);
      // Display a more specific error message from the backend if available
      toast.error(`Failed to add season: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handler for opening the Update Season modal
  const handleOpenUpdateModal = (season) => {
    setSelectedSeason(season); // Set the season object to be edited
    setShowUpdateModal(true); // Open the Update Season modal
  };

  // Handler for saving changes from the Update Season modal
  const handleUpdateSeason = async (seasonId, updatedSeasonData) => {
    try {
      await updateSeasons(seasonId, updatedSeasonData); // API call to update the season
      toast.success("Season updated successfully!"); // Success notification
      await loadSeasons(); // Re-fetch all seasons to update the table with changes
      setShowUpdateModal(false); // Close the Update Season modal
      setSelectedSeason(null); // Clear the selected season state
    } catch (error) {
      console.error("Failed to update season:", error);
      // Display a more specific error message from the backend if available
      toast.error(`Failed to update season: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handler for deleting a season
  const handleDeleteSeason = async (id) => {
    try {
      await deleteSeasons(id); // API call to delete the season
      toast.success("Season deleted successfully!"); // Success notification
      await loadSeasons(); // Re-fetch all seasons to update the table (removed item)
    } catch (error) {
      console.error("Failed to delete season:", error);
      // Display a more specific error message from the backend if available
      toast.error(`Failed to delete season: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Seasons Dashboard
          </h4>
          {/* Button to open the Add Season modal */}
          <button
            className="btn btn-success d-flex align-items-center"
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={20} className="me-2" /> Add Season
          </button>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Season Name</th>
                <th>Started At</th> {/* Changed to "Started At" for clarity */}
                <th>Ended At</th>   {/* Changed to "Ended At" for clarity */}
                <th colSpan={2}>Action</th> {/* Colspan for Update and Delete buttons */}
              </tr>
            </thead>
            <tbody>
              {seasons.length > 0 ? (
                seasons.map((season, index) => (
                  <tr key={season._id}> {/* Use season._id as the unique key for each row */}
                    <td>{index + 1}</td>
                    <td>{season.name}</td>
                    <td>
                      {/* Format the date for display */}
                      {season.startDate
                        ? new Date(season.startDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {/* Format the date for display */}
                      {season.endDate
                        ? new Date(season.endDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* Update Button */}
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(season)} // Pass the entire season object for editing
                          confirmMessage={`Are you sure you want to update season "${
                            season.name || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        {/* Delete Button */}
                        <DeleteButton
                          onConfirm={() => handleDeleteSeason(season._id)} // Pass the season's _id for deletion
                          confirmMessage={`Are you sure you want to delete season "${
                            season.name || "N/A"
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
                  {/* Message when no seasons are found, colSpan matches total columns */}
                  <td colSpan="5" className="text-center py-4"> {/* Adjusted colspan to 5 */}
                    <div className="alert alert-info" role="alert">
                      No seasons found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Season Modal Component */}
      <AddSeasonModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSeason}
      />

      {/* Update Season Modal Component */}
      <UpdateSeasonModal
        show={showUpdateModal}
        season={selectedSeason} // Prop name 'season' passed to the modal
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSeason} // Handler for saving updates from the modal
      />

      {/* ToastContainer for displaying success/error notifications */}
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

export default Season;