
import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
  getSalesTarget as getSalesTargetApi,
} from "../../../helpers/fakebackend_helper.js";

const fetchSalesTarget = async (params, { rejectWithValue }) => {
  try {
    const response = await getSalesTargetApi(params);
    return response.data || response;
  } catch (error) {
    toast.error("Failed to fetch sales targets", {
      autoClose: 3000,
    });

    return rejectWithValue(
      error.message || "Failed to fetch sales targets"
    );
  }
};

// General sales target
export const getSalesTarget = createAsyncThunk(
  "powerbi/getSalesTarget",
  fetchSalesTarget
);

// July
export const getJulySalesTarget = createAsyncThunk(
  "powerbi/getJulySalesTarget",
  fetchSalesTarget
);

// August
export const getAugustSalesTarget = createAsyncThunk(
  "powerbi/getAugustSalesTarget",
  fetchSalesTarget
);

// September
export const getSeptemberSalesTarget = createAsyncThunk(
  "powerbi/getSeptemberSalesTarget",
  fetchSalesTarget
);

// October
export const getOctoberSalesTarget = createAsyncThunk(
  "powerbi/getOctoberSalesTarget",
  fetchSalesTarget
);
