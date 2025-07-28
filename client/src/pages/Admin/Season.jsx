import React, { useState, useEffect } from "react";

import { fetchSeasons } from "../../services/seasonService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import { PlusCircle } from "lucide-react";
function Season() {
  // Fetch season
  const [seasons, setSeasons] = useState([]);
  useEffect(() => {
    const loadProductions = async () => {
      try {
        const productionsData = await fetchSeasons();
        setSeasons(productionsData);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadProductions();
  }, []);

  const handleUpdateReason = () => {
    alert("click to update");
  };
  const handleDeleteSale = () => {
    alert("hello world");
  };
  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Seasons Dashboard
          </h4>
          {/* New: Add Sale Button */}
          <button
            className="btn btn-success d-flex align-items-center"
            // onClick={() => setShowAddModal(true)}
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
                <th>StartedAt</th>
                <th>EndedAt</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {seasons.length > 0 ? (
                seasons.slice(0, 3).map((season, index) => (
                  <tr key={season.id}>
                    <td>{index + 1}</td>
                    <td>{season.name}</td>

                    <td>
                      {season.startDate
                        ? new Date(season.startDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {season.endDate
                        ? new Date(season.endDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateReason(season)}
                          confirmMessage={`Are you sure you want to update sale for "${
                            season.stockId?.productId?.productName || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(season._id)}
                          confirmMessage={`Are you sure you want to delete sale "${
                            season.stockId?.productId?.productName || "N/A"
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
                      No sales found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Season;
