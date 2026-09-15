import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSalesTransactions as getSalesTransactionsApi,
  getMonthlySales as getMonthlySalesApi,
  getMonthToDateSales as getMonthToDateApi,
} from "../../helpers/fakebackend_helper";

// MAIN SALES
export const getSalesTransactions = createAsyncThunk(
  "powerbi/getSalesTransactions",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getSalesTransactionsApi(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// MONTHLY CHART
export const getMonthlySales = createAsyncThunk(
  "powerbi/getMonthlySales",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getMonthlySalesApi(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// MONTH TO DATE
export const getMonthToDateSales = createAsyncThunk(
  "powerbi/getMonthToDateSales",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getMonthToDateApi(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);