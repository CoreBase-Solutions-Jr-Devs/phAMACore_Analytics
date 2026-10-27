import { createAsyncThunk } from "@reduxjs/toolkit";
import {

  getKPISalesTransactions as getKPISalesTransactionsApi,
 
} from "../../../helpers/fakebackend_helper.js";

export const getKPISalesTransactions = createAsyncThunk(
  "powerbi/getKPISalesTransactions",
  async (params, { rejectWithValue }) => {
    console.log(
      "%c[API THUNK] getKPISalesTransactions",
      "color: red; font-weight: bold;",
      params,
    );

    console.trace("[API THUNK] Dispatch origin");

    try {
      const response = await getKPISalesTransactionsApi(params);

      console.log("[API THUNK] Response", {
        groupBy: params?.groupBy,
        response,
      });

      return response.data || response;
    } catch (error) {
      console.error("[API THUNK] Request failed", {
        params,
        error,
      });

      return rejectWithValue(error.message);
    }
  },
);











