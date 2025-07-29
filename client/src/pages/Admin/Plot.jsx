import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css";

import {
  fetchPlot,
  createPlot,
  updatePlot,
  deletePlot,
} from "../../services/plotService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
import AddPlotModal from "../../features/modals/AddPlotModal";
import UpdatePlotModal from "../../features/modals/UpdatePlotModal";

function Plot() {
  const [plots, setPlots] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);

  // Function to load plots (can be called after add/update/delete)
  const loadPlots = async () => {
    try {
      const plotsData = await fetchPlot();
      setPlots(plotsData.data);
      console.log("Plots loaded successfully:", plotsData);
    } catch (error) {
      console.error("Failed to fetch plots:", error);
      toast.error("Failed to load plots.");
    }
  };

  // Fetch plots on component mount
  useEffect(() => {
    loadPlots();
  }, []);

  // Handle adding a new plot
  const handleAddPlot = async (newData) => {
    console.log("New plot to be added:", newData);
    try {
      await createPlot(newData);
      console.log("Plot added successfully!");
      await loadPlots();
      setShowAddModal(false);
      toast.success("Plot added successfully!");
    } catch (error) {
      console.error("Failed to add plot:", error);
      if (error.response) {
        toast.error(
          `Failed to add plot: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else {
        toast.error("Failed to add plot.");
      }
    }
  };

  // Handle opening the update modal
  const handleOpenUpdateModal = (plot) => {
    setSelectedPlot(plot);
    setShowUpdateModal(true);
  };

  // Handle plot update
  const handleUpdatePlot = async (updatedData) => {
    console.log("Plot to be updated:", updatedData);
    try {
      const { _id, ...dataToUpdate } = updatedData; // Extract _id and rest of data
      await updatePlot(_id, dataToUpdate); // Pass ID and data to update
      console.log("Plot updated successfully!");
      await loadPlots(); // Reload data to show changes
      setShowUpdateModal(false); // Close the modal
      setSelectedPlot(null); // Clear selected plot
      toast.success("Plot updated successfully!");
    } catch (error) {
      console.error("Failed to update plot:", error);
      if (error.response) {
        toast.error(
          `Failed to update plot: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else {
        toast.error("Failed to update plot.");
      }
    }
  };

  // Handle plot deletion
  const handleDeletePlot = async (id) => {
    console.log("Deleting plot with ID:", id);
    try {
      await deletePlot(id);
      console.log("Plot deleted successfully!");
      await loadPlots(); // Reload data to show changes
      toast.success("Plot deleted successfully!");
    } catch (error) {
      console.error("Failed to delete plot:", error);
      if (error.response) {
        toast.error(
          `Failed to delete plot: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else {
        toast.error("Failed to delete plot.");
      }
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Plots Dashboard
          </h4>

          <AddButton label="Add Plot" onClick={() => setShowAddModal(true)} />
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Product Name</th>
                <th>Area</th>
                <th>UPI</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {plots.length > 0 ? (
                plots.map((plot, index) => (
                  <tr key={plot._id}>
                    <td>{index + 1}</td>
                    <td>{plot.userId?.names || "N/A"}</td>
                    <td>{plot.productId?.productName || "N/A"}</td>{" "}
                    <td>{plot.area}</td>
                    <td>{plot.upi}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleOpenUpdateModal(plot)}
                          confirmMessage={`Are you sure you want to update plot for "${
                            plot.upi || "N/A" // Use UPI for confirmation
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeletePlot(plot._id)}
                          confirmMessage={`Are you sure you want to delete plot "${
                            plot.upi || "N/A" // Use UPI for confirmation
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
                  <td colSpan="6" className="text-center py-4">
                    {" "}
                    {/* colSpan should be 6 now */}
                    <div className="alert alert-info" role="alert">
                      No plots found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plot Modal */}
      <AddPlotModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPlot}
      />

      {/* Update Plot Modal */}
      <UpdatePlotModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdatePlot}
        initialData={selectedPlot}
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

export default Plot;
