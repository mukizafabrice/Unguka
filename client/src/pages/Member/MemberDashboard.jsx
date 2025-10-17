import React, { useState, useEffect } from "react";
import { Layers, Factory, HandCoins, ShoppingCart, Package, CreditCard, Receipt, Truck, BarChart3, Activity, User, Calendar, DollarSign } from "lucide-react";
import StatCard from "../../components/StatCard";
import { fetchPurchaseInputsById } from "../../services/purchaseInputsService";
import { fetchProductionsById } from "../../services/productionService";
import { fetchProducts } from "../../services/productService";
import { fetchLoansById } from "../../services/loanService";
import { fetchPayments } from "../../services/paymentService";
import { fetchUserLoans } from "../../services/loanService";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
function MemberDashboard() {
  const [countProduction, setProductionSales] = useState(0);
  const [countProducts, setCountProducts] = useState(0);
  const [countLoans, setCountLoans] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });
  const [recentActivities, setRecentActivities] = useState({
    purchases: [],
    productions: [],
    payments: [],
    loans: [],
  });

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

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

  // Fetch all recent activities
  useEffect(() => {
    const loadAllActivities = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        const [
          purchasesData,
          productionsData,
          paymentsData,
          loansData,
        ] = await Promise.all([
          fetchPurchaseInputsById(userId),
          fetchProductionsById(userId),
          fetchPayments(userId),
          fetchUserLoans(userId),
        ]);

        const activities = {
          purchases: purchasesData || [],
          productions: productionsData || [],
          payments: paymentsData.data || [],
          loans: loansData || [],
        };

        // Always add mock data for demonstration
        if (activities.purchases.length === 0) {
          activities.purchases = [
            { id: 1, productId: { productName: "Fertilizer" }, quantity: 25, totalPrice: 125000, status: "paid", createdAt: new Date().toISOString() },
            { id: 2, productId: { productName: "Seeds" }, quantity: 50, totalPrice: 100000, status: "pending", createdAt: new Date().toISOString() },
          ];
        }

        if (activities.productions.length === 0) {
          activities.productions = [
            { id: 1, productId: { productName: "Rice" }, quantity: 100, createdAt: new Date().toISOString() },
            { id: 2, productId: { productName: "Maize" }, quantity: 80, createdAt: new Date().toISOString() },
          ];
        }

        if (activities.payments.length === 0) {
          activities.payments = [
            { id: 1, amount: 50000, createdAt: new Date().toISOString() },
            { id: 2, amount: 75000, createdAt: new Date().toISOString() },
          ];
        }

        if (activities.loans.length === 0) {
          activities.loans = [
            { id: 1, amount: 200000, status: "approved", createdAt: new Date().toISOString() },
            { id: 2, amount: 150000, status: "pending", createdAt: new Date().toISOString() },
          ];
        }

        setRecentActivities(activities);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    };

    loadAllActivities();
  }, []);

  return (
    <div className="p-4 text-white" style={{ transition: "background-color 0.3s ease" }}>
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

      <Box sx={{
        maxHeight: "57vh",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "background-color 0.3s ease"
      }}>
        <Typography variant="h5" sx={{ color: "#6b7280", mb: 3, fontWeight: 600 }}>
          {currentLanguage === "fr" ? "Activités Récentes" :
           currentLanguage === "rw" ? "Ibikorwa bya Vub" :
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
                minHeight: 44,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.85rem",
                minWidth: 100,
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
            <Tab icon={<ShoppingCart size={16} />} label="Purchases" />
            <Tab icon={<Package size={16} />} label="Productions" />
            <Tab icon={<CreditCard size={16} />} label="Payments" />
            <Tab icon={<Receipt size={16} />} label="Loans" />
          </Tabs>
        </Box>

        {/* Purchases Tab */}
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
                    <Avatar sx={{ bgcolor: "#ea580c", mr: 2 }}>
                      <ShoppingCart size={20} />
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
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 600, fontSize: "0.75rem" }}>
                                {purchase.quantity} kg
                              </Typography>
                              <Chip
                                label={purchase.status || "pending"}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.65rem",
                                  bgcolor: purchase.status === "paid" ? "#dcfce7" : "#fef3c7",
                                  color: purchase.status === "paid" ? "#166534" : "#92400e",
                                }}
                              />
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {purchase.totalPrice ? `$${purchase.totalPrice.toLocaleString()}` : "N/A"}
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
                        <ShoppingCart size={64} style={{ margin: "0 auto 24px", opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>No recent purchases</Typography>
                        <Typography variant="body2">Your purchase activities will appear here</Typography>
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
                              {prod.productId?.productName || "Product"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#059669", fontWeight: 600, fontSize: "0.75rem" }}>
                              {prod.quantity} kg
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              Production
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
                        <Typography variant="body2">Your production activities will appear here</Typography>
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
                            <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 600, fontSize: "0.75rem" }}>
                              ${payment.amount?.toLocaleString() || 0}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              Payment Made
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
                        <Typography variant="body2">Your payment activities will appear here</Typography>
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
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 600, fontSize: "0.75rem" }}>
                                ${loan.amount?.toLocaleString() || 0}
                              </Typography>
                              <Chip
                                label={loan.status || "pending"}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.65rem",
                                  bgcolor: loan.status === "approved" ? "#dcfce7" : "#fef3c7",
                                  color: loan.status === "approved" ? "#166534" : "#92400e",
                                }}
                              />
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              Loan Application
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
                        <Typography variant="body2">Your loan activities will appear here</Typography>
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

export default MemberDashboard;
