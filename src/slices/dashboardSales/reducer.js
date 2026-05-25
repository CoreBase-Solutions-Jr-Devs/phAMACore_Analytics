import { createSlice } from "@reduxjs/toolkit";
import { getSalesTransactions } from "./thunk";

  const formatDMY = (date) =>
  date.toLocaleDateString("en-GB");
  
const initialState = {
  sales: [],
  loading: false,
  error: null,

  filters: {
    branch: "All Branches",
    dateRange: "Today",
   startDate: new Date().toLocaleDateString("en-GB"),
endDate: new Date().toLocaleDateString("en-GB"),
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
  // DO NOT reset dates
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
      .addCase(getSalesTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getSalesTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload?.result || action.payload || [];
      })

      .addCase(getSalesTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.error.message || "Error loading data";
      });
  },
});

export const {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} = powerBISlice.actions;

export default powerBISlice.reducer;