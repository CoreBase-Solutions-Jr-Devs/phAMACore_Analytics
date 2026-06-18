import { createSlice } from "@reduxjs/toolkit";
import { fetchBatchExpiry, fetchBatchExpiryNeo, fetchDailyClosingStock, fetchStockInventoryKPIs, fetchStockMovements } from './thunk';

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
  errorStock: null,
  errorMovements: null,
  errorBatchExpiry: null,
  errorBatchExpiryNeo: null,
  filters: {
    branch: null,
    dateRange: "Today",
    startDate: formatDMY(new Date()),
    endDate: formatDMY(new Date()),
  }
};

const StockInventorySlice = createSlice({
  name: 'StockInventory',
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
          const y = new Date();
          y.setDate(y.getDate() - 1);

          state.filters.startDate = formatDMY(y);
          state.filters.endDate = formatDMY(y);
          break;
        }

        case "Last 7 Days": {
          const end = new Date();
          const start = new Date();

          start.setDate(end.getDate() - 7);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(end);
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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDailyClosingStock.pending, (state) => {
      state.loadingStock= true;
      state.errorStock = null;
    });
    builder.addCase(fetchDailyClosingStock.fulfilled, (state, action) => {
      state.loadingStock = false;
      state.dailyClosingStock = action.payload;
    });
    builder.addCase(fetchDailyClosingStock.rejected, (state, action) => {
      state.loadingStock = false;
      state.errorStock = action.payload?.message || action.payload?.error || action.error?.message || null;
    });


    builder.addCase(fetchStockMovements.pending, (state) => {
      state.loadingMovements = true;
      state.errorMovements = null;
    });
    builder.addCase(fetchStockMovements.fulfilled, (state, action) => {
      state.loadingMovements = false;
      state.stockMovements = action.payload;
    });
    builder.addCase(fetchStockMovements.rejected, (state, action) => {
      state.loadingMovements = false;
      state.errorMovements = action.payload || action.payload.error || action.error || null;
    });


    builder.addCase(fetchStockInventoryKPIs.rejected, (state, action) => {
      state.errorStock = action.payload || "Failed to fetch stock/inventory KPIs!";
      state.errorMovements = action.payload || "Failed to fetch inventory/stock KPIs!";
    });


    builder.addCase(fetchBatchExpiry.pending, (state) => {
      state.loadingBatchExpiry= true;
      state.errorBatchExpiry = null;
    });
    builder.addCase(fetchBatchExpiry.fulfilled, (state, action) => {
      state.loadingBatchExpiry = false;
      state.batchExpiry = action.payload;
    });
    builder.addCase(fetchBatchExpiry.rejected, (state, action) => {
      state.loadingBatchExpiry = false;
      state.errorBatchExpiry = action.payload || action.payload.error || action.error || null;
    });


    builder.addCase(fetchBatchExpiryNeo.pending, (state) => {
      state.loadingBatchExpiryNeo = true;
      state.errorBatchExpiryNeo = null;
    });
    builder.addCase(fetchBatchExpiryNeo.fulfilled, (state, action) => {
      state.loadingBatchExpiryNeo = false;
      state.batchExpiryNeo = action.payload;
      // console.log("Payload", action.payload);
    });
    builder.addCase(fetchBatchExpiryNeo.rejected, (state, action) => {
      state.loadingBatchExpiryNeo = false;
      state.errorBatchExpiryNeo = action.payload || action.payload.error || action.error || null;
    });
  }
});

export const { 
  resetInventoryState, setBranch, setDateRange, 
  setStartDate, setEndDate 
} = StockInventorySlice.actions;

export default StockInventorySlice.reducer;