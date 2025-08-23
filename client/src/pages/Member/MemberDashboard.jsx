import React, { useState, useEffect } from "react";
import { Layers, Factory, HandCoins } from "lucide-react"; // Removed Users, Added HandCoins
import StatCard from "../../components/StatCard";
import { fetchPurchaseInputsById } from "../../services/purchaseInputsService";
import { fetchProductionsById } from "../../services/productionService";
import { fetchProducts } from "../../services/productService";
import { fetchLoansById } from "../../services/loanService";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
function MemberDashboard() {
  const [countProduction, setProductionSales] = useState(0);
  const [countProducts, setCountProducts] = useState(0);
  const [countLoans, setCountLoans] = useState(0); // ✅ New state
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentProductions, setRecentProductions] = useState([]);

  // Fetch productions count
  useEffect(() => {
    const countSales = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;
        const response = await fetchProductionsById(userId);
        setProductionSales(response.length);
      } catch (error) {
        console.error("Failed to fetch productions count:", error);
      }
    };
    countSales();
  }, []);

  // Fetch products count
  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const cooperativeId = user?.cooperativeId;
        const response = await fetchProducts(cooperativeId);
        setCountProducts(response.data.length);
      } catch (error) {
        console.error("Failed to fetch products count:", error);
      }
    };
    fetchProductCount();
  }, []);

  // ✅ Fetch loans count
  useEffect(() => {
    const fetchLoanCount = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;
        const response = await fetchLoansById(userId); // assuming it returns an array
        setCountLoans(response.length);
      } catch (error) {
        console.error("Failed to fetch loans count:", error);
      }
    };
    fetchLoanCount();
  }, []);

  // Fetch recent purchases
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;
        const purchasesData = await fetchPurchaseInputsById(userId);
        setRecentPurchases(purchasesData);
      } catch (error) {
        console.error("Failed to fetch purchases:", error);
      }
    };
    loadPurchases();
  }, []);

  // Fetch recent productions
  useEffect(() => {
    const loadProductions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;
        const productionsData = await fetchProductionsById(userId);
        setRecentProductions(productionsData);
      } catch (error) {
        console.error("Failed to fetch productions:", error);
      }
    };
    loadProductions();
  }, []);

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area">
          <h4 className="fw-semibold mb-4 text-dark">Dashboard</h4>
          <div className="row flex-nowrap overflow-auto pb-2 gx-3">
            <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
              <StatCard
                title="Total Products"
                value={countProducts}
                color="#7B2FCE"
                icon={Layers}
              />
            </div>
            <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
              <StatCard
                title="Total Productions"
                value={countProduction}
                color="#0F62FE"
                icon={Factory}
              />
            </div>
            <div className="col-lg-4 col-md-4 col-sm-4 mb-3">
              <StatCard
                title="My Loans"
                value={countLoans}
                color="#E11D48"
                icon={HandCoins}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div
        className="f"
        style={{
          maxHeight: "57vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h5 className="fw-medium text-secondary mb-3">Recent Activities</h5>
        <div className="row g-4">
          {/* Recent Purchases */}
          <div className="col-md-6">
            <div className="card p-4 shadow-sm rounded-3 h-100 ">
              <h5 className="text-dark mb-3">Recent Purchases</h5>
              <TableContainer component={Paper} sx={{ height: "100%" }}>
                <Table size="small" aria-label="recent purchases table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Member</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Qty (kg)
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPurchases.length > 0 ? (
                      recentPurchases.slice(0, 3).map((p, index) => (
                        <TableRow key={p.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{p.userId?.names}</TableCell>
                          <TableCell>{p.productId?.productName}</TableCell>
                          <TableCell>{p.quantity}</TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              color: p.status === "paid" ? "green" : "orange",
                            }}
                          >
                            {p.status}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No purchases found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>

          {/* Recent Productions */}
          <div className="col-md-6">
            <div className="card p-4 shadow-sm rounded-3 h-100 ">
              <h5 className="text-dark mb-3">Recent Productions</h5>
              <TableContainer component={Paper} sx={{ height: "100%" }}>
                <Table size="small" aria-label="recent productions table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Member</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentProductions.length > 0 ? (
                      recentProductions.slice(0, 3).map((prod, index) => (
                        <TableRow key={prod.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{prod.userId?.names}</TableCell>
                          <TableCell>
                            {prod.productId?.productName || "N/A"}
                          </TableCell>
                          <TableCell>{prod.quantity}kg</TableCell>
                          <TableCell>
                            {prod.createdAt
                              ? new Date(prod.createdAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No productions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
