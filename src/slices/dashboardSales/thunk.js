import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { getSalesTransactions as getSalesTransactionsApi } from "../../helpers/fakebackend_helper";

// GET SALES
export const getSalesTransactions = createAsyncThunk(
  "powerbi/getSalesTransactions",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getSalesTransactionsApi(params);

      // IMPORTANT FIX
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch sales transactions", { autoClose: 3000 });
      return rejectWithValue(error.message);
    }
  }
);
