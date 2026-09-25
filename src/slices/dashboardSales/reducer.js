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
import { setGroupBy } from "../dashboardPurchase/reducer";

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
  overdueSummary: [],
  overdueCustomers: [],
  overdueCategories: [],

  salesSummary: [],
  salesBranch: [],
  salesBranch_Type: [],

  loading: false,
  error: null,

  filters: {
    branch: null,
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
      .addCase(getSalesTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getSalesTransactions.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.result || action.payload || [];
        state.sales = data;

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

.addCase(getKPISalesTransactions.fulfilled, (state, action) => {
   const groupBy = action.meta.arg?.groupBy;
  const result = action.payload?.result || action.payload || [];
  if (groupBy === "TYPE") {
  state.salesType = result;
}

if (groupBy === "BRANCH") {
  state.salesBranch = result;
}

if (groupBy === "BRANCH_TYPE") {
  state.salesBranch_Type = result;
}        


})

      .addCase(getMonthlySales.fulfilled, (state, action) => {
        state.monthlySales = action.payload?.result || action.payload || [];
      })

      .addCase(getLastYearMonthlySales.fulfilled, (state, action) => {
        state.lastYearMonthlySales =
          action.payload?.result || action.payload || [];
      })

      // MONTH TO DATE
      .addCase(getMonthToDateSales.fulfilled, (state, action) => {
        state.monthToDateSales = action.payload?.result || action.payload || [];
      })

      // LAST YEAR MONTH TO DATE
      .addCase(getLastYearMonthToDateSales.fulfilled, (state, action) => {
        state.lastYearMonthToDateSales =
          action.payload?.result || action.payload || [];
      })

      .addCase(getKPIOverdueAccounts.fulfilled, (state, action) => {
  const groupBy = action.meta.arg?.groupBy;
  const result = action.payload?.result || action.payload || [];
  if (groupBy === "SUMMARY") {
  state.overdueSummary = result;
}

if (groupBy === "CUSTOMER") {
  state.overdueCustomers = result;
}

if (groupBy === "CATEGORY") {
  state.overdueCategories = result;
}        
      })

      .addCase(getSalesTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Error loading data";
      })

      .addCase(getMonthToDateSales.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Error loading data";
      })

      .addCase(getKPISalesTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Error loading data";
      })

      .addCase(getLastYearMonthToDateSales.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Error loading data";
      })

      .addCase(getMonthlySales.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Error loading data";
      })

      .addCase(getKPIOverdueAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Error loading data";
      })

      .addCase(getLastYearMonthlySales.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Error loading data";
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
