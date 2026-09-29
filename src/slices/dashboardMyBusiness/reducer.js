import { createSlice } from "@reduxjs/toolkit";
import {
  getInventoryProfitSummaryUser,
  getAccountBalance,
  getCashbookSummary,
} from "./thunk";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

const today = new Date();
const yearStart = new Date(today.getFullYear(), 0, 1);

const initialState = {
  inventoryProfitSummaryUser: [],
  profitSummaryMetrics: [],
  accountBalance: [],
  cashbookSummary: [],
  cashbookSummaryMetrics: [],

  loading: false,
  loadingProfitSummary: false,
  loadingAccountBalance: false,
  loadingCashbookSummary: false,

  error: null,
  errorProfitSummary: null,
  errorAccountBalance: null,
  errorCashbookSummary: null,

  filters: {
    branch: null,
    dateRange: "Year To Date",
    startDate: formatDMY(yearStart),
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
