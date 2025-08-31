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
import { fetchAllSales } from "../../services/salesService";
import { fetchAllProductions } from "../../services/productionService";
import { fetchCash } from "../../services/cashService";
import { fetchProducts } from "../../services/productService";
import { fetchUsers } from "../../services/userService";
import { fetchFeeTypes } from "../../services/feeTypeService";
import { useAuth } from "../../contexts/AuthContext";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
function AdminDashboard() {
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;
  //fetch feeType
  const [countFeeTypes, setCountFeeTypes] = useState(0);
  useEffect(() => {
    const countFeeTypes = async () => {
      try {
        const response = await fetchFeeTypes(cooperativeId);

        setCountFeeTypes(response.data.length);
      } catch (error) {
        console.error("Failed to fetch feeType count:", error);
      }
    };
    countFeeTypes();
  }, [cooperativeId]);
  //fetch sales
  const [countSales, setCountSales] = useState(0);

  useEffect(() => {
    const countSales = async () => {
      try {
        const response = await fetchAllSales(cooperativeId);

        setCountSales(response.data.length);
      } catch (error) {
        console.error("Failed to fetch customers count:", error);
      }
    };
    countSales();
  }, [cooperativeId]);

  // Fetch members

  const [members, setMembers] = useState(0);
  useEffect(() => {
    const countUsers = async () => {
      try {
        const response = await fetchUsers();

        setMembers(response.data.length);
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
        const response = await fetchProducts(cooperativeId);
        setCountProducts(response.data.length);
      } catch (error) {
        console.error("Failed to fetch low stock count:", error);
      }
    };
    fetchProductCount();
  }, [cooperativeId]);
  //Fetch money

  const [cash, setCash] = useState({ amount: 0 });
  useEffect(() => {
    const loadCash = async () => {
      try {
        const cashData = await fetchCash(cooperativeId);
        console.log("Cash data:", cashData);
        setCash(cashData.data || { amount: 0 });
      } catch (error) {
        console.error("Failed to fetch cash:", error);
        setCash({ amount: 0 }); // Fallback to a default value on error
      }
    };

    loadCash();
  }, [cooperativeId]);

  // Fetch recent sales and productions
  const [recentSales, setRecentSales] = useState([]);
  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesData = await fetchAllSales(cooperativeId);
        setRecentSales(salesData.data);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadSales();
  }, [cooperativeId]);

  const [recentProductions, setRecentProductions] = useState([]);
  useEffect(() => {
    const loadProductions = async () => {
      try {
        const productionsData = await fetchAllProductions(cooperativeId);
        setRecentProductions(productionsData.data);
      } catch (error) {
        console.error("Failed to fetch productions:", error);
      }
    };

    loadProductions();
  }, [cooperativeId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area">
          <h4 className="fs-4 fw-medium mb-3" style={{ color: "black" }}>
            Dashboard
          </h4>
          <div className="row flex-nowrap overflow-auto pb-2 gx-3">
            <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <StatCard
                title="Fee Types"
                value={countFeeTypes}
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
      <div
        style={{
          maxHeight: "67vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h4 className="text-dark mb-3">Recent Activities</h4>
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm rounded-3 h-100 ">
              <h5 className="text-dark mb-3">Recent Sales</h5>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="recent sales table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Buyer</TableCell>
                      {/* <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSales.length > 0 ? (
                      recentSales.slice(0, 3).map((sale, index) => (
                        <TableRow key={sale.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {sale.stockId && sale.stockId.productId
                              ? sale.stockId.productId.productName
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {sale.quantity != null ? sale.quantity : "N/A"} kg
                          </TableCell>
                          <TableCell>
                            {formatCurrency(`${sale.totalPrice}`)}
                          </TableCell>
                          <TableCell>{sale.buyer}</TableCell>
                          {/* <TableCell>
                            {sale.createdAt
                              ? new Date(sale.createdAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell> */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm rounded-3 h-100 ">
              <h5 className="text-dark mb-3">Recent Productions</h5>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="recent productions table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Member</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Quantity
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentProductions.length > 0 ? (
                      recentProductions.slice(0, 3).map((prod, index) => (
                        <TableRow key={prod.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{prod.userId.names}</TableCell>
                          <TableCell>
                            {prod.productId
                              ? prod.productId.productName
                              : "N/A"}
                          </TableCell>
                          <TableCell>{prod.quantity} kg</TableCell>
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

export default AdminDashboard;
