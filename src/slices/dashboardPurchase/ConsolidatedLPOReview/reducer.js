import { createSlice } from "@reduxjs/toolkit";
import { getKPIConsolidatedLPOReview } from "./thunk";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

const initialState = {
  KPIConsolidatedLPOReview: [],
 KPIConsolidatedLPOReviewConsolidatedList: [],
  KPIConsolidatedLPOReviewSummary: [],
 KPIConsolidatedLPOReviewSupplier: [],
 KPIConsolidatedLPOReviewBranch: [],
  KPIConsolidatedLPOReviewDrilldown: [],

  loading: false,
  error: null,
  filters: {
    branchcode: "",
    dateRange: "Month To Yesterday",
    startDate: formatDMY(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    endDate: formatDMY(new Date(new Date().setDate(new Date().getDate() - 1))),
    // groupBy: "SUMMARY",
    // topN: 0,
  },
};
const ConsolidatedLPOReviewSlice = createSlice({
  name: "consolidatedLPOReview",

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

        case "Month To Yesterday": {
          const today = new Date();

          const start = new Date(today.getFullYear(), today.getMonth(), 1);

          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(yesterday);

          break;
        }

        case "Year To Yesterday": {
          const today = new Date();

          const start = new Date(today.getFullYear(), 0, 1);

          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          state.filters.startDate = formatDMY(start);
          state.filters.endDate = formatDMY(yesterday);

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

    setGroupBy: (state, action) => {
      state.filters.groupBy = action.payload;
    },

    setTopN: (state, action) => {
      state.filters.topN = action.payload;
    },

    clearConsolidatedLPOReviewData: () => initialState,
  },

  extraReducers: (builder) => {
    builder

  
      // ------------------------------------------
      // KPI PURCHASES
      // ------------------------------------------

      .addCase(getKPIConsolidatedLPOReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getKPIConsolidatedLPOReview.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const groupBy = action.meta.arg?.groupBy;

        const result = action.payload?.result || action.payload || [];

        state.KPIConsolidatedLPOReview = result;

        switch (groupBy) {
                 case "CONSOLIDATED_LIST":
            state.KPIConsolidatedLPOReviewConsolidatedList = result;
            break;
             case "SUMMARY":
            state.KPIConsolidatedLPOReviewSummary = result;
            break;
                         case "SUPPLIER":
            state.KPIConsolidatedLPOReviewSupplier = result;
            break;
                         case "BRANCH":
            state.KPIConsolidatedLPOReviewBranch = result;
            break;
                          case "ITEM_DRILLDOWN":
            state.KPIConsolidatedLPOReviewDrilldown = result;
            break;
          default:
            break;
        }
      })

      .addCase(getKPIConsolidatedLPOReview.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading KPI purchases";
      })

;
  },
});

export const {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
  setGroupBy,
  setTopN,
  clearConsolidatedLPOReviewData,
} = ConsolidatedLPOReviewSlice.actions;

export default ConsolidatedLPOReviewSlice.reducer;
