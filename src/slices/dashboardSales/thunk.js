import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
  getSalesTransactions as getSalesTransactionsApi,
} from "../../helpers/fakebackend_helper";

// GET SALES
export const getSalesTransactions = createAsyncThunk(
  "powerbi/getSalesTransactions",
  async (params) => {
    try {
      const response = await getSalesTransactionsApi(params);
      return response;
    } catch (error) {
      toast.error("Failed to fetch sales transactions", { autoClose: 3000 });
      return error;
    }
  }
);