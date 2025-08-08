import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddButton from "../../components/buttons/AddButton";
import {
  fetchSeasons,
  createSeasons,
  updateSeasons,
  deleteSeasons,
} from "../../services/seasonService";

import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";

import AddSeasonModal from "../../features/modals/AddSeasonModal";
import UpdateSeasonModal from "../../features/modals/UpdateSeasonModal";

function Season() {
  const [seasons, setSeasons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadSeasons = async () => {
    try {
      const seasonsData = await fetchSeasons();

      setSeasons(seasonsData);
    } catch (error) {
      console.error("Failed to fetch seasons:", error);
      toast.error("Failed to load seasons.");
      setSeasons([]);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleAddSeason = async (newSeasonData) => {
    try {
      await createSeasons(newSeasonData);
      toast.success("Season added successfully!");
      await loadSeasons();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add season:", error);
      toast.error(
        `Failed to add season: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleOpenUpdateModal = (season) => {
    setSelectedSeason(season);
    setShowUpdateModal(true);
  };

  const handleUpdateSeason = async (seasonId, updatedSeasonData) => {
    try {
      await updateSeasons(seasonId, updatedSeasonData);
      toast.success("Season updated successfully!");
      await loadSeasons();
      setShowUpdateModal(false);
      setSelectedSeason(null);
    } catch (error) {
      console.error("Failed to update season:", error);
      toast.error(
        `Failed to update season: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a season
  const handleDeleteSeason = async (id) => {
    try {
      await deleteSeasons(id);
      toast.success("Season deleted successfully!");
      await loadSeasons();
    } catch (error) {
      console.error("Failed to delete season:", error);
      toast.error(
        `Failed to delete season: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = seasons.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(seasons.length / rowsPerPage);
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Seasons Dashboard
          </h4>
          <AddButton label="Add Season" onClick={setShowAddModal} />
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Season Name</th>
                <th>Year</th>
                <th colSpan={2}>Action</th>{" "}
              </tr>
            </thead>
            <tbody>
              {seasons.length > 0 ? (
                currentRows.map((season, index) => (
                  <tr key={season._id}>
                    <td>{index + 1}</td>
                    <td>{season.name}</td>
                    <td>{season.year}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(season)}
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
                  <td colSpan="5" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No seasons found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="btn btn-outline-primary"
          >
            ← Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="btn btn-outline-primary"
          >
            Next →
          </button>
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
