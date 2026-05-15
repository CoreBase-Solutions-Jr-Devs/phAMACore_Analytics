import { createSlice } from "@reduxjs/toolkit";
import { getSalesTransactions } from "./thunk";

const initialState = {
  sales: [],
  loading: false,
  error: null,
};

const powerBISlice = createSlice({
  name: "powerbi",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      
      .addCase(getSalesTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getSalesTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })

      .addCase(getSalesTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; // CRM style fallback
      });
  },
});

export default powerBISlice.reducer;