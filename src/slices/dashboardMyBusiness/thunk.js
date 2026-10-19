import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getInventoryProfitSummaryUser as getInventoryProfitSummaryUserApi,
  getAccountBalance as getAccountBalanceApi,
  getCashbookSummary as getCashbookSummaryApi,
  getKPIPurchases as getKPIPurchasesApi,
  getKPISalesTransactions as getKPISalesTransactionsApi,
  getKPITotalStockValueByBranch as getKPITotalStockValueByBranchApi,
} from "../../helpers/fakebackend_helper";
import { getMonthlyRanges, parseApiDate } from "../../pages/utils/dateHelper";
import { toList, pick, num, metric } from "../../pages/utils/apiRow";

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

/**
 * MONTHLY TREND for the Revenue, Stock/Purchases and Sales/Collections charts.
 * One bucket per calendar month inside the filter range, so Month to Date
 * needs a single month of data instead of every month of the year.
 */
export const fetchMonthlyTrend = createAsyncThunk(
  "dashboardMyBusiness/fetchMonthlyTrend",
  async ({ startDate, endDate, branch = null } = {}, { rejectWithValue }) => {
    try {
      const months = getMonthlyRanges(startDate, endDate);
      const branchcode = branch ?? 0;
      const rangeStart = months[0].startDate;
      const rangeEnd = months[months.length - 1].endDate;
      const optional = (promise) => promise.then(toList).catch(() => null);

      const [sales, cashbook, purchases, stock] = await Promise.all([
        Promise.all(months.map((m) =>
          getInventoryProfitSummaryUserApi({
            clientid: 1, StartDate: m.startDate, EndDate: m.endDate, branchcode, GroupBy: "BRANCH",
          }).then(toList)
        )),
        Promise.all(months.map((m) => optional(
          getCashbookSummaryApi({
            clientid: 1, StartDate: m.startDate, EndDate: m.endDate, branchcode, GroupBy: "SUMMARY",
          })
        ))),
        optional(getKPIPurchasesApi({
          clientid: 1, startDate: rangeStart, endDate: rangeEnd, branchcode, GroupBy: "MONTHLY",
        })),
        optional(getKPITotalStockValueByBranchApi({ clientid: 1, whichcost: 1, branchcode })),
      ]);

      // Stock value is a live figure: the API has no month-end history,
      // so it is only plotted on the month that contains today.
      const stockRows = stock || [];
      const consolidated = stockRows.find((r) => Number(pick(r, "branch_id")) === 0);
      const stockValue = stockRows.length
        ? num(pick(consolidated, "total_stock_value")) ||
          stockRows.reduce((sum, r) => sum + num(pick(r, "total_stock_value")), 0)
        : null;
      const today = new Date();
      const isCurrent = (m) => parseApiDate(m.startDate) <= today && today <= parseApiDate(m.endDate);
      const sum = (rows, ...fields) => rows.reduce((total, r) => total + num(pick(r, ...fields)), 0);

      return {
        stockAsOf: pick(stockRows[0], "as_of_date") ?? null,
        months: months.map((m, i) => {
          const rows = branch
            ? sales[i].filter((r) => String(pick(r, "BranchCode")) === String(branch))
            : sales[i];
          const bought = (purchases || []).find((r) => pick(r, "year_month") === m.key);
          const revenue = sum(rows, "SalesValueExcl");
          const cost = sum(rows, "CostValue");

          return {
            ...m,
            revenue,
            cost,
            grossProfit: revenue - cost,
            units: sum(rows, "UnitsSold"),
            collections: cashbook[i] ? metric(cashbook[i], "Total Collections") : null,
            purchases: purchases ? num(pick(bought, "net_purchases_excl")) : null,
            stockValue: isCurrent(m) ? stockValue : null,
          };
        }),
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Failed to fetch monthly trend"
      );
    }
  }
);

// SALES BY TRANSACTION TYPE (Sales Composition + VAT Breakdown share this one call)
export const fetchSalesByType = createAsyncThunk(
  "dashboardMyBusiness/fetchSalesByType",
  async ({ startDate, endDate, branch = null } = {}, { rejectWithValue }) => {
    try {
      const params = { clientid: 1, startDate, endDate, GroupBy: "TYPE" };
      if (branch) params.branchcode = branch;
      return toList(await getKPISalesTransactionsApi(params));
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Failed to fetch sales by type"
      );
    }
  }
);

// Aliases for fetch naming convention
export const fetchInventoryProfitSummaryUser = getInventoryProfitSummaryUser;
export const fetchAccountBalance = getAccountBalance;
export const fetchCashbookSummary = getCashbookSummary;
