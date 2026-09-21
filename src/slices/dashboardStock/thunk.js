import { createAsyncThunk } from "@reduxjs/toolkit";
//Include Both Helper File with needed methods
import {
  getDailyClosingStock as getDailyClosingStockApi,
  getStockMovements as getStockMovementsApi,
  getBatchExpiry as getBatchExpiryApi,
  getBatchExpiryNeo as getBatchExpiryNeoApi,
  getBranches as getBranchesApi,
  getKPITotalStockValueByBranch as getKPITotalStockValueByBranchApi,
  getKPIStockHealth as getKPIStockHealthApi,
  getKPISalesTransactions as getKPISalesTransactionsApi,
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

export const fetchBranches = createAsyncThunk(
    "stockInventory/fetchBranches",
    async (params, { rejectWithValue }) => {
        try {
            const response = await getBranchesApi(params);
            return response.data ?? response;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message ||
                error.message
            );
        }
    }
);

export const fetchKPITotalStockValueByBranch = createAsyncThunk(
  "stockInventory/fetchKPITotalStockValueByBranch",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const {
        clientid = 1,
        whichcost = 1,
        IncludeBlocked = false,
        branchcode,
      } = params;

      if (branchcode) {
        const response = await getKPITotalStockValueByBranchApi({
          clientid,
          whichcost,
          IncludeBlocked,
          branchcode,
        });
        const data = response.data ?? response;
        return Array.isArray(data) ? data : [data];
      }

      // If branchcode is null/undefined, fetch for all branches to build comparison
      let branchList = getState().StockInventory?.branches || [];
      if (!branchList.length) {
        const branchesRes = await getBranchesApi({ clientid });
        const rawBranches = branchesRes.data?.result || branchesRes.data || [];
        branchList = rawBranches.map((b) => ({
          branchCode: b.bcode ?? b.branchCode ?? b.branch_ID,
          branchName: b.brancH_NAME ?? b.branchName ?? b.branch_name,
        }));
      }

      const results = await Promise.all(
        branchList.map(async (b) => {
          try {
            const res = await getKPITotalStockValueByBranchApi({ clientid, whichcost, IncludeBlocked, branchcode: b.branchCode});
            const data = res.data ?? res;
            if (Array.isArray(data) && data.length > 0) {
              return {
                ...data[0],
                branch_id: b.branchCode,
                branch_name: b.branchName || data[0].branch_name,
              };
            }
            return {
              branch_id: b.branchCode,
              branch_name: b.branchName,
              total_stock_value: 0,
            };
          } catch (e) {
            return {
              branch_id: b.branchCode,
              branch_name: b.branchName,
              total_stock_value: 0,
            };
          }
        })
      );

      return results;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.response?.data ||
        error.message || "Failed to fetch total stock value by branch!"
      );
    }
  }
);

export const fetchKPIStockHealth = createAsyncThunk(
  "stockInventory/fetchKPIStockHealth",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { clientid = 1, branchcode = null } = params;
      const payload = { clientid };
      if (branchcode) {
        payload.branchcode = branchcode;
      }

      const response = await getKPIStockHealthApi(payload);
      const data = response.data ?? response;
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Failed to fetch stock health KPI!"
      );
    }
  }
);

export const fetchKPICriticalStockouts = createAsyncThunk(
  "stockInventory/fetchKPICriticalStockouts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        clientid = 1,
        branchcode = null,
        GroupBy = "CRITICAL_STOCKOUTS",
        TopN = 30,
        AsOfDate = null,
      } = params;

      const payload = {
        clientid,
        GroupBy,
        TopN,
      };

      if (branchcode) {
        payload.branchcode = branchcode;
      }

      if (AsOfDate) {
        // Date format DD/MM/YYYY
        if (typeof AsOfDate === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(AsOfDate)) {
          payload.AsOfDate = AsOfDate;
        } else {
          const d = new Date(AsOfDate);
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            payload.AsOfDate = `${day}/${month}/${year}`;
          } else {
            payload.AsOfDate = AsOfDate;
          }
        }
      }

      const response = await getKPIStockHealthApi(payload);
      const data = response.data ?? response;
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Failed to fetch critical stockouts!"
      );
    }
  }
);

export const fetchKPISalesTransactions = createAsyncThunk(
  "stockInventory/fetchKPISalesTransactions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        clientid = 1,
        startDate,
        endDate,
        GroupBy = "BRANCH",
        branchcode = null,
      } = params;

      const payload = {
        clientid,
        GroupBy,
      };

      if (startDate) {
        payload.StartDate = startDate;
      }
      if (endDate) {
        payload.EndDate = endDate;
      }
      if (branchcode) {
        payload.branchcode = branchcode;
      }

      const response = await getKPISalesTransactionsApi(payload);
      let data = response.data ?? response;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          data = [];
        }
      }
      return Array.isArray(data)
        ? data
        : data?.result
        ? (Array.isArray(data.result) ? data.result : [data.result])
        : [data];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Failed to fetch sales transactions KPI!"
      );
    }
  }
);


