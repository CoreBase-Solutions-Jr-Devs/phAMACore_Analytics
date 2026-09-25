import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSalesTransactions as getSalesTransactionsApi,
  getMonthlySales as getMonthlySalesApi,
  getMonthToDateSales as getMonthToDateApi,
  getLastYearMonthToDateSales as getLastYearMonthToDateSalesApi,
  getLastYearMonthlySales as getLastYearMonthlySalesApi,
  getKPISalesTransactions as getKPISalesTransactionsApi,
  getKPIOverdueAccounts as getKPIOverdueAccountsApi,
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
// KPI SALES
export const getKPISalesTransactions = createAsyncThunk(
  "powerbi/getKPISalesTransactions",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPISalesTransactionsApi(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getKPIOverdueAccounts = createAsyncThunk(
  "powerbi/getKPIOverdueAccounts",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPIOverdueAccountsApi(params);
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

// LAST YEAR MONTHLY SALES
export const getLastYearMonthlySales = createAsyncThunk(
  "powerbi/getLastYearMonthlySales",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLastYearMonthlySalesApi(params);
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

// LAST YEAR MONTH TO DATE
export const getLastYearMonthToDateSales = createAsyncThunk(
  "powerbi/getLastYearMonthToDateSales",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLastYearMonthToDateSalesApi(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);