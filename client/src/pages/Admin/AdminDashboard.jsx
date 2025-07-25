// src/pages/Admin/AdminDashboard.js
import React from "react";
import { Package, Users, Layers, XCircle, Info } from "lucide-react"; // Icons
import StatCard from "../../components/StatCard";
function AdminDashboard() {
  // These would typically come from API calls or a state management system
  const totalProducts = 11;
  const lowStock = 3;
  const outOfStock = 2;
  const suppliers = 5;

  const recentSales = [
    {
      id: "S001",
      product: "Product A",
      qty: 5,
      amount: "120.00",
      date: "2024-07-20",
    },
    {
      id: "S002",
      product: "Product B",
      qty: 2,
      amount: "45.50",
      date: "2024-07-19",
    },
    {
      id: "S003",
      product: "Product C",
      qty: 10,
      amount: "200.00",
      date: "2024-07-18",
    },
  ];

  const recentProductions = [
    {
      id: "P001",
      item: "Crop X",
      qty: 100,
      status: "Completed",
      date: "2024-07-21",
    },
    {
      id: "P002",
      item: "Crop Y",
      qty: 50,
      status: "In Progress",
      date: "2024-07-15",
    },
  ];

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
                  {" "}
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.id}</td>
                        <td>{sale.product}</td>
                        <td>{sale.qty}</td>
                        <td>${sale.amount}</td>
                        <td>{sale.date}</td>
                      </tr>
                    ))}
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
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProductions.map((prod) => (
                      <tr key={prod.id}>
                        <td>{prod.id}</td>
                        <td>{prod.item}</td>
                        <td>{prod.qty}</td>
                        <td>
                          <span
                            className={`badge ${
                              prod.status === "Completed"
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          >
                            {prod.status}
                          </span>
                        </td>
                        <td>{prod.date}</td>
                      </tr>
                    ))}
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
