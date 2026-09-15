import { createSlice } from "@reduxjs/toolkit";
import { fetchBatchExpiry, fetchBatchExpiryNeo, fetchBranches, fetchDailyClosingStock, fetchStockInventoryKPIs, fetchStockMovements } from "./thunk";
import { saveCachedBranches } from "../../helpers/branch_helper";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

export const initialState = {
  dailyClosingStock: [],
  stockMovements: [],
  batchExpiry: [],
  batchExpiryNeo: [],
  branches: [],
  loadingStock: false,
  loadingMovements: false,
  loadingBatchExpiry: false,
  loadingBatchExpiryNeo: false,
  loadingBranches: false, 
  errorBranches: null,
  errorStock: null,
  errorMovements: null,
  errorBatchExpiry: null,
  errorBatchExpiryNeo: null,
  filters: {
    branch: null,
    dateRange: "Today",
    startDate: formatDMY(new Date()),
    endDate: formatDMY(new Date()),
  },
};

const StockInventorySlice = createSlice({
  name: "StockInventory",
  initialState,
  reducers: {
    resetInventoryState: () => initialState,
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
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          state.filters.startDate = formatDMY(yesterday);
          state.filters.endDate = formatDMY(yesterday);
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

        case "This Week": {
          const today = new Date();
          const start = new Date(today);

          const day = start.getDay();
          const diff = day === 0 ? 6 : day - 1;

          start.setDate(start.getDate() - diff);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(today);
          break;
        }

        case "Last Week": {
          const today = new Date();
          // Current week Monday
          const currentWeekStart = new Date(today);
          const day = currentWeekStart.getDay();
          const diff = day === 0 ? 6 : day - 1;
          currentWeekStart.setDate(currentWeekStart.getDate() - diff);
          // Previous week Monday
          const start = new Date(currentWeekStart);
          start.setDate(start.getDate() - 7);
          // Previous week Sunday
          const end = new Date(currentWeekStart);
          end.setDate(end.getDate() - 1);
          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);
          break;
        }

        case "This Month": {
          const today = new Date();
          const start = new Date(today.getFullYear(), today.getMonth(), 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(today);
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
          const start = new Date(today.getFullYear(), 0, 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(today);
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

        case "Custom":
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyClosingStock.pending, (state) => {
        state.loadingStock = true;
        state.errorStock = null;
      })

      .addCase(fetchDailyClosingStock.fulfilled, (state, action) => {
        state.loadingStock = false;
        state.dailyClosingStock = action.payload;
      })

      .addCase(fetchDailyClosingStock.rejected, (state, action) => {
        state.loadingStock = false;

        state.errorStock =
          action.payload?.message ||
          action.payload?.error ||
          action.error?.message ||
          null;
      });

    builder.addCase(fetchStockMovements.pending, (state) => {
        state.loadingMovements = true;
        state.errorMovements = null;
      })

      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.loadingMovements = false;
        state.stockMovements = action.payload;
      })

      .addCase(fetchStockMovements.rejected, (state, action) => {
        state.loadingMovements = false;
        state.errorMovements =
          action.payload ||
          action.payload?.error ||
          action.error ||
          null;
      });

    builder.addCase(fetchStockInventoryKPIs.rejected, (state, action) => {
      state.errorStock = action.payload || "Failed to fetch stock/inventory KPIs!";
      state.errorMovements = action.payload || "Failed to fetch inventory/stock KPIs!";
    });

    builder.addCase(fetchBatchExpiry.pending, (state) => {
        state.loadingBatchExpiry = true;
        state.errorBatchExpiry = null;
      })
      .addCase(fetchBatchExpiry.fulfilled, (state, action) => {
        state.loadingBatchExpiry = false;
        state.batchExpiry = action.payload;
      })
      .addCase(fetchBatchExpiry.rejected, (state, action) => {
        state.loadingBatchExpiry = false;
        state.errorBatchExpiry = action.payload || action.payload?.error || action.error || null;
      });

    builder.addCase(fetchBatchExpiryNeo.pending, (state) => {
        state.loadingBatchExpiryNeo = true;
        state.errorBatchExpiryNeo = null;
      })
      .addCase(fetchBatchExpiryNeo.fulfilled, (state, action) => {
        state.loadingBatchExpiryNeo = false;
        state.batchExpiryNeo = action.payload;
      })
      .addCase(fetchBatchExpiryNeo.rejected, (state, action) => {
        state.loadingBatchExpiryNeo = false;
        state.errorBatchExpiryNeo = action.payload || action.payload?.error || action.error || null;
      });

    builder.addCase(fetchBranches.pending, (state) => {
        state.loadingBranches = true;
        state.errorBranches = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loadingBranches = false;

        const branchList = action.payload?.result || action.payload || [];
        state.branches = branchList.map((branch) => ({
          branchCode: branch.bcode,
          branchName: branch.brancH_NAME,
        }));
        saveCachedBranches(state.branches);
      })

      .addCase(fetchBranches.rejected, (state, action) => {
        state.loadingBranches = false;

        state.errorBranches =
          action.payload ||
          action.error?.message ||
          null;
      });
  },
});

export const { resetInventoryState, setBranch, setDateRange, setStartDate, setEndDate } = StockInventorySlice.actions;

export default StockInventorySlice.reducer;