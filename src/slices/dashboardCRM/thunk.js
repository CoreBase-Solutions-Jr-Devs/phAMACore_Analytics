import { createAsyncThunk } from "@reduxjs/toolkit";
//Include Both Helper File with needed methods
import {
  getDailyClosingStock as getDailyClosingStockApi,
  getStockMovements as getStockMovementsApi,
  getBatchExpiry as getBatchExpiryApi,
  getBatchExpiryNeo as getBatchExpiryNeoApi,
}
  from "../../helpers/fakebackend_helper";

export const fetchDailyClosingStock = createAsyncThunk(
  "stockInventory/fetchDailyClosingStock",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getDailyClosingStockApi(params);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message 
        || error?.response?.data || error.message ||
        "Failed to fetch daily closing stock!");
    }
  }
);

export const fetchStockMovements = createAsyncThunk(
  "stockInventory/fetchStockMovements",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getStockMovementsApi(params);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message 
        || error?.response?.data || error.message ||
        "Failed to fetch stock movements!");
    }
  }
);

export const fetchStockInventoryKPIs = createAsyncThunk(
  "stockInventory/fetchStockInventoryKPIs",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const [stockResult, movementsResult] = await Promise.all(
        [
          dispatch(fetchDailyClosingStock(params)),
          dispatch(fetchStockMovements({
              clientid: params.clientid,
              startDate: params.startDate,
              endDate: params.endDate,
              branchcode: params.branchcode,
              itemcode: params.itemcode,
            })
          ),
        ]);
      return {
        stockData: stockResult.payload,
        movementsData: movementsResult.payload,
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchBatchExpiry = createAsyncThunk(
  "stockInventory/fetchBatchExpireDetails",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getBatchExpiryApi(params);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data || error.message ||
        "Failed to fetch batch expiry data!"
      );
    }
  }
);

export const fetchBatchExpiryNeo = createAsyncThunk(
  "stockInventory/fetchBatchExpireDetailsNeo",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getBatchExpiryNeoApi(params);
      return response.data ?? response;
    }
    catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data || error.message ||
        "Failed to fetch batch expiry data!"
      );
    }
  }
);