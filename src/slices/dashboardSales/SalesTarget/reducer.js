import { createSlice } from "@reduxjs/toolkit";
import {
  getSalesTarget,
  getJulySalesTarget,
  getAugustSalesTarget,
  getSeptemberSalesTarget,
  getOctoberSalesTarget,
} from "./thunk";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

const initialState = {
 

salesTarget: [],
salesTargetSummary: [],
salesTargetBranch: [],

julySalesTarget: [],
augustSalesTarget: [],
septemberSalesTarget: [],
octoberSalesTarget: [],



  loading: false,
  error: null,

  filters: {
    branch: "",
    dateRange: "Today",
    startDate: new Date().toLocaleDateString("en-GB"),
    endDate: new Date().toLocaleDateString("en-GB"),
   
  },
};

const salesTargetSlice = createSlice({
  name: "salesTarget",
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

          const start = new Date(today.getFullYear(), today.getMonth(), 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(today);

          break;
        }

        case "Year To Date": {
          const today = new Date();

          const start = new Date(today.getFullYear(), 0, 1);

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

    clearSalesTargetData: () => initialState,
  },

extraReducers: (builder) => {
  builder
    // General Sales Target
    .addCase(getSalesTarget.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    .addCase(getSalesTarget.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      const groupBy =
        action.meta.arg?.GroupBy ?? action.meta.arg?.groupBy;

      const result = action.payload?.result ?? action.payload ?? [];

      state.salesTarget = result;

      switch (groupBy) {
        case "SUMMARY":
          state.salesTargetSummary = result;
          break;

        case "BRANCH":
          state.salesTargetBranch = result;
          break;

        default:
          break;
      }
    })

    .addCase(getSalesTarget.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.message ||
        action.payload ||
        action.error.message ||
        "Error loading sales targets";
    })

    // July Sales Target
    .addCase(getJulySalesTarget.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getJulySalesTarget.fulfilled, (state, action) => {
      state.loading = false;
      state.julySalesTarget =
        action.payload?.result ?? action.payload ?? [];
    })
    .addCase(getJulySalesTarget.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // August Sales Target
    .addCase(getAugustSalesTarget.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAugustSalesTarget.fulfilled, (state, action) => {
      state.loading = false;
      state.augustSalesTarget =
        action.payload?.result ?? action.payload ?? [];
    })
    .addCase(getAugustSalesTarget.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // September Sales Target
    .addCase(getSeptemberSalesTarget.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getSeptemberSalesTarget.fulfilled, (state, action) => {
      state.loading = false;
      state.septemberSalesTarget =
        action.payload?.result ?? action.payload ?? [];
    })
    .addCase(getSeptemberSalesTarget.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // October Sales Target
    .addCase(getOctoberSalesTarget.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getOctoberSalesTarget.fulfilled, (state, action) => {
      state.loading = false;
      state.octoberSalesTarget =
        action.payload?.result ?? action.payload ?? [];
    })
    .addCase(getOctoberSalesTarget.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });
},
});

export const {
  setBranch,
  // setBranches,
  setDateRange,
  setStartDate,
  setEndDate,
  clearSalesTargetData,
} = salesTargetSlice.actions;

export default salesTargetSlice.reducer;
