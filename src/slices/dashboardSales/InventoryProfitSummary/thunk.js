
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
   getInventoryProfitSummary as getInventoryProfitSummaryApi, 
} from "../../../helpers/fakebackend_helper";

export const getMarginAnalysis = createAsyncThunk(
  "powerbi/getMarginAnalysis",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getInventoryProfitSummaryApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch best price per supplier", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  },
);