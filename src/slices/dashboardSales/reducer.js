import { createSlice } from "@reduxjs/toolkit";
import { getSalesTransactions } from "./thunk";
import {
  getTodayApi,
  getYesterdayApi,
  getLast7DaysApi,
} from "../../pages/utils/dateHelper";
const today = getTodayApi();
 
const initialState = {
  sales: [],
  loading: false,
  error: null,

filters: {
  branch: "All Branches",
  dateRange: "Today",
  startDate: today,
  endDate: today,
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
      const today = getTodayApi();
      state.filters.startDate = today;
      state.filters.endDate = today;
      break;
    }

    case "Yesterday": {
      const y = getYesterdayApi();
      state.filters.startDate = y;
      state.filters.endDate = y;
      break;
    }

    case "Last 7 Days": {
      const range = getLast7DaysApi();
      state.filters.startDate = range.startDate;
      state.filters.endDate = range.endDate;
      break;
    }

    case "Custom":
   
      break;

    default: {
      const today = getTodayApi();
      state.filters.startDate = today;
      state.filters.endDate = today;
    }
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
      // LOADING
      .addCase(getSalesTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // SUCCESS
      .addCase(getSalesTransactions.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ SAFE RESPONSE HANDLING
        state.sales = action.payload?.result || action.payload || [];
      })

      // ERROR
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