import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../contexts/AuthContext";
import { getManagerReport, downloadManagerReportWord } from "../../services/reportService";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Stack,
  Divider,
  useMediaQuery,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import AssessmentIcon from "@mui/icons-material/Assessment";

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

function Reports() {
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
    if (!cooperativeId) {
      toast.error("Cooperative ID is not available.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getManagerReport(cooperativeId, selectedSeasonId || null);
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
      const blob = await downloadManagerReportWord(cooperativeId, selectedSeasonId || null);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cooperative-report-${cooperative?.name?.replace(/\s+/g, '-') || 'report'}-${new Date().toISOString().split('T')[0]}.docx`;
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
        <Typography variant="h6" sx={{ ml: 2 }}>Generating Report...</Typography>
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

  const { cooperative, summary, details, seasonalAnalysis, generatedAt, generatedBy } = reportData;
  const pp = reportData.productionPredictions || {};
  const currentMetrics = {
    totalLandArea: 0,
    totalProductionKg: 0,
    yieldPerAre: 0,
    totalProductionValue: 0,
    ...(pp.currentMetrics || {}),
  };
  const historicalAnalysis = {
    seasonsAnalyzed: 0,
    averageHistoricalYield: 0,
    ...(pp.historicalAnalysis || {}),
  };
  const predictions = {
    method: 'none',
    predictedYieldPerAre: 0,
    predictedTotalProduction: 0,
    confidenceLevel: 'N/A',
    assumptions: [],
    ...(pp.predictions || {}),
  };

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
              <AssessmentIcon fontSize="large" />
              <Box>
                <Typography variant="h5">Cooperative Management Report</Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {cooperative.name} - {cooperative.registrationNumber}
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
              {selectedSeasonId && (
                <Typography sx={{ mt: 1 }}>
                  <strong>Selected Season:</strong> {seasons.find(s => s._id === selectedSeasonId)?.name} {seasons.find(s => s._id === selectedSeasonId)?.year}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Season for Report *</InputLabel>
                <Select
                  value={selectedSeasonId}
                  label="Select Season for Report *"
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  required
                >
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
                <FormHelperText>Select a season to generate the report for</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Executive Summary" sx={{ backgroundColor: '#f8f9fa' }} />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h4" color="primary">{summary.totalMembers}</Typography>
                <Typography variant="body2" color="text.secondary">Total Members</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h4" color="success.main">{summary.totalSeasons}</Typography>
                <Typography variant="body2" color="text.secondary">Active Seasons</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h4" color="warning.main">{summary.totalProducts}</Typography>
                <Typography variant="body2" color="text.secondary">Products</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h4" color="info.main">{summary.totalPlots}</Typography>
                <Typography variant="body2" color="text.secondary">Land Plots</Typography>
              </MetricCard>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Typography variant="h5" color="success.main">{formatCurrency(summary.totalFeesPaid)}</Typography>
                <Typography variant="body2" color="text.secondary">Fees Collected</Typography>
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
                <Typography variant="h5" color="secondary.main">{formatCurrency(summary.totalSalesValue)}</Typography>
                <Typography variant="body2" color="text.secondary">Sales Revenue</Typography>
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

      {/* Operational Overview */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Operational Overview" sx={{ backgroundColor: '#f8f9fa' }} />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SectionTitle variant="h6">Production & Sales</SectionTitle>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total Production Value:</Typography>
                  <Typography color="primary.main" fontWeight="bold">{formatCurrency(summary.totalProductionValue)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total Sales Revenue:</Typography>
                  <Typography color="secondary.main" fontWeight="bold">{formatCurrency(summary.totalSalesValue)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Purchase Inputs:</Typography>
                  <Typography>{formatCurrency(summary.totalPurchaseInputs)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Purchase Outs:</Typography>
                  <Typography>{formatCurrency(summary.totalPurchaseOuts)}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionTitle variant="h6">Inventory & Assets</SectionTitle>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total Stock Value:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(summary.totalStockValue)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Current Season:</Typography>
                  <Chip
                    label={summary.activeSeason ? `${summary.activeSeason.name} ${summary.activeSeason.year}` : 'None'}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Seasonal Analysis */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Seasonal Performance Analysis" sx={{ backgroundColor: '#f8f9fa' }} />
        <CardContent>
          {selectedSeasonId ? (
            // Show only selected season data
            <Grid container spacing={2}>
              {seasonalAnalysis
                .filter(season => {
                  const selectedSeason = seasons.find(s => s._id === selectedSeasonId);
                  return selectedSeason && season.season === `${selectedSeason.name} ${selectedSeason.year}`;
                })
                .map((season, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper sx={{ p: 3, border: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" color="primary">
                          {season.season} - Detailed Analysis
                        </Typography>
                        <Chip
                          label={season.status}
                          color={season.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2} bgcolor="white" borderRadius={1}>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                              {season.fees.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Fee Transactions
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2} bgcolor="white" borderRadius={1}>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                              {season.loans.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Loan Transactions
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2} bgcolor="white" borderRadius={1}>
                            <Typography variant="h4" color="warning.main" fontWeight="bold">
                              {season.productions.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Production Records
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2} bgcolor="white" borderRadius={1}>
                            <Typography variant="h4" color="info.main" fontWeight="bold">
                              {season.purchaseInputs.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Input Purchases
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          ) : (
            // Show all seasons overview when no season is selected
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
                        <strong>Purchase Inputs:</strong> {season.purchaseInputs.length} transactions
                      </Typography>
                      <Typography variant="body2">
                        <strong>Sales:</strong> {season.sales.length} transactions
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Production Predictions */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Production Predictions & Analytics" sx={{ backgroundColor: '#e8f5e8' }} />
        <CardContent>
          <Grid container spacing={3}>
            {/* Current Metrics */}
            <Grid item xs={12} md={6}>
              <SectionTitle variant="h6">Current Season Metrics</SectionTitle>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Total Land Area:</Typography>
                  <Typography fontWeight="bold" color="primary">
                    {currentMetrics.totalLandArea.toFixed(2)} acres
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Total Production:</Typography>
                  <Typography fontWeight="bold" color="success.main">
                    {currentMetrics.totalProductionKg.toFixed(2)} kg
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Yield per Acre:</Typography>
                  <Typography fontWeight="bold" color="warning.main">
                    {currentMetrics.yieldPerAre.toFixed(3)} kg/are
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Production Value:</Typography>
                  <Typography fontWeight="bold" color="info.main">
                    {formatCurrency(currentMetrics.totalProductionValue)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Historical Analysis */}
            <Grid item xs={12} md={6}>
              <SectionTitle variant="h6">Historical Analysis</SectionTitle>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Seasons Analyzed:</Typography>
                  <Typography fontWeight="bold">
                    {historicalAnalysis.seasonsAnalyzed}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Average Historical Yield:</Typography>
                  <Typography fontWeight="bold" color="secondary.main">
                    {historicalAnalysis.averageHistoricalYield.toFixed(3)} kg/are
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Prediction Method:</Typography>
                  <Chip
                    label={predictions.method === 'historical' ? 'Historical Data' : 'Current Season'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Stack>
            </Grid>

            {/* Next Season Predictions */}
            <Grid item xs={12}>
              <SectionTitle variant="h6">Next Season Predictions</SectionTitle>
              <Box sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {predictions.predictedYieldPerAre.toFixed(3)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Predicted Yield (kg/are)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {predictions.predictedTotalProduction.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Production (kg)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {predictions.confidenceLevel}
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
                    {(predictions.assumptions || []).map((assumption, index) => (
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

      {/* Download Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Report Download & Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Report generated on {new Date(generatedAt).toLocaleDateString()} at {new Date(generatedAt).toLocaleTimeString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated by: {generatedBy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unguka Cooperative Management System - Professional Report
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

export default Reports;
