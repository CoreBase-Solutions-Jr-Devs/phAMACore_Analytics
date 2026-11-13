import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
  getKPIBestPricePerSupplier as getKPIBestPricePerSupplierApi,
} from "../../../helpers/fakebackend_helper";

export const getKPIBestPricePerSupplier = createAsyncThunk(
  "powerbi/getKPIBestPricePerSupplier",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPIBestPricePerSupplierApi(params);

      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch Best Price Per Supplier", {
        autoClose: 3000,
      });

      return rejectWithValue(error.message);
    }
  },
);


