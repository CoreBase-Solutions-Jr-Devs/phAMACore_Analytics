import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
  getPurchaseOrders as getPurchaseOrdersApi, 
  getActualSpend as getActualSpendApi, 
  getDailySpend as getDailySpendApi,
  getBranches as getBranchesApi,
} from "../../helpers/fakebackend_helper";

// GET PURCHASE ORDERS
export const getPurchaseOrders = createAsyncThunk(
  "powerbi/getPurchaseOrders",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getPurchaseOrdersApi(params);
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch purchase orders", {
        autoClose: 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

export const getActualSpend = createAsyncThunk(
  "powerbi/getActualSpend",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getActualSpendApi(params);
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch purchase orders", {
        autoClose: 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

export const getDailySpend = createAsyncThunk(
  "powerbi/getDailySpend",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getDailySpendApi(params);
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch purchase orders", {
        autoClose: 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBranches = createAsyncThunk(
  "powerbi/fetchBranchesPurchase",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getBranchesApi(params);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);