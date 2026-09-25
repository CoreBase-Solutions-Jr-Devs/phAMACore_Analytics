import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
  getPurchaseOrders as getPurchaseOrdersApi,
  getActualSpend as getActualSpendApi,
  getDailySpend as getDailySpendApi,
  getKPIPurchases as getKPIPurchasesApi,
  getLastYearActualSpend as getLastYearActualSpendApi,
  getLastYearDailySpend as getLastYearDailySpendApi,
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

// KPI PURCHASES
export const getKPIPurchases = createAsyncThunk(
  "powerbi/getKPIPurchases",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPIPurchasesApi(params);

      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ACTUAL SPEND
export const getActualSpend = createAsyncThunk(
  "powerbi/getActualSpend",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getActualSpendApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch actual spend", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  }
);

// LAST YEAR ACTUAL SPEND
export const getLastYearActualSpend = createAsyncThunk(
  "powerbi/getLastYearActualSpend",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLastYearActualSpendApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch last year actual spend", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  }
);

// DAILY SPEND
export const getDailySpend = createAsyncThunk(
  "powerbi/getDailySpend",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getDailySpendApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch daily spend", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  }
);

// LAST YEAR DAILY SPEND
export const getLastYearDailySpend = createAsyncThunk(
  "powerbi/getLastYearDailySpend",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLastYearDailySpendApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch last year daily spend", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  }
);