import { createSlice } from "@reduxjs/toolkit";

import {
  getPurchaseOrders,
  getActualSpend,
  getDailySpend,
  getKPIPurchases,
  getLastYearDailySpend,
  getLastYearActualSpend,
} from "./thunk";

const formatDMY = (date) =>
  date.toLocaleDateString("en-GB");

const initialState = {
  PurchaseOrders: [],

  KPIPurchases: [],
  KPISummary: [],
  KPICategory: [],
  KPISupplier: [],
  KPIBranch: [],
  KPIMonthly: [],
  KPIType: [],

  ActualSpend: [],
  ActualSpendSummary: [],
  ActualSpendCategory: [],
  ActualSpendSupplier: [],
  ActualSpendBranch: [],
  ActualSpendMonthly: [],
  ActualSpendType: [],

  DailySpend: [],
  DailySpendSummary: [],
  DailySpendCategory: [],
  DailySpendSupplier: [],
  DailySpendBranch: [],
  DailySpendMonthly: [],
  DailySpendType: [],

  LastYearActualSpend: [],
  LastYearActualSpendSummary: [],
  LastYearActualSpendCategory: [],
  LastYearActualSpendSupplier: [],
  LastYearActualSpendBranch: [],
  LastYearActualSpendMonthly: [],
  LastYearActualSpendType: [],

  LastYearDailySpend: [],
  LastYearDailySpendSummary: [],
  LastYearDailySpendCategory: [],
  LastYearDailySpendSupplier: [],
  LastYearDailySpendBranch: [],
  LastYearDailySpendMonthly: [],
  LastYearDailySpendType: [],

  loading: false,
  error: null,

  filters: {
    branch: null,
    dateRange: "Today",
    startDate: new Date().toLocaleDateString("en-GB"),
    endDate: new Date().toLocaleDateString("en-GB"),
    groupBy: "SUMMARY",
    topN: 0,
  },
};

const PurchaseOrdersSlice = createSlice({
  name: "PurchaseOrders",

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
          const today = new Date();

          state.filters.startDate = formatDMY(today);
          state.filters.endDate = formatDMY(today);

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
          const today = new Date();

          const start = new Date(today);

          start.setDate(
            today.getDate() - today.getDay()
          );

          const end = new Date(start);

          end.setDate(
            start.getDate() + 6
          );

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "Last Week": {
          const today = new Date();

          const currentWeekStart = new Date(today);

          currentWeekStart.setDate(
            today.getDate() - today.getDay()
          );

          const start = new Date(
            currentWeekStart
          );

          start.setDate(
            currentWeekStart.getDate() - 7
          );

          const end = new Date(start);

          end.setDate(
            start.getDate() + 6
          );

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "This Month": {
          const today = new Date();

          const start = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );

          const end = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          );

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "Last Month": {
          const today = new Date();

          const start = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );

          const end = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
          );

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "This Year": {
          const today = new Date();

          const start = new Date(
            today.getFullYear(),
            0,
            1
          );

          const end = new Date(
            today.getFullYear(),
            11,
            31
          );

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "Last Year": {
          const today = new Date();

          const start = new Date(
            today.getFullYear() - 1,
            0,
            1
          );

          const end = new Date(
            today.getFullYear() - 1,
            11,
            31
          );

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "Month To Date": {
          const today = new Date();

          const start = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(today);

          break;
        }

        case "Year To Date": {
          const today = new Date();

          const start = new Date(
            today.getFullYear(),
            0,
            1
          );

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(today);

          break;
        }

        case "Custom":
          state.filters.dateRange = "Custom";
          break;

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

    setTopN: (state, action) => {
      state.filters.topN = action.payload;
    },

    clearPurchaseOrdersData: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // ------------------------------------------
      // PURCHASE ORDERS
      // ------------------------------------------

      .addCase(
        getPurchaseOrders.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getPurchaseOrders.fulfilled,
        (state, action) => {
          state.loading = false;

          state.PurchaseOrders =
            action.payload?.result ||
            action.payload ||
            [];
        }
      )

      .addCase(
        getPurchaseOrders.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message ||
            "Error loading data";
        }
      )

      // ------------------------------------------
      // KPI PURCHASES
      // ------------------------------------------

      .addCase(
        getKPIPurchases.fulfilled,
        (state, action) => {
          const groupBy =
            action.meta.arg?.groupBy;

          const result =
            action.payload?.result ||
            action.payload ||
            [];

         
          state.KPIPurchases = result;

          switch (groupBy) {
            case "SUMMARY":
              state.KPISummary = result;
              break;

            case "CATEGORY":
              state.KPICategory = result;
              break;

            case "SUPPLIER":
              state.KPISupplier = result;
              break;

            case "BRANCH":
              state.KPIBranch = result;
              break;

            case "MONTHLY":
              state.KPIMonthly = result;
              break;

            case "TYPE":
              state.KPIType = result;
              break;

            default:
              break;
          }
        }
      )

      .addCase(
        getKPIPurchases.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message ||
            "Error loading KPI purchases";
        }
      )

      // ------------------------------------------
      // ACTUAL SPEND
      // ------------------------------------------

     .addCase(getActualSpend.fulfilled, (state, action) => {
  state.loading = false;

  const groupBy = action.meta.arg?.groupBy;
  const result = action.payload?.result || action.payload || [];

  switch (groupBy) {
    case "SUMMARY":
      state.ActualSpendSummary = result;
      break;

    case "CATEGORY":
      state.ActualSpendCategory = result;
      break;

    case "SUPPLIER":
      state.ActualSpendSupplier = result;
      break;

    case "BRANCH":
      state.ActualSpendBranch = result;
      break;

    case "MONTHLY":
      state.ActualSpendMonthly = result;
      break;

    case "TYPE":
      state.ActualSpendType = result;
      break;

    default:
      state.ActualSpend = result;
      break;
  }
})

      .addCase(
        getActualSpend.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message ||
            "Error loading actual spend";
        }
      )

      // ------------------------------------------
      // DAILY SPEND
      // ------------------------------------------

.addCase(getDailySpend.fulfilled, (state, action) => {
  state.loading = false;

  const groupBy = action.meta.arg?.groupBy;
  const result = action.payload?.result || action.payload || [];

  switch (groupBy) {
    case "SUMMARY":
      state.DailySpendSummary = result;
      break;

    case "CATEGORY":
      state.DailySpendCategory = result;
      break;

    case "SUPPLIER":
      state.DailySpendSupplier = result;
      break;

    case "BRANCH":
      state.DailySpendBranch = result;
      break;

    case "MONTHLY":
      state.DailySpendMonthly = result;
      break;

    case "TYPE":
      state.DailySpendType = result;
      break;

    default:
      state.DailySpend = result;
      break;
  }
})

      .addCase(
        getDailySpend.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message ||
            "Error loading daily spend";
        }
      )

      // ------------------------------------------
      // LAST YEAR ACTUAL SPEND
      // ------------------------------------------

   .addCase(getLastYearActualSpend.fulfilled, (state, action) => {
  state.loading = false;

  const groupBy = action.meta.arg?.groupBy;
  const result =
    action.payload?.result ||
    action.payload ||
    [];

  switch (groupBy) {
    case "SUMMARY":
      state.LastYearActualSpendSummary = result;
      break;

    case "CATEGORY":
      state.LastYearActualSpendCategory = result;
      break;

    case "SUPPLIER":
      state.LastYearActualSpendSupplier = result;
      break;

    case "BRANCH":
      state.LastYearActualSpendBranch = result;
      break;

    case "MONTHLY":
      state.LastYearActualSpendMonthly = result;
      break;

    case "TYPE":
      state.LastYearActualSpendType = result;
      break;

    default:
      state.LastYearActualSpend = result;
      break;
  }
})

      .addCase(
        getLastYearActualSpend.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message ||
            "Error loading last year actual spend";
        }
      )

      // ------------------------------------------
      // LAST YEAR DAILY SPEND
      // ------------------------------------------
.addCase(getLastYearDailySpend.fulfilled, (state, action) => {
  state.loading = false;

  const groupBy = action.meta.arg?.groupBy;
  const result =
    action.payload?.result ||
    action.payload ||
    [];

  switch (groupBy) {
    case "SUMMARY":
      state.LastYearDailySpendSummary = result;
      break;

    case "CATEGORY":
      state.LastYearDailySpendCategory = result;
      break;

    case "SUPPLIER":
      state.LastYearDailySpendSupplier = result;
      break;

    case "BRANCH":
      state.LastYearDailySpendBranch = result;
      break;

    case "MONTHLY":
      state.LastYearDailySpendMonthly = result;
      break;

    case "TYPE":
      state.LastYearDailySpendType = result;
      break;

    default:
      state.LastYearDailySpend = result;
      break;
  }
})

      .addCase(
        getLastYearDailySpend.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message ||
            "Error loading last year daily spend";
        }
      );
  },
});

export const {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
  setGroupBy,
  setTopN,
  clearPurchaseOrdersData,
} = PurchaseOrdersSlice.actions;

export default PurchaseOrdersSlice.reducer;