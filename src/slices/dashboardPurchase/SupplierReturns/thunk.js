import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
  getKPISupplierReturns as getKPISupplierReturnsApi,
} from "../../../helpers/fakebackend_helper";

export const getKPISupplierReturns = createAsyncThunk(
  "powerbi/getKPISupplierReturns",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPISupplierReturnsApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch purchase orders", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  },
);


