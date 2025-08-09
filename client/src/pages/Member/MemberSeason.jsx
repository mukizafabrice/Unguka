import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchSeasons } from "../../services/seasonService";

function Season() {
  const [seasons, setSeasons] = useState([]);
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
              </tr>
            </thead>
            <tbody>
              {seasons.length > 0 ? (
                currentRows.map((season, index) => (
                  <tr key={season._id}>
                    <td>{index + 1}</td>
                    <td>{season.name}</td>
                    <td>{season.year}</td>
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
