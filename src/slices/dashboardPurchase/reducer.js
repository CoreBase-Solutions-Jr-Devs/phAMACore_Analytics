import { createSlice } from "@reduxjs/toolkit";

import {  
  getActualSpend,
  getKPIPurchases,
  getLastYearActualSpend,
  getKPIMaverickSpend,
  getKPIPriceAlerts,
  getKPILeadTime,
  getGoodsReceived,
  getLastYearGoodsReceived,
  // getBestPricePerSupplier,
} from "./thunk";

import { getKPIOverdueAccounts } from "../dashboardSales/thunk";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

const initialState = {
  PurchaseOrders: [],

  KPIPurchases: [],
  KPISummary: [],
  KPICategory: [],
  KPISupplier: [],
  KPIBranch: [],
  // KPIMonthly: [],
  KPIType: [],

  // Maverick Spend
  KPIMaverickSpend: [],
  KPIMaverickSpendSummary: [],
  KPIMaverickSpendSupplier: [],
  KPIMaverickSpendBranch: [],
  KPIMaverickSpendOffPOInvoices: [],
  KPIMaverickSpendPOPriceVariance: [],

  // Price Change Alerts
  KPIPriceAlerts: [],
  KPIPriceAlertsSummary: [],
  KPIPriceAlertsItems: [],
  KPIPriceAlertsHistory: [],

  // Lead Time
  KPILeadTime: [],
  KPILeadTimeSummary: [],
  KPILeadTimeSupplier: [],
  KPILeadTimePODetails: [],
  KPILeadTimeMonth: [],
  KPILeadTimeBranch: [],
  GoodsReceived: [],
  LastYearGoodsReceived: [],

  ActualSpend: [],

  LastYearActualSpend: [],

  kpiOverdueAccounts: [],

  loading: false,
  error: null,

  filters: {
    branchcode: "",
    dateRange: "Month To Yesterday",
    startDate: formatDMY(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    endDate: formatDMY(new Date(new Date().setDate(new Date().getDate() - 1))),
    // groupBy: "SUMMARY",
    // topN: 0,
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

          start.setDate(today.getDate() - today.getDay());

          const end = new Date(start);

          end.setDate(start.getDate() + 6);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "Last Week": {
          const today = new Date();

          const currentWeekStart = new Date(today);

          currentWeekStart.setDate(today.getDate() - today.getDay());

          const start = new Date(currentWeekStart);

          start.setDate(currentWeekStart.getDate() - 7);

          const end = new Date(start);

          end.setDate(start.getDate() + 6);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "This Month": {
          const today = new Date();

          const start = new Date(today.getFullYear(), today.getMonth(), 1);

          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "Last Month": {
          const today = new Date();

          const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);

          const end = new Date(today.getFullYear(), today.getMonth(), 0);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "This Year": {
          const today = new Date();

          const start = new Date(today.getFullYear(), 0, 1);

          const end = new Date(today.getFullYear(), 11, 31);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "Last Year": {
          const today = new Date();

          const start = new Date(today.getFullYear() - 1, 0, 1);

          const end = new Date(today.getFullYear() - 1, 11, 31);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);

          break;
        }

        case "Month To Date": {
          const today = new Date();

          const start = new Date(today.getFullYear(), today.getMonth(), 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(today);

          break;
        }

        case "Year To Date": {
          const today = new Date();

          const start = new Date(today.getFullYear(), 0, 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(today);

          break;
        }

        case "Month To Yesterday": {
          const today = new Date();

          const start = new Date(today.getFullYear(), today.getMonth(), 1);

          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(yesterday);

          break;
        }

        case "Year To Yesterday": {
          const today = new Date();

          const start = new Date(today.getFullYear(), 0, 1);

          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(yesterday);

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
      // KPI PURCHASES
      // ------------------------------------------

      .addCase(getKPIPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getKPIPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const groupBy = action.meta.arg?.groupBy;

        const result = action.payload?.result || action.payload || [];

        state.KPIPurchases = result;

        switch (groupBy) {
          case "SUMMARY":
            state.KPISummary = result;
            break;

          // case "CATEGORY":
          //   state.KPICategory = result;
          //   break;

          case "SUPPLIER":
            state.KPISupplier = result;
            break;

          case "BRANCH":
            state.KPIBranch = result;
            break;

          // case "MONTHLY":
          //   state.KPIMonthly = result;
          //   break;

          case "TYPE":
            state.KPIType = result;
            break;

          default:
            break;
        }
      })

      .addCase(getKPIPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading KPI purchases";
      })

      // ------------------------------------------
      // ACTUAL SPEND
      // ------------------------------------------

      .addCase(getActualSpend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getActualSpend.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.ActualSpend = action.payload?.result || action.payload || [];
      })

      .addCase(getActualSpend.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading actual spend";
      })

      // ------------------------------------------
      // LAST YEAR ACTUAL SPEND
      // ------------------------------------------

      .addCase(getLastYearActualSpend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getLastYearActualSpend.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

         state.LastYearActualSpend = action.payload?.result || action.payload || [];
      })

      .addCase(getLastYearActualSpend.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading last year actual spend";
      })

      // ------------------------------------------
      // KPI MAVERICK SPEND
      // ------------------------------------------

      .addCase(getKPIMaverickSpend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getKPIMaverickSpend.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const groupBy = action.meta.arg?.groupBy;
        const data = action.payload?.result || action.payload || [];

        switch (groupBy) {
          case "SUMMARY":
            state.KPIMaverickSpendSummary = data;
            break;

          case "SUPPLIER":
            state.KPIMaverickSpendSupplier = data;
            break;

          case "BRANCH":
            state.KPIMaverickSpendBranch = data;
            break;

          case "OFF_PO_INVOICES":
            state.KPIMaverickSpendOffPOInvoices = data;
            break;

          case "PO_PRICE_VARIANCE":
            state.KPIMaverickSpendPOPriceVariance = data;
            break;

          default:
            state.KPIMaverickSpend = data;
        }
      })

      .addCase(getKPIMaverickSpend.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading maverick spend";
      })

      // ------------------------------------------
      // KPI PRICE ALERTS
      // ------------------------------------------

      .addCase(getKPIPriceAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getKPIPriceAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const groupBy = action.meta.arg?.groupBy;
        const data = action.payload?.result || action.payload || [];

        switch (groupBy) {
          case "SUMMARY":
            state.KPIPriceAlertsSummary = data;
            break;

          case "ITEM_ALERTS":
            state.KPIPriceAlertsItems = data;
            break;

          case "ITEM_HISTORY":
            state.KPIPriceAlertsHistory = data;
            break;

          default:
            state.KPIPriceAlerts = data;
        }
      })

      .addCase(getKPIPriceAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading price alerts";
      })

      // ------------------------------------------
      // KPI LEAD TIME
      // ------------------------------------------

      .addCase(getKPILeadTime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getKPILeadTime.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const groupBy = action.meta.arg?.groupBy;
        const data = action.payload?.result || action.payload || [];

        switch (groupBy) {
          case "SUMMARY":
            state.KPILeadTimeSummary = data;
            break;

          case "SUPPLIER":
            state.KPILeadTimeSupplier = data;
            break;

          case "PO_DETAILS":
            state.KPILeadTimePODetails = data;
            break;

          case "MONTH":
            state.KPILeadTimeMonth = data;
            break;

          case "BRANCH":
            state.KPILeadTimeBranch = data;
            break;

          default:
            state.KPILeadTime = data;
        }
      })

      .addCase(getKPILeadTime.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading lead time";
      })

      // ------------------------------------------
      // GOODS RECEIVED
      // ------------------------------------------

      .addCase(getGoodsReceived.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getGoodsReceived.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.GoodsReceived = action.payload?.result || action.payload || [];
      })

      .addCase(getGoodsReceived.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading goods received";
      })

      // ------------------------------------------
      // GOODS RECEIVED
      // ------------------------------------------

      .addCase(getLastYearGoodsReceived.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getLastYearGoodsReceived.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.LastYearGoodsReceived =
          action.payload?.result || action.payload || [];
      })

      .addCase(getLastYearGoodsReceived.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading last year goods received";
      })
      
      // ------------------------------------------
      // KPI OVERDUE ACCOUNTS
      // ------------------------------------------

      .addCase(getKPIOverdueAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getKPIOverdueAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.kpiOverdueAccounts =
          action.payload?.result || action.payload || [];
      })

      .addCase(getKPIOverdueAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading overdue accounts";
      });
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
