import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css";

import { fetchPlotById } from "../../services/plotService";

function Plot() {
  const [plots, setPlots] = useState([]);

  // Function to load plots (can be called after add/update/delete)
  const loadPlots = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const plotsData = await fetchPlotById(userId);
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
  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Plots Dashboard
          </h4>
          <p className="text-dark">
            This is your Plots Dashboard, where you can see all the land plots
            you own and their details.
          </p>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
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
