import { createSlice } from "@reduxjs/toolkit";
import { fetchBatchExpiry, fetchDailyClosingStock, fetchStockInventoryKPIs, fetchStockMovements } from './thunk';

export const initialState = {
  dailyClosingStock: [],
  stockMovements: [],
  batchExpiry: [],
  loadingStock: false,
  loadingMovements: false,
  loadingBatchExpiry: false,
  errorStock: null,
  errorMovements: null,
  errorBatchExpiry: null,
};

const StockInventorySlice = createSlice({
  name: 'StockInventory',
  initialState,
  reducers: {
    resetInventoryState: () => initialState,
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
      state.errorStock = action.payload || action.payload.error || action.error || null;
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
  }
});

export const { resetInventoryState } = StockInventorySlice.actions;

export default StockInventorySlice.reducer;