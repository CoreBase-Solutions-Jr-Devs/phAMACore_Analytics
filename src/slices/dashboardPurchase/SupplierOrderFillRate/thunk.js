import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
  getKPISupplierOrderFillRate as getKPISupplierOrderFillRateApi,
} from "../../../helpers/fakebackend_helper";

export const getKPISupplierOrderFillRate = createAsyncThunk(
  "powerbi/getKPISupplierOrderFillRate",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPISupplierOrderFillRateApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch purchase orders", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  },
);


