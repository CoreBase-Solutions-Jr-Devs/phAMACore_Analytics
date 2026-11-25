import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
 
  getActualSpend as getActualSpendApi,
 
  getKPIPurchases as getKPIPurchasesApi,
  getLastYearActualSpend as getLastYearActualSpendApi,
 
  getKPIMaverickSpend as getKPIMaverickSpendApi,
  getKPIPriceAlerts as getKPIPriceAlertsApi,
  getKPILeadTime as getKPILeadTimeApi,
  getGoodsReceived as getGoodsReceivedApi,

  getLastYearGoodsReceived as getLastYearGoodsReceivedApi,
 
} from "../../helpers/fakebackend_helper";

export const getKPIPurchases = createAsyncThunk(
  "powerbi/getKPIPurchases",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPIPurchasesApi(params);

      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

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
  },
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
  },
);

export const getGoodsReceived = createAsyncThunk(
  "powerbi/getGoodsReceived",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getGoodsReceivedApi(params);
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch goods received", { autoClose: 3000 });
      return rejectWithValue(error.message);
    }
  },
);

export const getLastYearGoodsReceived = createAsyncThunk(
  "powerbi/getLastYearGoodsReceived",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLastYearGoodsReceivedApi(params);
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch last year goods received", { autoClose: 3000 });
      return rejectWithValue(error.message);
    }
  },
);

export const getKPILeadTime = createAsyncThunk(
  "powerbi/getKPILeadTime",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPILeadTimeApi(params);
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch lead time", { autoClose: 3000 });
      return rejectWithValue(error.message);
    }
  },
);

export const getKPIPriceAlerts = createAsyncThunk(
  "powerbi/getKPIPriceAlerts",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPIPriceAlertsApi(params);
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch price alerts", { autoClose: 3000 });
      return rejectWithValue(error.message);
    }
  },
);

export const getKPIMaverickSpend = createAsyncThunk(
  "powerbi/getKPIMaverickSpend",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPIMaverickSpendApi(params);
      return response.data || response;
    } catch (error) {
      toast.error("Failed to fetch maverick spend", { autoClose: 3000 });
      return rejectWithValue(error.message);
    }
  },
);

// export const getBestPricePerSupplier = createAsyncThunk(
//   "powerbi/getBestPricePerSupplier",
//   async (params, { rejectWithValue }) => {
//     try {
//       const response = await getBestPricePerSupplierApi(params);

//       return response.data || response;
//     } catch (error) {
//       toast.error("Failed to fetch best price per supplier", {
//         autoClose: 3000,
//       });

//       return rejectWithValue(error.message);
//     }
//   },
// );

