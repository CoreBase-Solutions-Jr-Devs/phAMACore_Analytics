
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
   getMarginAnalysis as getMarginAnalysisApi, 
} from "../../../helpers/fakebackend_helper";

export const getMarginAnalysis = createAsyncThunk(
  "powerbi/getMarginAnalysis",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getMarginAnalysisApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch best price per supplier", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  },
);