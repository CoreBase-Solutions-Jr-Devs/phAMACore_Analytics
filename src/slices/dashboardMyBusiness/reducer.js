import { createSlice } from "@reduxjs/toolkit";
import {
  getInventoryProfitSummaryUser,
  getAccountBalance,
  getCashbookSummary,
  fetchMonthlyTrend,
  fetchSalesByType,
} from "./thunk";
import { DEFAULT_DATE_RANGE } from "../../pages/utils/dateHelper";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const initialState = {
  inventoryProfitSummaryUser: [],
  profitSummaryMetrics: [],
  accountBalance: [],
  cashbookSummary: [],
  cashbookSummaryMetrics: [],
  monthlyTrend: [],
  stockAsOf: null,
  salesByType: [],

  loading: false,
  loadingMonthlyTrend: false,
  loadingSalesByType: false,
  errorMonthlyTrend: null,
  errorSalesByType: null,
  loadingProfitSummary: false,
  loadingAccountBalance: false,
  loadingCashbookSummary: false,

  error: null,
  errorProfitSummary: null,
  errorAccountBalance: null,
  errorCashbookSummary: null,

  filters: {
    branch: null,
    dateRange: DEFAULT_DATE_RANGE,
    startDate: formatDMY(monthStart),
    endDate: formatDMY(today),
    groupBy: "SUMMARY",
  },
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

      switch (type) {
        case "Today": {
          const now = new Date();
          state.filters.startDate = formatDMY(now);
          state.filters.endDate = formatDMY(now);
          break;
        }

        case "Yesterday": {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          state.filters.startDate = formatDMY(y);
          state.filters.endDate = formatDMY(y);
          break;
        }

        case "This Week": {
          const now = new Date();
          const start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          const end = new Date(start);
          end.setDate(start.getDate() + 6);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);
          break;
        }

        case "Last Week": {
          const now = new Date();
          const currentWeekStart = new Date(now);
          currentWeekStart.setDate(now.getDate() - now.getDay());

          const start = new Date(currentWeekStart);
          start.setDate(currentWeekStart.getDate() - 7);

          const end = new Date(start);
          end.setDate(start.getDate() + 6);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);
          break;
        }

        case "This Month": {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);
          break;
        }

        case "Month to Date": {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(now);
          break;
        }

        case "Last Month": {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);
          break;
        }

        case "Last 7 Days": {
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - 6);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);
          break;
        }

        case "This Year":
        case "Year To Date": {
          const now = new Date();
          const start = new Date(now.getFullYear(), 0, 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(now);
          break;
        }

        default:
          break;
      }
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
  },
});

export const {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
  setGroupBy,
  clearMyBusinessData,
} = DashboardMyBusinessSlice.actions;

export default DashboardMyBusinessSlice.reducer;
