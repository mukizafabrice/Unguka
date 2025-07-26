import React, { useState, useEffect } from "react";
import { Package, Users, Layers, XCircle, Info } from "lucide-react";
import StatCard from "../../components/StatCard";
import { fetchSales } from "../../services/salesService";
import { fetchProductions } from "../../services/productionService";

function AdminDashboard() {
  // These would typically come from API calls or a state management system
  const totalProducts = 11;
  const lowStock = 3;
  const outOfStock = 2;
  const suppliers = 5;

  const [recentSales, setRecentSales] = useState([]);
  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesData = await fetchSales();
        setRecentSales(salesData.data);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadSales();
  }, []);

  const [recentProductions, setRecentProductions] = useState([]);
  useEffect(() => {
    const loadProductions = async () => {
      try {
        const productionsData = await fetchProductions();
        setRecentProductions(productionsData);
        console.log("Fetched productions data:", productionsData);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadProductions();
  }, []);

  return (
    <div className="p-4 text-white">
      {" "}
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        {" "}
        <div className="dashboard-content-area">
          {" "}
          <h4 className="fs-4 fw-medium mb-3" style={{ color: "black" }}>
            Dashboard
          </h4>{" "}
          <div className="row flex-nowrap overflow-auto pb-2 gx-3">
            {" "}
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="Total Products"
                value={totalProducts}
                color="black"
                icon={Package}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="Low Stock"
                value={lowStock}
                color="orange"
                icon={Layers}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="Out of Stock"
                value={outOfStock}
                color="red"
                icon={XCircle}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="Suppliers"
                value={suppliers}
                color="black"
                icon={Users}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-dark-subtle rounded-3">
        {" "}
        <h4 className="text-white mb-3">Recent Activities</h4>
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark">
              {" "}
              <h5 className="text-white mb-3">Recent Sales</h5>
              <div className="table-responsive">
                <table className="table table-dark table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Amount</th>
                      <th>Buyer</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.length > 0 ? (
                      recentSales.slice(0, 3).map((sale, index) => (
                        <tr key={sale.id}>
                          <td>{index + 1}</td>
                          <td>{sale.stockId.productId.productName}</td>
                          <td>
                            {sale.quantity}
                            <span className="fw-bold">kg</span>
                          </td>
                          <td>
                            {sale.totalPrice}
                            <span className="fw-bold">rwf</span>
                          </td>
                          <dt>{sale.buyer}</dt>
                          <td>
                            {sale.createdAt
                              ? new Date(sale.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No sales found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark">
              {" "}
              {/* Card for tables, darker background */}
              <h5 className="text-white mb-3">Recent Productions</h5>
              <div className="table-responsive">
                <table className="table table-dark table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Member</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProductions.length > 0 ? (
                      recentProductions.slice(0, 3).map((prod, index) => (
                        <tr key={prod.id}>
                          <td>{index + 1}</td>
                          <td>{prod.userId.names}</td>
                          <td>{prod.productId.productName}</td>
                          <td>
                            {prod.quantity}
                            <span className="fw-bold">kg</span>
                          </td>
                          {/* <td>
                          <span
                            className={`badge ${
                              prod.status === "Completed"
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          >
                            {prod.status}
                          </span>
                        </td> */}
                          <td>
                            {prod.createdAt
                              ? new Date(prod.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No productions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
