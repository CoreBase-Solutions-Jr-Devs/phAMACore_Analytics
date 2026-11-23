import { createSlice } from "@reduxjs/toolkit";
import {
  getInventoryProfitSummaryUser,
  getAccountBalance,
  getCashbookSummary,
  fetchMonthlyTrend,
  fetchSalesByType,
  fetchStockConversionTrend,
  fetchStockConversionByBranch,
  fetchOutputVATAnalysis,
  fetchVATBreakdown,
  fetchBranchProfitability,
  fetchCustomerAging,
} from "./thunk";
import { DEFAULT_DATE_RANGE } from "../../pages/utils/dateHelper";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

export const computeDateRangeValues = (type, currentStart = "", currentEnd = "") => {
  switch (type) {
    case "Today": {
      const now = new Date();
      return { startDate: formatDMY(now), endDate: formatDMY(now) };
    }

    case "Yesterday": {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return { startDate: formatDMY(y), endDate: formatDMY(y) };
    }

    case "This Week": {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: formatDMY(start), endDate: formatDMY(end) };
    }

    case "Last Week": {
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay());

      const start = new Date(currentWeekStart);
      start.setDate(currentWeekStart.getDate() - 7);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: formatDMY(start), endDate: formatDMY(end) };
    }

    case "This Month": {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: formatDMY(start), endDate: formatDMY(end) };
    }

    case "Month To Date": {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: formatDMY(start), endDate: formatDMY(now) };
    }

    case "Month To Yesterday":
    case "Month to Yesterday":{
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return { startDate: formatDMY(start), endDate: formatDMY(yesterday)};      
    }

    case "Last Month": {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: formatDMY(start), endDate: formatDMY(end) };
    }

    case "Last 7 Days": {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      return { startDate: formatDMY(start), endDate: formatDMY(end) };
    }

    case "This Year":
    case "Year To Date": {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { startDate: formatDMY(start), endDate: formatDMY(now) };
    }

    case "Year To Yesterday": {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return { startDate: formatDMY(start), endDate: formatDMY(yesterday) };
    }

    case "Last Year": {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return { startDate: formatDMY(start), endDate: formatDMY(end) };
    }

    default:
      return { startDate: currentStart, endDate: currentEnd };
  }
};

const defaultFilters = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  return {
    branch: null,
    dateRange: DEFAULT_DATE_RANGE,
    startDate: formatDMY(start),
    endDate: formatDMY(yesterday),
    groupBy: "SUMMARY",
  };
};

const initialState = {
  inventoryProfitSummaryUser: [],
  profitSummaryMetrics: [],
  accountBalance: [],
  cashbookSummary: [],
  cashbookSummaryMetrics: [],
  monthlyTrend: [],
  stockAsOf: null,
  salesByType: [],
  stockConversionTrend: [],
  stockConversionByBranch: [],
  outputVATAnalysis: [],
  vatBreakdown: { summary: [], monthly: [], byTaxCode: [], byBranch: [] },
  branchProfitability: [],
  customerAging: [],

  loading: false,
  loadingMonthlyTrend: false,
  loadingSalesByType: false,
  errorMonthlyTrend: null,
  errorSalesByType: null,
  loadingProfitSummary: false,
  loadingAccountBalance: false,
  loadingCashbookSummary: false,
  loadingStockConversionTrend: false,
  loadingStockConversionByBranch: false,
  loadingOutputVATAnalysis: false,
  loadingVATBreakdown: false,
  loadingBranchProfitability: false,
  loadingCustomerAging: false,

  error: null,
  errorProfitSummary: null,
  errorAccountBalance: null,
  errorCashbookSummary: null,
  errorStockConversionTrend: null,
  errorStockConversionByBranch: null,
  errorOutputVATAnalysis: null,
  errorVATBreakdown: null,
  errorBranchProfitability: null,
  errorCustomerAging: null,

  filters: defaultFilters(),
  appliedFilters: defaultFilters(),
};

const DashboardMyBusinessSlice = createSlice({
  name: "DashboardMyBusiness",
  initialState,
  reducers: {
    setBranch: (state, action) => {
      state.filters.branch = action.payload;
    },

    setDateRange: (state, action) => {
      const type = action.payload;
      state.filters.dateRange = type;
      const { startDate, endDate } = computeDateRangeValues(
        type,
        state.filters.startDate,
        state.filters.endDate
      );
      state.filters.startDate = startDate;
      state.filters.endDate = endDate;
    },

    setStartDate: (state, action) => {
      state.filters.startDate = action.payload;
    },

    setEndDate: (state, action) => {
      state.filters.endDate = action.payload;
    },

    setGroupBy: (state, action) => {
      state.filters.groupBy = action.payload;
    },

    applyFilters: (state, action) => {
      if (action.payload && typeof action.payload === "object") {
        state.filters = {
          ...state.filters,
          ...action.payload,
        };
      }
      state.appliedFilters = { ...state.filters };
    },

    resetFilters: (state) => {
      const defaults = defaultFilters();
      state.filters = { ...defaults };
      state.appliedFilters = { ...defaults };
    },

    clearMyBusinessData: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // INVENTORY PROFIT SUMMARY USER / METRICS
      .addCase(getInventoryProfitSummaryUser.pending, (state) => {
        state.loading = true;
        state.loadingProfitSummary = true;
        state.error = null;
        state.errorProfitSummary = null;
      })
      .addCase(getInventoryProfitSummaryUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingProfitSummary = false;
        const result = action.payload?.result || action.payload || [];
        state.inventoryProfitSummaryUser = result;

        const groupBy = (action.meta?.arg?.GroupBy || action.meta?.arg?.groupBy || "USER").toUpperCase();
        if (groupBy === "SUMMARY") {
          state.profitSummaryMetrics = result;
        }
      })
      .addCase(getInventoryProfitSummaryUser.rejected, (state, action) => {
        state.loading = false;
        state.loadingProfitSummary = false;
        state.error = action.payload || action.error?.message || "Failed to fetch inventory profit summary";
        state.errorProfitSummary = action.payload || action.error?.message || "Failed to fetch inventory profit summary";
      })

      // ACCOUNT BALANCE
      .addCase(getAccountBalance.pending, (state) => {
        state.loading = true;
        state.loadingAccountBalance = true;
        state.error = null;
        state.errorAccountBalance = null;
      })
      .addCase(getAccountBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingAccountBalance = false;
        state.accountBalance = action.payload?.result || action.payload || [];
      })
      .addCase(getAccountBalance.rejected, (state, action) => {
        state.loading = false;
        state.loadingAccountBalance = false;
        state.error = action.payload || action.error?.message || "Failed to fetch account balance";
        state.errorAccountBalance = action.payload || action.error?.message || "Failed to fetch account balance";
      })

      // CASHBOOK SUMMARY
      .addCase(getCashbookSummary.pending, (state) => {
        state.loading = true;
        state.loadingCashbookSummary = true;
        state.error = null;
        state.errorCashbookSummary = null;
      })
      .addCase(getCashbookSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingCashbookSummary = false;
        const result = action.payload?.result || action.payload || [];
        state.cashbookSummary = result;

        const groupBy = (action.meta?.arg?.GroupBy || action.meta?.arg?.groupBy || "SUMMARY").toUpperCase();
        if (groupBy === "SUMMARY") {
          state.cashbookSummaryMetrics = result;
        }
      })
      .addCase(getCashbookSummary.rejected, (state, action) => {
        state.loading = false;
        state.loadingCashbookSummary = false;
        state.error = action.payload || action.error?.message || "Failed to fetch cashbook summary";
        state.errorCashbookSummary = action.payload || action.error?.message || "Failed to fetch cashbook summary";
      })

      // MONTHLY TREND (requestId guard: a slower, older request must not overwrite a newer one)
      .addCase(fetchMonthlyTrend.pending, (state, action) => {
        state.loadingMonthlyTrend = true;
        state.errorMonthlyTrend = null;
        state.monthlyTrendRequestId = action.meta.requestId;
      })
      .addCase(fetchMonthlyTrend.fulfilled, (state, action) => {
        if (state.monthlyTrendRequestId !== action.meta.requestId) return;
        state.loadingMonthlyTrend = false;
        state.monthlyTrend = action.payload?.months || [];
        state.stockAsOf = action.payload?.stockAsOf ?? null;
      })
      .addCase(fetchMonthlyTrend.rejected, (state, action) => {
        if (state.monthlyTrendRequestId !== action.meta.requestId) return;
        state.loadingMonthlyTrend = false;
        state.monthlyTrend = [];
        state.errorMonthlyTrend = action.payload || action.error?.message || "Failed to fetch monthly trend";
      })

      // SALES BY TYPE
      .addCase(fetchSalesByType.pending, (state, action) => {
        state.loadingSalesByType = true;
        state.errorSalesByType = null;
        state.salesByTypeRequestId = action.meta.requestId;
      })
      .addCase(fetchSalesByType.fulfilled, (state, action) => {
        if (state.salesByTypeRequestId !== action.meta.requestId) return;
        state.loadingSalesByType = false;
        state.salesByType = action.payload || [];
      })
      .addCase(fetchSalesByType.rejected, (state, action) => {
        if (state.salesByTypeRequestId !== action.meta.requestId) return;
        state.loadingSalesByType = false;
        state.salesByType = [];
        state.errorSalesByType = action.payload || action.error?.message || "Failed to fetch sales by type";
      });

      // STOCK CONVERSION TREND
      builder
      .addCase(fetchStockConversionTrend.pending, (state, action) => {
        state.loadingStockConversionTrend = true;
        state.errorStockConversionTrend = null;
        state.stockConversionTrendRequestId = action.meta.requestId;
      })
      .addCase(fetchStockConversionTrend.fulfilled, (state, action) => {
        if (state.stockConversionTrendRequestId !== action.meta.requestId) return;
        state.loadingStockConversionTrend = false;
        state.stockConversionTrend = action.payload || [];
      })
      .addCase(fetchStockConversionTrend.rejected, (state, action) => {
        if (state.stockConversionTrendRequestId !== action.meta.requestId) return;
        state.loadingStockConversionTrend = false;
        state.stockConversionTrend = [];
        state.errorStockConversionTrend = action.payload || action.error?.message || "Failed to fetch stock conversion trend";
      });

      // OUTPUT VAT ANALYSIS
      builder
      .addCase(fetchOutputVATAnalysis.pending, (state, action) => {
        state.loadingOutputVATAnalysis = true;
        state.errorOutputVATAnalysis = null;
        state.outputVATAnalysisRequestId = action.meta.requestId;
      })
      .addCase(fetchOutputVATAnalysis.fulfilled, (state, action) => {
        if (state.outputVATAnalysisRequestId !== action.meta.requestId) return;
        state.loadingOutputVATAnalysis = false;
        state.outputVATAnalysis = action.payload || [];
      })
      .addCase(fetchOutputVATAnalysis.rejected, (state, action) => {
        if (state.outputVATAnalysisRequestId !== action.meta.requestId) return;
        state.loadingOutputVATAnalysis = false;
        state.outputVATAnalysis = [];
        state.errorOutputVATAnalysis = action.payload || action.error?.message || "Failed to fetch output VAT analysis";
      })

      // STOCK CONVERSION BY BRANCH
      .addCase(fetchStockConversionByBranch.pending, (state, action) => {
        state.loadingStockConversionByBranch = true;
        state.errorStockConversionByBranch = null;
        state.stockConversionByBranchRequestId = action.meta.requestId;
      })
      .addCase(fetchStockConversionByBranch.fulfilled, (state, action) => {
        if (state.stockConversionByBranchRequestId !== action.meta.requestId) return;
        state.loadingStockConversionByBranch = false;
        state.stockConversionByBranch = action.payload || [];
      })
      .addCase(fetchStockConversionByBranch.rejected, (state, action) => {
        if (state.stockConversionByBranchRequestId !== action.meta.requestId) return;
        state.loadingStockConversionByBranch = false;
        state.stockConversionByBranch = [];
        state.errorStockConversionByBranch = action.payload || action.error?.message || "Failed to fetch branch stock conversion";
      })

      // VAT BREAKDOWN BUNDLE
      .addCase(fetchVATBreakdown.pending, (state, action) => {
        state.loadingVATBreakdown = true;
        state.errorVATBreakdown = null;
        state.vatBreakdownRequestId = action.meta.requestId;
      })
      .addCase(fetchVATBreakdown.fulfilled, (state, action) => {
        if (state.vatBreakdownRequestId !== action.meta.requestId) return;
        state.loadingVATBreakdown = false;
        state.vatBreakdown = action.payload || { summary: [], monthly: [], byTaxCode: [], byBranch: [] };
      })
      .addCase(fetchVATBreakdown.rejected, (state, action) => {
        if (state.vatBreakdownRequestId !== action.meta.requestId) return;
        state.loadingVATBreakdown = false;
        state.vatBreakdown = { summary: [], monthly: [], byTaxCode: [], byBranch: [] };
        state.errorVATBreakdown = action.payload || action.error?.message || "Failed to fetch VAT breakdown";
      })

      // BRANCH PROFITABILITY
      .addCase(fetchBranchProfitability.pending, (state, action) => {
        state.loadingBranchProfitability = true;
        state.errorBranchProfitability = null;
        state.branchProfitabilityRequestId = action.meta.requestId;
      })
      .addCase(fetchBranchProfitability.fulfilled, (state, action) => {
        if (state.branchProfitabilityRequestId !== action.meta.requestId) return;
        state.loadingBranchProfitability = false;
        state.branchProfitability = action.payload || [];
      })
      .addCase(fetchBranchProfitability.rejected, (state, action) => {
        if (state.branchProfitabilityRequestId !== action.meta.requestId) return;
        state.loadingBranchProfitability = false;
        state.branchProfitability = [];
        state.errorBranchProfitability = action.payload || action.error?.message || "Failed to fetch branch profitability";
      })

      // SHARED CUSTOMER AGING (PowerBIAccountBalance Mode=AGING)
      .addCase(fetchCustomerAging.pending, (state, action) => {
        state.loadingCustomerAging = true;
        state.errorCustomerAging = null;
        state.customerAgingRequestId = action.meta.requestId;
      })
      .addCase(fetchCustomerAging.fulfilled, (state, action) => {
        if (state.customerAgingRequestId !== action.meta.requestId) return;
        state.loadingCustomerAging = false;
        state.customerAging = action.payload || [];
      })
      .addCase(fetchCustomerAging.rejected, (state, action) => {
        if (state.customerAgingRequestId !== action.meta.requestId) return;
        state.loadingCustomerAging = false;
        state.customerAging = [];
        state.errorCustomerAging = action.payload || action.error?.message || "Failed to fetch customer aging";
      });

  },
});

export const {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
  setGroupBy,
  applyFilters,
  resetFilters,
  clearMyBusinessData,
} = DashboardMyBusinessSlice.actions;

export default DashboardMyBusinessSlice.reducer;
