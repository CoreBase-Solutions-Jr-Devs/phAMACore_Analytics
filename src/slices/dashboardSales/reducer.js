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

      // LOADING
      .addCase(getSalesTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // SUCCESS
      .addCase(getSalesTransactions.fulfilled, (state, action) => {
        state.loading = false;

        // CLEAN DATA ASSIGNMENT
        state.sales = action.payload;
      })

      // ERROR
      .addCase(getSalesTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default powerBISlice.reducer;