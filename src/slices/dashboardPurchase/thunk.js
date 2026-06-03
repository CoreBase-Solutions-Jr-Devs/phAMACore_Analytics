import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { getPurchaseOrders as getPurchaseOrdersApi } from "../../helpers/fakebackend_helper";

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