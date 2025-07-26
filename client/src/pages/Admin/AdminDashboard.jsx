import React, { useState, useEffect } from "react";
import {
  Package,
  Users,
  Layers,
  XCircle,
  Info,
  Wallet,
  ShoppingCart,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import { fetchSales } from "../../services/salesService";
import { fetchProductions } from "../../services/productionService";
import { fetchCash } from "../../services/stockService";
import { fetchProduct } from "../../services/productService";
import { fetchUsers } from "../../services/userService";

function AdminDashboard() {
  //fetch sales
  const [countSales, setCountSales] = useState(0);

  useEffect(() => {
    const countSales = async () => {
      try {
        const response = await fetchSales();

        setCountSales(response.data.length);
      } catch (error) {
        console.error("Failed to fetch customers count:", error);
      }
    };
    countSales();
  }, []);

  // Fetch members

  const [members, setMembers] = useState(0);
  useEffect(() => {
    const countUsers = async () => {
      try {
        const response = await fetchUsers();

        setMembers(response.length);
      } catch (error) {
        console.error("Failed to fetch low stock count:", error);
      }
    };
    countUsers();
  }, []);

  //fetch product

  const [countProducts, setCountProducts] = useState(0);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await fetchProduct();
        setCountProducts(response.length);
      } catch (error) {
        console.error("Failed to fetch low stock count:", error);
      }
    };
    fetchProductCount();
  }, []);
  //Fetch money
  const [cash, setCash] = useState(0);
  useEffect(() => {
    const loadCash = async () => {
      try {
        const cashData = await fetchCash();
        setCash(cashData.totalCash);
      } catch (error) {
        console.error("Failed to fetch low stock count:", error);
      }
    };

    loadCash();
  }, []);

  // Fetch recent sales and productions
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
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadProductions();
  }, []);

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area">
          <h4 className="fs-4 fw-medium mb-3" style={{ color: "black" }}>
            Dashboard
          </h4>
          <div className="row flex-nowrap overflow-auto pb-2 gx-3">
            {" "}
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="CASH IN HAND"
                value={`${cash} rwf`}
                color="black"
                icon={Wallet}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="Total Product"
                value={countProducts}
                color="orange"
                icon={Layers}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="Total Members"
                value={members}
                color="red"
                icon={Users}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="total Sales"
                value={countSales}
                color="black"
                icon={ShoppingCart}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-dark-subtle rounded-3">
        <h4 className="text-white mb-3">Recent Activities</h4>
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark">
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
                          <td>{sale.buyer}</td>
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
