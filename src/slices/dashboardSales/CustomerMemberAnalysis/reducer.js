import { createSlice } from "@reduxjs/toolkit";
import {

  getCustomerMemberAnalysis,

} from "./thunk";

const formatDMY = (date) => date.toLocaleDateString("en-GB");

const initialState = {
 

customerMemberAnalysis: [],
customerMemberAnalysisSummary: [],
customerMemberAnalysisBranch: [],
customerMemberAnalysisCohort: [],
  loading: false,
  error: null,




  loading: false,
  error: null,

  filters: {
    branchcode: "",
    dateRange: "Today",
    startDate: new Date().toLocaleDateString("en-GB"),
    endDate: new Date().toLocaleDateString("en-GB"),
   
  },
};

const customerMemberAnalysisSlice = createSlice({
  name: "customerMemberAnalysis",
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

    clearCustomerMemberAnalysisData: () => initialState,
  },

  extraReducers: (builder) => {
    builder

             // ------------------------------------------
      // CUSTOMER MEMBER ANALYSIS
      // ------------------------------------------
      .addCase(getCustomerMemberAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(getCustomerMemberAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      
        const groupBy = action.meta.arg?.groupBy;
        const result = action.payload?.result || action.payload || [];
      
        // Store the latest customer member analysis result
        state.customerMemberAnalysis = result;
      
        switch (groupBy) {
          case "SUMMARY":
            state.customerMemberAnalysisSummary = result;
            break;
      
          case "BRANCH":
            state.customerMemberAnalysisBranch = result;
            break;
      
          case "COHORT":
            state.customerMemberAnalysisCohort = result;
            break;
      
          default:
            break;
        }
      })
      
      .addCase(getCustomerMemberAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          action.error.message ||
          "Error loading customer member analysis";
      })
   
  ;
  },
});

export const {
  setBranch,
  // setBranches,
  setDateRange,
  setStartDate,
  setEndDate,
  clearCustomerMemberAnalysisData,
} = customerMemberAnalysisSlice.actions;

export default customerMemberAnalysisSlice.reducer;
