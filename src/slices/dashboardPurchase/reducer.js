import { createSlice } from "@reduxjs/toolkit";
import { getPurchaseOrders, getActualSpend, getDailySpend } from "./thunk";

  const formatDMY = (date) =>
  date.toLocaleDateString("en-GB");
  
const initialState = {
  PurchaseOrders: [],
   ActualSpend: [],
   DailySpend: [],
  loading: false,
  error: null,

  filters: {
    branch: null,
    dateRange: "Today",
   startDate: new Date().toLocaleDateString("en-GB"),
endDate: new Date().toLocaleDateString("en-GB"),
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
    clearPurchaseOrdersData: (state) => {
  state.PurchaseOrders = [];
  // state.monthlySales = [];
  // state.monthToDateSales = [];
  // state.branches = [];
  state.loading = false;
  state.error = null;

  // state.filters = {
  //   branch: null,
  //   dateRange: null,
  //   startDate: null,
  //   endDate: null,
  // };
},
  },

  extraReducers: (builder) => {
    builder
      .addCase(getPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.PurchaseOrders = action.payload?.result || action.payload || [];
      })

         .addCase(getActualSpend.fulfilled, (state, action) => {
        state.loading = false;
        state.ActualSpend = action.payload?.result || action.payload || [];
      })

        .addCase(getDailySpend.fulfilled, (state, action) => {
        state.loading = false;
        state.DailySpend = action.payload?.result || action.payload || [];
      })

      .addCase(getPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.error.message || "Error loading data";
      })

        .addCase(getActualSpend.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.error.message || "Error loading data";
      })

        .addCase(getDailySpend.rejected, (state, action) => {
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
  clearPurchaseOrdersData,
} = PurchaseOrdersSlice.actions;

export default PurchaseOrdersSlice.reducer;