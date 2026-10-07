import { createSlice } from "@reduxjs/toolkit";
import {
  getSalesTransactions,
  getMonthlySales,
  getMonthToDateSales,
  getLastYearMonthToDateSales,
  getLastYearMonthlySales,
    getKPISalesTransactions,
    getKPIOverdueAccounts,
} from "./thunk";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

const initialState = {
  sales: [],
  monthlySales: [],
  monthToDateSales: [],
  lastYearMonthToDateSales: [],
  lastYearMonthlySales: [],
  branches: [],
  kpiSales: [],
  kpiOverdueAccounts: [],

  salesSummary: [],
  salesBranch: [],
  salesBranch_Type: [],

  loading: false,
  error: null,

  filters: {
    branch: "",
    dateRange: "Today",
    startDate: new Date().toLocaleDateString("en-GB"),
    endDate: new Date().toLocaleDateString("en-GB"),
    groupBy: "SUMMARY",
  },
};

const powerBISlice = createSlice({
  name: "powerbi",
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

        // case "Last 7 Days": {
        //   const end = new Date();
        //   const start = new Date();
        //   start.setDate(end.getDate() - 7);

        //   state.filters.startDate = formatDMY(start);
        //   state.filters.endDate = formatDMY(end);
        //   break;
        // }

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

    clearSalesData: () => initialState,
  },

 extraReducers: (builder) => {
  builder

    // ------------------------------------------
    // SALES TRANSACTIONS
    // ------------------------------------------

    .addCase(getSalesTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    .addCase(getSalesTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      const data = action.payload?.result || action.payload || [];

      state.sales = data;

      // Build unique branch list
      const map = {};

      data.forEach((item) => {
        const code = item.branch_ID;
        const name = item.brancch_Name;

        if (code == null) return;

        map[code] = {
          branchCode: code,
          branchName: name,
        };
      });

      state.branches = Object.values(map);
    })

    .addCase(getSalesTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.message ||
        action.payload ||
        action.error.message ||
        "Error loading sales transactions";
    })

    // ------------------------------------------
    // KPI SALES TRANSACTIONS
    // ------------------------------------------

    .addCase(getKPISalesTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    .addCase(getKPISalesTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      const groupBy = action.meta.arg?.groupBy;
      const result = action.payload?.result || action.payload || [];

      // Store the latest KPI sales result
      state.KPISales = result;

      switch (groupBy) {
        case "TYPE":
          state.salesType = result;
          break;

        case "BRANCH":
          state.salesBranch = result;
          break;

        case "BRANCH_TYPE":
          state.salesBranch_Type = result;
          break;

        default:
          break;
      }
    })

    .addCase(getKPISalesTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.message ||
        action.payload ||
        action.error.message ||
        "Error loading KPI sales transactions";
    })

    // ------------------------------------------
    // MONTHLY SALES
    // ------------------------------------------

    .addCase(getMonthlySales.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    .addCase(getMonthlySales.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.monthlySales =
        action.payload?.result || action.payload || [];
    })

    .addCase(getMonthlySales.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.message ||
        action.payload ||
        action.error.message ||
        "Error loading monthly sales";
    })

    // ------------------------------------------
    // LAST YEAR MONTHLY SALES
    // ------------------------------------------

    .addCase(getLastYearMonthlySales.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    .addCase(getLastYearMonthlySales.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.lastYearMonthlySales =
        action.payload?.result || action.payload || [];
    })

    .addCase(getLastYearMonthlySales.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.message ||
        action.payload ||
        action.error.message ||
        "Error loading last year monthly sales";
    })

    // ------------------------------------------
    // MONTH TO DATE SALES
    // ------------------------------------------

    .addCase(getMonthToDateSales.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    .addCase(getMonthToDateSales.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.monthToDateSales =
        action.payload?.result || action.payload || [];
    })

    .addCase(getMonthToDateSales.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.message ||
        action.payload ||
        action.error.message ||
        "Error loading month-to-date sales";
    })

    // ------------------------------------------
    // LAST YEAR MONTH TO DATE SALES
    // ------------------------------------------

    .addCase(getLastYearMonthToDateSales.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    .addCase(getLastYearMonthToDateSales.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.lastYearMonthToDateSales =
        action.payload?.result || action.payload || [];
    })

    .addCase(getLastYearMonthToDateSales.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.message ||
        action.payload ||
        action.error.message ||
        "Error loading last year month-to-date sales";
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
  // setBranches,
  setDateRange,
  setStartDate,
  setEndDate,
  clearSalesData,
} = powerBISlice.actions;

export default powerBISlice.reducer;
