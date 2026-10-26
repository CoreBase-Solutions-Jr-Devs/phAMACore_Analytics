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
import { cleanBranchName } from "../../helpers/branch_helper";
import { toList, pick, num } from "../../pages/utils/apiRow";

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
  async (params = {}, { rejectWithValue }) => {
    try {
      const { clientid = 1, branchcode = 0, startDate, endDate } = params;
      const parsedBranch =
        branchcode !== undefined &&
        branchcode !== null &&
        branchcode !== "" &&
        !Number.isNaN(Number(branchcode)) &&
        Number(branchcode) > 0
          ? Number(branchcode)
          : 0;
      const payload = { clientid, branchcode: parsedBranch };
      if (startDate) payload.startDate = startDate;
      if (endDate) payload.endDate = endDate;

      const response = await getBatchExpiryNeoApi(payload);
      return toList(response);
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

const withCleanBranch = (item, fallbackBranch = {}) => {
  const branchId = pick(item, "branch_id", "branchCode", "bcode") ?? fallbackBranch.branchCode;
  const rawBranch =
    pick(item, "branch_name", "branchName") ||
    fallbackBranch.branchName ||
    (branchId != null ? `Branch ${branchId}` : "");
  return {
    ...item,
    branch_id: branchId,
    branch_name: cleanBranchName(rawBranch),
    total_stock_value: num(
      pick(item, "total_stock_value", "total_stock_value_avgcost", "stock_value", "closing_value")
    ),
  };
};

const fetchStockValuePerBranch = async ({ clientid, whichcost, IncludeBlocked }, getState) => {
  let branchList = getState().StockInventory?.branches || [];
  if (!branchList.length) {
    try {
      const branchesRes = await getBranchesApi({ clientid });
      const rawBranches = toList(branchesRes);
      branchList = rawBranches.map((b) => ({
        branchCode: pick(b, "bcode", "branchCode", "branch_ID", "branch_id"),
        branchName: cleanBranchName(pick(b, "brancH_NAME", "branchName", "branch_name")),
      })).filter((b) => b.branchCode != null);
    } catch (e) {
      branchList = [];
    }
  }

  if (!branchList.length) {
    const fallbackRes = await getKPITotalStockValueByBranchApi({ clientid, whichcost, IncludeBlocked });
    return toList(fallbackRes).map((item) => withCleanBranch(item));
  }

  return Promise.all(
    branchList.map(async (b) => {
      const empty = { branch_id: b.branchCode, branch_name: cleanBranchName(b.branchName), total_stock_value: 0 };
      try {
        const res = await getKPITotalStockValueByBranchApi({ clientid, whichcost, IncludeBlocked, branchcode: b.branchCode });
        const rows = toList(res);
        return rows.length > 0 ? withCleanBranch(rows[0], b) : empty;
      } catch (e) {
        return empty;
      }
    })
  );
};

export const fetchKPITotalStockValueByBranch = createAsyncThunk(
  "stockInventory/fetchKPITotalStockValueByBranch",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      // IncludeBlocked defaults to true: it matches the official valuation report
      // and the figure shown on the My Business dashboard.
      const { clientid = 1, whichcost = 1, IncludeBlocked = true, branchcode = 0 } = params;
      const base = { clientid, whichcost, IncludeBlocked };

      if (branchcode && Number(branchcode) > 0) {
        const response = await getKPITotalStockValueByBranchApi({ ...base, branchcode: Number(branchcode) });
        return toList(response).map((item) => withCleanBranch(item, { branchCode: Number(branchcode) }));
      }

      return await fetchStockValuePerBranch(base, getState);
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
      const { clientid = 1, branchcode = 0, LookbackDays, AsOfDate } = params;
      const payload = {
        clientid,
        branchcode: branchcode && Number(branchcode) > 0 ? Number(branchcode) : 0,
      };
      if (LookbackDays) payload.LookbackDays = LookbackDays;
      if (AsOfDate) payload.AsOfDate = AsOfDate;

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
        branchcode = 0,
        GroupBy = "CRITICAL_STOCKOUTS",
        TopN = 0,
        AsOfDate = null,
      } = params;

      const payload = {
        clientid,
        branchcode: branchcode && Number(branchcode) > 0 ? Number(branchcode) : 0,
        GroupBy,
        TopN,
      };

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

export const fetchKPISlowMovingStock = createAsyncThunk(
  "stockInventory/fetchKPISlowMovingStock",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        clientid = 1,
        branchcode = 0,
        GroupBy = "SLOW_MOVERS",
        TopN = 0,
        LookbackDays = 30,
        AsOfDate = null,
      } = params;

      const payload = {
        clientid,
        branchcode: branchcode && Number(branchcode) > 0 ? Number(branchcode) : 0,
        GroupBy,
        TopN,
        LookbackDays,
      };

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
        "Failed to fetch slow moving stock!"
      );
    }
  }
);


// Branch stock vs demand distortion with the API's own transfer recommendation
export const fetchKPIImbalances = createAsyncThunk(
  "stockInventory/fetchKPIImbalances",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { clientid = 1, branchcode = 0, TopN = 0, LookbackDays = 30, AsOfDate = null } = params;
      const payload = {
        clientid,
        branchcode: branchcode && Number(branchcode) > 0 ? Number(branchcode) : 0,
        GroupBy: "IMBALANCES",
        TopN,
        LookbackDays,
      };
      if (AsOfDate) payload.AsOfDate = AsOfDate;

      const response = await getKPIStockHealthApi(payload);
      const data = response.data ?? response;
      return (Array.isArray(data) ? data : [data]).filter((row) => row && row.item_code);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Failed to fetch branch imbalances!"
      );
    }
  }
);

const calculatePeriodDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const parse = (str) => {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return new Date(`${y}-${m}-${d}`);
    }
    return new Date(str);
  };
  // Inclusive: 01/10 - 11/10 is 11 trading days, not 10
  const diff = parse(endDate) - parse(startDate);
  const days = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(days, 1);
};

export const fetchKPISalesTransactions = createAsyncThunk(
  "stockInventory/fetchKPISalesTransactions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        clientid = 1,
        startDate,
        endDate,
        GroupBy = "BRANCH",
        branchcode = 0,
      } = params;

      const payload = {
        clientid,
        GroupBy,
        branchcode: branchcode && Number(branchcode) > 0 ? Number(branchcode) : 0,
      };

      if (startDate) {
        payload.StartDate = startDate;
      }
      if (endDate) {
        payload.EndDate = endDate;
      }

      const periodDays = calculatePeriodDays(startDate, endDate);

      const response = await getKPISalesTransactionsApi(payload);
      let data = response.data ?? response;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          data = [];
        }
      }

      const rows = Array.isArray(data)
        ? data
        : data?.result
        ? (Array.isArray(data.result) ? data.result : [data.result])
        : [data];

      return {
        data: (rows || []).filter(Boolean),
        periodDays,
      };
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
