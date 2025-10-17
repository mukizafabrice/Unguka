import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";
import { getMemberReport, downloadMemberReportWord } from "../../services/reportService";
import { fetchSeasons } from "../../services/seasonService";

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Button,
  Stack,
  Divider,
  useMediaQuery,
  styled,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import PersonIcon from "@mui/icons-material/Person";

// Styled components
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "& .MuiCardHeader-title": {
    fontWeight: 600,
    fontSize: "1.25rem",
  },
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  paddingBottom: theme.spacing(1),
}));

function MemberReports() {
  const { user } = useAuth();
  const cooperativeId = user?.cooperativeId;
  const [reportData, setReportData] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    loadSeasons();
    loadReport();
  }, [cooperativeId]);

  useEffect(() => {
    if (selectedSeasonId || seasons.length > 0) {
      loadReport();
    }
  }, [selectedSeasonId]);

  const loadSeasons = async () => {
    if (!cooperativeId) return;

    try {
      const response = await fetchSeasons(cooperativeId);
      if (response.success && Array.isArray(response.data)) {
        setSeasons(response.data);
        // Auto-select current active season
        const activeSeason = response.data.find(s => s.status === 'active');
        if (activeSeason) {
          setSelectedSeasonId(activeSeason._id);
        }
      }
    } catch (error) {
      console.error("Failed to load seasons:", error);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await getMemberReport(selectedSeasonId || null);
      if (response.success) {
        setReportData(response.data);
      } else {
        toast.error(response.message || "Failed to load report.");
      }
    } catch (error) {
      console.error("Failed to load report:", error);
      toast.error("An unexpected error occurred while loading the report.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleExport = async () => {
    try {
      const blob = await downloadMemberReportWord(selectedSeasonId || null);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `member-report-${userInfo?.names?.replace(/\s+/g, '-') || 'member'}-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download Word report");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Generating Your Report...</Typography>
      </Box>
    );
  }

  if (!reportData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary">No report data available</Typography>
      </Box>
    );
  }

  const { user: userInfo, summary, details, seasonalAnalysis, productionPredictions, generatedAt } = reportData;

  return (
    <Box sx={{
      p: isMobile ? 2 : 3,
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'auto'
    }}>
      {/* Header */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <StyledCardHeader
          title={
            <Box display="flex" alignItems="center" gap={2}>
              <PersonIcon fontSize="large" />
              <Box>
                <Typography variant="h5">Personal Activity Report</Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {userInfo.names} - Member Dashboard
                </Typography>
              </Box>
            </Box>
          }
          action={null}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography><strong>Report Generated:</strong> {new Date(generatedAt).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Season</InputLabel>
                <Select
                  value={selectedSeasonId}
                  label="Filter by Season"
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Seasons</em>
                  </MenuItem>
                  {seasons.map((season) => (
                    <MenuItem key={season._id} value={season._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {season.name} {season.year}
                        </Typography>
                        <Chip
                          label={season.status}
                          size="small"
                          color={season.status === 'active' ? 'success' : 'default'}
                          variant={season.status === 'active' ? 'filled' : 'outlined'}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Filter your activities by season</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Personal Summary */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Personal Summary" sx={{ backgroundColor: '#f8f9fa' }} />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h4" color="primary">{summary.totalPlots}</Typography>
                <Typography variant="body2" color="text.secondary">Land Plots</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h4" color="success.main">{summary.totalPlotSize.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">Plot Size (acres)</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h4" color="warning.main">{details.productions.length}</Typography>
                <Typography variant="body2" color="text.secondary">Production Records</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h4" color="info.main">{details.purchaseInputs.length}</Typography>
                <Typography variant="body2" color="text.secondary">Purchase Inputs</Typography>
              </MetricCard>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h5" color="success.main">{formatCurrency(summary.totalFeesPaid)}</Typography>
                <Typography variant="body2" color="text.secondary">Fees Paid</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h5" color="error.main">{formatCurrency(summary.totalFeesOwed - summary.totalFeesPaid)}</Typography>
                <Typography variant="body2" color="text.secondary">Outstanding Fees</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h5" color="primary.main">{formatCurrency(summary.totalProductionValue)}</Typography>
                <Typography variant="body2" color="text.secondary">Production Value</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h5" color="secondary.main">{formatCurrency(summary.totalPurchaseInputs)}</Typography>
                <Typography variant="body2" color="text.secondary">Input Purchases</Typography>
              </MetricCard>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Financial Overview" sx={{ backgroundColor: '#f8f9fa' }} />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SectionTitle variant="h6">Fee Management</SectionTitle>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total Fees Owed:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(summary.totalFeesOwed)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Fees Paid:</Typography>
                  <Typography color="success.main">{formatCurrency(summary.totalFeesPaid)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Outstanding:</Typography>
                  <Typography color="error.main">{formatCurrency(summary.totalFeesOwed - summary.totalFeesPaid)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography>Status Breakdown:</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`${summary.feesPaid} Paid`} color="success" size="small" />
                    <Chip label={`${summary.feesPartial} Partial`} color="warning" size="small" />
                    <Chip label={`${summary.feesUnpaid} Unpaid`} color="error" size="small" />
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionTitle variant="h6">Loan Management</SectionTitle>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total Loans Owed:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(summary.totalLoansOwed)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography>Status Breakdown:</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`${summary.loansRepaid} Repaid`} color="success" size="small" />
                    <Chip label={`${summary.loansPending} Pending`} color="warning" size="small" />
                  </Stack>
                </Box>
              </Stack>

              <SectionTitle variant="h6" sx={{ mt: 3 }}>Payment Summary</SectionTitle>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total Payments Due:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(summary.totalPaymentsDue)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Payments Paid:</Typography>
                  <Typography color="success.main">{formatCurrency(summary.totalPaymentsPaid)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography>Status Breakdown:</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`${summary.paymentsPaid} Paid`} color="success" size="small" />
                    <Chip label={`${summary.paymentsPartial} Partial`} color="warning" size="small" />
                    <Chip label={`${summary.paymentsPending} Pending`} color="default" size="small" />
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Activity Details */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Activity Details" sx={{ backgroundColor: '#f8f9fa' }} />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SectionTitle variant="h6">Recent Production</SectionTitle>
              {details.productions.length > 0 ? (
                <Stack spacing={1}>
                  {details.productions.slice(0, 5).map((prod, index) => (
                    <Paper key={index} sx={{ p: 2, backgroundColor: '#fafafa' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="bold">
                          {prod.productId?.productName || 'Product'}
                        </Typography>
                        <Chip label={`${prod.quantity} units`} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Value: {formatCurrency(prod.totalPrice)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(prod.createdAt).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">No production records found</Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionTitle variant="h6">Recent Purchases</SectionTitle>
              {details.purchaseInputs.length > 0 ? (
                <Stack spacing={1}>
                  {details.purchaseInputs.slice(0, 5).map((purchase, index) => (
                    <Paper key={index} sx={{ p: 2, backgroundColor: '#fafafa' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="bold">
                          {purchase.productId?.productName || 'Product'}
                        </Typography>
                        <Chip label={`${purchase.quantity} units`} size="small" color="secondary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Cost: {formatCurrency(purchase.totalPrice)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">No purchase records found</Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Seasonal Analysis */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Seasonal Performance" sx={{ backgroundColor: '#f8f9fa' }} />
        <CardContent>
          <Grid container spacing={2}>
            {seasonalAnalysis.map((season, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    {season.season}
                  </Typography>
                  <Chip
                    label={season.status}
                    color={season.status === 'active' ? 'success' : 'default'}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Fees:</strong> {season.fees.length} transactions
                    </Typography>
                    <Typography variant="body2">
                      <strong>Loans:</strong> {season.loans.length} transactions
                    </Typography>
                    <Typography variant="body2">
                      <strong>Production:</strong> {season.productions.length} records
                    </Typography>
                    <Typography variant="body2">
                      <strong>Purchases:</strong> {season.purchaseInputs.length} transactions
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Production Predictions */}
      {productionPredictions && (
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardHeader title="Production Predictions & Analytics" sx={{ backgroundColor: '#e8f5e8' }} />
          <CardContent>
            <Grid container spacing={3}>
              {/* Current Member Metrics */}
              <Grid item xs={12} md={6}>
                <SectionTitle variant="h6">Your Current Performance</SectionTitle>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Your Land Area:</Typography>
                    <Typography fontWeight="bold" color="primary">
                      {productionPredictions.currentMetrics.memberPlotSize.toFixed(2)} acres
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Your Production:</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      {productionPredictions.currentMetrics.memberProductionKg.toFixed(2)} kg
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Your Yield per Acre:</Typography>
                    <Typography fontWeight="bold" color="warning.main">
                      {productionPredictions.currentMetrics.memberYieldPerAre.toFixed(3)} kg/are
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Production Value:</Typography>
                    <Typography fontWeight="bold" color="info.main">
                      {formatCurrency(productionPredictions.currentMetrics.memberProductionValue)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Cooperative Comparison */}
              <Grid item xs={12} md={6}>
                <SectionTitle variant="h6">Cooperative Comparison</SectionTitle>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Cooperative Avg Yield:</Typography>
                    <Typography fontWeight="bold" color="secondary.main">
                      {productionPredictions.cooperativeComparison.cooperativeAverageYield.toFixed(3)} kg/are
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Historical Seasons:</Typography>
                    <Typography fontWeight="bold">
                      {productionPredictions.cooperativeComparison.historicalSeasonsCount}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Prediction Method:</Typography>
                    <Chip
                      label={
                        productionPredictions.predictions.method === 'cooperative_historical' ? 'Cooperative Data' :
                        productionPredictions.predictions.method === 'member_current' ? 'Your Performance' : 'Limited Data'
                      }
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </Grid>

              {/* Next Season Predictions */}
              <Grid item xs={12}>
                <SectionTitle variant="h6">Your Next Season Predictions</SectionTitle>
                <Box sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {productionPredictions.predictions.predictedYieldPerAre.toFixed(3)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Predicted Yield (kg/are)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                          {productionPredictions.predictions.predictedTotalProduction.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Production (kg)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                          {productionPredictions.predictions.confidenceLevel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Confidence Level
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="info.main" fontWeight="bold">
                          +5%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Growth Factor
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Prediction Assumptions:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {productionPredictions.predictions.assumptions.map((assumption, index) => (
                        <Chip
                          key={index}
                          label={assumption}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Download Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Report Download & Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Personal report for {userInfo.names} - Generated on {new Date(generatedAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unguka Cooperative Management System - Member Activity Report
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ minWidth: 120 }}
              >
                Print Report
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' },
                  minWidth: 150
                }}
              >
                Download Word
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default MemberReports;