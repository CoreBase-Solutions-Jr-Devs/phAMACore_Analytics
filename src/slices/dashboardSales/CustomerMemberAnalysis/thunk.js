
import { createAsyncThunk } from "@reduxjs/toolkit";
import {

   getCustomerMemberAnalysis as getCustomerMemberAnalysisApi,
 
} from "../../../helpers/fakebackend_helper";
export const getCustomerMemberAnalysis = createAsyncThunk(
  "powerbi/getCustomerMemberAnalysis",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getCustomerMemberAnalysisApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch best price per supplier", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  },
);