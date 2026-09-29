import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getInventoryProfitSummaryUser as getInventoryProfitSummaryUserApi,
  getAccountBalance as getAccountBalanceApi,
  getCashbookSummary as getCashbookSummaryApi,
} from "../../helpers/fakebackend_helper";

// GET INVENTORY PROFIT SUMMARY USER / METRICS
export const getInventoryProfitSummaryUser = createAsyncThunk(
  "dashboardMyBusiness/getInventoryProfitSummaryUser",
  async (params = { clientid: 1 }, { rejectWithValue }) => {
    try {
      const response = await getInventoryProfitSummaryUserApi(params);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Failed to fetch inventory profit summary"
      );
    }
  }
);

// GET ACCOUNT BALANCE
export const getAccountBalance = createAsyncThunk(
  "dashboardMyBusiness/getAccountBalance",
  async (params = { clientid: 1 }, { rejectWithValue }) => {
    try {
      const response = await getAccountBalanceApi(params);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Failed to fetch account balance"
      );
    }
  }
);

// GET CASHBOOK SUMMARY
export const getCashbookSummary = createAsyncThunk(
  "dashboardMyBusiness/getCashbookSummary",
  async (
    params = {
      clientid: 1,
      GroupBy: "SUMMARY",
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getCashbookSummaryApi(params);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Failed to fetch cashbook summary"
      );
    }
  }
);

// Aliases for fetch naming convention
export const fetchInventoryProfitSummaryUser = getInventoryProfitSummaryUser;
export const fetchAccountBalance = getAccountBalance;
export const fetchCashbookSummary = getCashbookSummary;
