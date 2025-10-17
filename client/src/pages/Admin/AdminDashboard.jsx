import React, { useState, useEffect } from "react";
import {
  Package,
  Users,
  Layers,
  XCircle,
  Info,
  Wallet,
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  Receipt,
  Truck,
  BarChart3,
  Activity,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import { fetchAllSales } from "../../services/salesService";
import { fetchAllProductions } from "../../services/productionService";
import { fetchCash } from "../../services/cashService";
import { fetchProducts } from "../../services/productService";
import { fetchUsers } from "../../services/userService";
import { fetchFeeTypes } from "../../services/feeTypeService";
import { fetchPayments } from "../../services/paymentService";
import { fetchAllCooperativeLoans } from "../../services/loanService";
import { fetchPurchaseInputs } from "../../services/purchaseInputsService";
import { fetchAllPurchaseOuts } from "../../services/purchaseOutService";
import { fetchStocks } from "../../services/stockService";
import { useAuth } from "../../contexts/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
function AdminDashboard() {
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;
  const [activeTab, setActiveTab] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

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
        setCash({ amount: 0 });
      }
    };
    loadCash();
  }, [cooperativeId]);

  // Fetch all recent activities
  const [recentActivities, setRecentActivities] = useState({
    sales: [],
    productions: [],
    payments: [],
    loans: [],
    purchases: [],
    stocks: [],
  });

  useEffect(() => {
    const loadAllActivities = async () => {
      try {
        const [
          salesData,
          productionsData,
          paymentsData,
          loansData,
          purchasesData,
          stocksData,
        ] = await Promise.all([
          fetchAllSales(cooperativeId),
          fetchAllProductions(cooperativeId),
          fetchPayments(cooperativeId),
          fetchAllCooperativeLoans(cooperativeId),
          fetchPurchaseInputs(cooperativeId),
          fetchStocks(cooperativeId),
        ]);

        setRecentActivities({
          sales: salesData.data || [],
          productions: productionsData.data || [],
          payments: paymentsData.data || [],
          loans: loansData.data || [],
          purchases: purchasesData.data || [],
          stocks: stocksData.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    };

    loadAllActivities();
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
      <Box sx={{
        maxHeight: "60vh",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "background-color 0.3s ease",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(0,0,0,0.1)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          borderRadius: "4px",
          "&:hover": {
            background: "linear-gradient(135deg, #2563eb, #1e40af)",
          },
        },
        "&::-webkit-scrollbar-thumb:active": {
          background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
        },
      }}>
        <Typography variant="h4" sx={{ color: "#1e293b", mb: 3, fontWeight: 700 }}>
          {currentLanguage === "fr" ? "Activités Récentes" :
           currentLanguage === "rw" ? "Ibikorwa vya Vuba" :
           "Recent Activities"}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                minWidth: 120,
                "&.Mui-selected": {
                  color: "#1976d2",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 1.5,
              },
            }}
          >
            <Tab icon={<ShoppingCart size={18} />} label="Sales" />
            <Tab icon={<Package size={18} />} label="Productions" />
            <Tab icon={<CreditCard size={18} />} label="Payments" />
            <Tab icon={<Receipt size={18} />} label="Loans" />
            <Tab icon={<Truck size={18} />} label="Purchases" />
            <Tab icon={<BarChart3 size={18} />} label="Stock" />
          </Tabs>
        </Box>

        {/* Sales Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #e3f2fd",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
                      <ShoppingCart size={20} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      Recent Sales
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {recentActivities.sales.length > 0 ? (
                      recentActivities.sales.slice(0, 6).map((sale, index) => (
                        <Box
                          key={sale.id || index}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            mb: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>
                              {sale.stockId && sale.stockId.productId
                                ? sale.stockId.productId.productName
                                : "Product"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#166534", fontWeight: 600, fontSize: "0.75rem" }}>
                              {formatCurrency(sale.totalPrice)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {sale.buyer} • {sale.quantity}kg
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {sale.createdAt
                                ? new Date(sale.createdAt).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 6, textAlign: "center", color: "#64748b" }}>
                        <ShoppingCart size={64} style={{ margin: "0 auto 24px", opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>No recent sales</Typography>
                        <Typography variant="body2">Sales activities will appear here</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Productions Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #e3f2fd",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#059669", mr: 2 }}>
                      <Package size={20} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      Recent Productions
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {recentActivities.productions.length > 0 ? (
                      recentActivities.productions.slice(0, 6).map((prod, index) => (
                        <Box
                          key={prod.id || index}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            mb: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>
                              {prod.productId ? prod.productId.productName : "Product"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#1e40af", fontWeight: 600, fontSize: "0.75rem" }}>
                              {prod.quantity} kg
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {prod.userId?.names || "Unknown"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {prod.createdAt
                                ? new Date(prod.createdAt).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 6, textAlign: "center", color: "#64748b" }}>
                        <Package size={64} style={{ margin: "0 auto 24px", opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>No recent productions</Typography>
                        <Typography variant="body2">Production activities will appear here</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Payments Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #e3f2fd",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#7c3aed", mr: 2 }}>
                      <CreditCard size={20} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      Recent Payments
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {recentActivities.payments.length > 0 ? (
                      recentActivities.payments.slice(0, 6).map((payment, index) => (
                        <Box
                          key={payment.id || index}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            mb: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>
                              Payment #{payment.id}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 600, fontSize: "0.75rem" }}>
                              {formatCurrency(payment.amount || 0)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {payment.userId?.names || "Unknown"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {payment.createdAt
                                ? new Date(payment.createdAt).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 6, textAlign: "center", color: "#64748b" }}>
                        <CreditCard size={64} style={{ margin: "0 auto 24px", opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>No recent payments</Typography>
                        <Typography variant="body2">Payment activities will appear here</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Loans Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #e3f2fd",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#dc2626", mr: 2 }}>
                      <Receipt size={20} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      Recent Loans
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {recentActivities.loans.length > 0 ? (
                      recentActivities.loans.slice(0, 6).map((loan, index) => (
                        <Box
                          key={loan.id || index}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            mb: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>
                              Loan #{loan.id}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#991b1b", fontWeight: 600, fontSize: "0.75rem" }}>
                              {formatCurrency(loan.amount || 0)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {loan.userId?.names || "Unknown"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {loan.createdAt
                                ? new Date(loan.createdAt).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 6, textAlign: "center", color: "#64748b" }}>
                        <Receipt size={64} style={{ margin: "0 auto 24px", opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>No recent loans</Typography>
                        <Typography variant="body2">Loan activities will appear here</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Purchases Tab */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #e3f2fd",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#ea580c", mr: 2 }}>
                      <Truck size={20} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      Recent Purchases
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {recentActivities.purchases.length > 0 ? (
                      recentActivities.purchases.slice(0, 6).map((purchase, index) => (
                        <Box
                          key={purchase.id || index}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            mb: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>
                              {purchase.productId?.productName || "Product"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#065f46", fontWeight: 600, fontSize: "0.75rem" }}>
                              {formatCurrency(purchase.totalPrice || 0)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {purchase.quantity || 0} kg
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {purchase.createdAt
                                ? new Date(purchase.createdAt).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 6, textAlign: "center", color: "#64748b" }}>
                        <Truck size={64} style={{ margin: "0 auto 24px", opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>No recent purchases</Typography>
                        <Typography variant="body2">Purchase activities will appear here</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Stock Tab */}
        {activeTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #e3f2fd",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#0891b2", mr: 2 }}>
                      <BarChart3 size={20} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      Recent Stock Updates
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {recentActivities.stocks.length > 0 ? (
                      recentActivities.stocks.slice(0, 6).map((stock, index) => (
                        <Box
                          key={stock.id || index}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            mb: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem" }}>
                              {stock.productId?.productName || "Product"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#6b21a8", fontWeight: 600, fontSize: "0.75rem" }}>
                              {stock.quantity || 0} kg
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              Available: {stock.availableQuantity || 0} kg
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {stock.updatedAt
                                ? new Date(stock.updatedAt).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 6, textAlign: "center", color: "#64748b" }}>
                        <BarChart3 size={64} style={{ margin: "0 auto 24px", opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>No recent stock updates</Typography>
                        <Typography variant="body2">Stock activities will appear here</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </div>
  );
}

export default AdminDashboard;
