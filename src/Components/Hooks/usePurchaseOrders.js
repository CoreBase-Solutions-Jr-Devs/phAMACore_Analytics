import { useMemo } from "react";
const usePurchaseOrders = (
  PurchaseOrders = [],

  KPIPurchases = [],
  KPISummary = [],
  KPICategory = [],
  KPISupplier = [],
  KPIBranch = [],
  KPIMonthly = [],
  KPIType = [],

  // Maverick Spend
  KPIMaverickSpend = [],
  KPIMaverickSpendSummary = [],
  KPIMaverickSpendSupplier = [],
  KPIMaverickSpendBranch = [],
  KPIMaverickSpendOffPOInvoices = [],
  KPIMaverickSpendPOPriceVariance = [],

  // Price Change Alerts
  KPIPriceAlerts = [],
  KPIPriceAlertsSummary = [],
  KPIPriceAlertsItems = [],
  KPIPriceAlertsHistory = [],

  // Best Price Per Supplier
  BestPricePerSupplier = [],

  // Lead Time
  KPILeadTime = [],
  KPILeadTimeSummary = [],
  KPILeadTimeSupplier = [],
  KPILeadTimePODetails = [],
  KPILeadTimeMonth = [],
  KPILeadTimeBranch = [],

  // Goods Received
  GoodsReceived = [],
  LastYearGoodsReceived = [],

  // Actual Spend
  ActualSpend = [],
  ActualSpendSummary = [],
  ActualSpendCategory = [],
  ActualSpendSupplier = [],
  ActualSpendBranch = [],
  ActualSpendMonthly = [],
  ActualSpendType = [],

  // Daily Spend
  DailySpend = [],
  DailySpendSummary = [],
  DailySpendCategory = [],
  DailySpendSupplier = [],
  DailySpendBranch = [],
  DailySpendMonthly = [],
  DailySpendType = [],

  // Last Year Actual Spend
  LastYearActualSpend = [],
  LastYearActualSpendSummary = [],
  LastYearActualSpendCategory = [],
  LastYearActualSpendSupplier = [],
  LastYearActualSpendBranch = [],
  LastYearActualSpendMonthly = [],
  LastYearActualSpendType = [],

  // Last Year Daily Spend
  LastYearDailySpend = [],
  LastYearDailySpendSummary = [],
  LastYearDailySpendCategory = [],
  LastYearDailySpendSupplier = [],
  LastYearDailySpendBranch = [],
  LastYearDailySpendMonthly = [],
  LastYearDailySpendType = [],

  kpiOverdueAccounts = [],
  filters = {}
) => {

  // ============================================================
  // FORMAT AMOUNT
  // Converts large numbers into K, M, or B format
  // Example:
  // 1,500      -> 1.5K
  // 1,500,000  -> 1.5M
  // 1,500,000,000 -> 1.5B
  // ============================================================
  const formatAmount = (value) => {
    if (value === null || value === undefined) return "0";

    const abs = Math.abs(value);

    if (abs >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + "B";
    }

    if (abs >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + "M";
    }

    if (abs >= 1_000) {
      return (value / 1_000).toFixed(1) + "K";
    }

    return value % 1 === 0
      ? value.toFixed(0)
      : value.toFixed(2);
  };


  // ============================================================
 // ============================================================
// TOTAL SPEND & ACTIVE SUPPLIERS
// Values come directly from the KPI API.
// No calculations are performed in the frontend.
// ============================================================




// ============================================================
// SUMMARY
// ============================================================

const totalSpend = Number(
  KPISummary?.[0]?.net_purchases_incl || 0
);

const activeSuppliers = Number(
  KPISummary?.[0]?.unique_suppliers || 0
);





  // ============================================================
  // AVERAGE LEAD TIME
  //
  // Lead time is calculated as:
  //
  // expected date - LPO date
  //
  // We calculate it once per LPO so duplicate rows
  // belonging to the same LPO do not affect the average.
  // ============================================================
  const priceAlertSummary = KPIPriceAlertsSummary?.[0] || {};

const priceAlerts = Number(
  priceAlertSummary.alert_items_count || 0
);

const maverickSpendSummary = KPIMaverickSpendSummary?.[0] || {};

const maverickSpend = Number(
  maverickSpendSummary.maverick_off_po_spend || 0
);

const maverickSpendPercentage = Number(
  maverickSpendSummary.maverick_spend_perc || 0
);
 const leadTimeSummary = KPILeadTimeSummary?.[0] || {};

const avgLeadTime = Number(
  leadTimeSummary.avg_lead_time_days || 0
);
  const branchData = useMemo(() => {
  const grouped = (KPIBranch || []).reduce((acc, item) => {
    const group = item?.branch_name || "Unknown";
    const spend = Number(item?.net_purchases_incl || 0);

    if (!acc[group]) {
      acc[group] = 0;
    }

    acc[group] += spend;

    return acc;
  }, {});

  console.log("Spend by Branch:", grouped);
  console.log("Total Spend:", totalSpend);

  const amounts = Object.values(grouped);

  return {
    categories: Object.keys(grouped),

    // Percentage of total spend
    series: amounts.map((spend) =>
      totalSpend > 0
        ? (spend / totalSpend) * 100
        : 0
    ),

    // Actual spend values
    amounts: amounts,
  };
}, [KPIBranch, totalSpend]);

  // ============================================================
  // SPEND BY SUPPLIER
  // Groups purchase-order spend by supplier
  // ============================================================
const spendBySupplier = useMemo(() => {
  return (KPISupplier || [])
    .filter(Boolean)
    .reduce((acc, item) => {
      const supplier = item?.supplier_name || "Unknown";
      const value = Number(item?.net_purchases_incl || 0);

      acc[supplier] = value;

      return acc;
    }, {});
}, [KPISupplier]);


  // ============================================================
  // TOP 7 SUPPLIERS
  // ============================================================
  const topSuppliers = useMemo(() => {

    return Object.entries(spendBySupplier)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value]) => ({
        name,
        value,
      }));

  }, [spendBySupplier]);


  // ============================================================
  // TOP 2 SUPPLIERS
  // ============================================================
  const top2Suppliers = useMemo(() => {

    return Object.entries(spendBySupplier)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name, value]) => ({
        name,
        value,
      }));

  }, [spendBySupplier]);


  // ============================================================
  // BOTTOM 7 SUPPLIERS
  // ============================================================
  const bottomSuppliers = useMemo(() => {

    return Object.entries(spendBySupplier)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 7)
      .map(([name, value]) => ({
        name,
        value,
      }));

  }, [spendBySupplier]);


  // ============================================================
  // SPEND BY BRANCH
  // Groups purchase-order spend by branch
  // ============================================================
const spendByCategory = useMemo(() => {
  console.log("KPICategory:", KPICategory);

  const grouped = (KPICategory || [])
    .filter(Boolean)
    .reduce((acc, item) => {
      const name = item?.item_group || "Unknown";
      const value = Number(item?.net_purchases_incl || 0);

      if (!acc[name]) {
        acc[name] = 0;
      }

      acc[name] += value;

      return acc;
    }, {});
  const data = Object.entries(grouped)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value) // highest first
    .slice(0, 5); // top 5

  console.log("SpendByCategory:", data);

  return data;
}, [KPICategory]);



  // ============================================================
  // YEAR-TO-DATE ACTUAL SPEND CHART
  //
  // Creates monthly spend from January
  // up to the current month.
  // ============================================================
const actualSpendChart = useMemo(() => {
  const now = new Date();

  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;

  // Use selected end date if available
  let endDate = now;

  if (filters?.endDate) {
    const [day, month, year] = filters.endDate.split("/").map(Number);
    endDate = new Date(year, month - 1, day);
  }

  const endMonth = endDate.getMonth() + 1;

  // January → selected month
  const months = Array.from(
    { length: endMonth },
    (_, i) =>
      new Date(2000, i, 1).toLocaleString("en-US", {
        month: "short",
      })
  );

  const currentYearMap = Object.fromEntries(
    months.map((month) => [month, 0])
  );

  const lastYearMap = Object.fromEntries(
    months.map((month) => [month, 0])
  );

  // =========================
  // CURRENT YEAR
  // =========================

  (ActualSpendMonthly || []).forEach((item) => {
    if (!item?.year || !item?.month) return;

    if (Number(item.year) !== currentYear) return;

    const monthIndex = Number(item.month) - 1;

    const month = new Date(2000, monthIndex, 1).toLocaleString(
      "en-US",
      {
        month: "short",
      }
    );

    const spend = Number(item.net_purchases_incl || 0);

    if (currentYearMap[month] !== undefined) {
      currentYearMap[month] += spend;
    }
  });

  // =========================
  // LAST YEAR
  // =========================

  (LastYearActualSpendMonthly || []).forEach((item) => {
    if (!item?.year || !item?.month) return;

    if (Number(item.year) !== lastYear) return;

    const monthIndex = Number(item.month) - 1;

    const month = new Date(2000, monthIndex, 1).toLocaleString(
      "en-US",
      {
        month: "short",
      }
    );

    const spend = Number(item.net_purchases_incl || 0);

    if (lastYearMap[month] !== undefined) {
      lastYearMap[month] += spend;
    }
  });

  console.log("ActualSpendMonthly:", ActualSpendMonthly);
  console.log(
    "LastYearActualSpendMonthly:",
    LastYearActualSpendMonthly
  );

  console.log("Current Year Map:", currentYearMap);
  console.log("Last Year Map:", lastYearMap);

  return {
    categories: months,

    series: [
      {
        name: `${currentYear}`,
        data: months.map((month) =>
          Number(currentYearMap[month] || 0)
        ),
      },
      {
        name: `${lastYear}`,
        data: months.map((month) =>
          Number(lastYearMap[month] || 0)
        ),
      },
    ],
  };
}, [
  ActualSpendMonthly,
  LastYearActualSpendMonthly,
  filters,
  
]);


  // ============================================================
  // MONTH-TO-DATE SPEND CHART
  //
  // Creates daily spend from the first day
  // of the current month up to today.
  // ============================================================
const monthToDateChart = useMemo(() => {
  const now = new Date();

  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;

  const currentMonth = now.getMonth();
  const today = now.getDate();

  // Days 1 -> today
  const DAYS = Array.from(
    { length: today },
    (_, i) => i + 1
  );

  // Maps for current year and last year
  const currentYearMap = DAYS.reduce((acc, day) => {
    acc[day] = 0;
    return acc;
  }, {});

  const lastYearMap = DAYS.reduce((acc, day) => {
    acc[day] = 0;
    return acc;
  }, {});

  // =========================
  // CURRENT YEAR
  // =========================
  (GoodsReceived || []).forEach((item) => {
    if (!item?.received_date) return;

    const date = new Date(item.received_date);

    if (
      date.getFullYear() !== currentYear ||
      date.getMonth() !== currentMonth
    ) {
      return;
    }

    const day = date.getDate();

    if (currentYearMap[day] !== undefined) {
      currentYearMap[day] += Number(
        item?.total_grn_value || 0
      );
    }
  });

  // =========================
  // LAST YEAR
  // =========================
  (LastYearGoodsReceived || []).forEach((item) => {
    if (!item?.received_date) return;

    const date = new Date(item.received_date);

    if (
      date.getFullYear() !== lastYear ||
      date.getMonth() !== currentMonth
    ) {
      return;
    }

    const day = date.getDate();

    if (lastYearMap[day] !== undefined) {
      lastYearMap[day] += Number(
        item?.total_grn_value || 0
      );
    }
  });

  return {
    categories: DAYS.map(String),

    series: [
      {
        name: `${currentYear}`,
        data: DAYS.map(
          (day) => Number(currentYearMap[day] || 0)
        ),
      },
      {
        name: `${lastYear}`,
        data: DAYS.map(
          (day) => Number(lastYearMap[day] || 0)
        ),
      },
    ],
  };
}, [GoodsReceived, LastYearGoodsReceived]);


  // ============================================================
  // OVERDUE ACCOUNTS
  //
  // Groups purchase orders by supplier and calculates:
  // - Total amount
  // - Earliest due date
  // - Worst overdue value
  // ============================================================
const overdue = kpiOverdueAccounts || [];

// Ageing totals
const currentReceivables = overdue.reduce(
  (sum, item) => sum + Number(item.current_0_30 || 0),
  0
);

const overdue31To60 = overdue.reduce(
  (sum, item) => sum + Number(item.days_31_60 || 0),
  0
);

const overdue61To90 = overdue.reduce(
  (sum, item) => sum + Number(item.days_61_90 || 0),
  0
);

const overdue91To120 = overdue.reduce(
  (sum, item) => sum + Number(item.days_91_120 || 0),
  0
);

const overdue120Plus = overdue.reduce(
  (sum, item) => sum + Number(item.over_120 || 0),
  0
);

const totalPayables = overdue.reduce(
  (sum, item) => sum + Number(item.total_balance || 0),
  0
);

// Data for overdue supplier table
const overdueSupplierAccounts = overdue
  .slice()
  .sort(
    (a, b) =>
      Number(b.total_balance || 0) -
      Number(a.total_balance || 0)
  )
  .slice(0, 5)
  .map((item) => ({
    supplier: item.cusname,
 cuscode: item.cuscode,
    outstanding: Number(item.total_balance || 0),

    lastInvoice: item.last_invoice_date,

    ageing: {
      current: Number(item.current_0_30 || 0),
      days31To60: Number(item.days_31_60 || 0),
      days61To90: Number(item.days_61_90 || 0),
      days91To120: Number(item.days_91_120 || 0),
      over120: Number(item.over_120 || 0),
    },

    lastPayment: item.last_payment_date,

    action: item.action_insight,
  }));

const bestPriceData = BestPricePerSupplier || [];

const bestPricePerSupplier = bestPriceData
  .map((item) => ({
    itemCode: item.item_code,
    itemName: item.item_name,
    supplierName: item.supplier_name,
    bestUnitPrice: Number(item.best_unit_price || 0),
    latestUnitPrice: Number(item.latest_unit_price || 0),
    priceRank: Number(item.price_rank || 0),
    totalSuppliers: Number(item.total_suppliers_for_item || 0),
    premiumPercentage: Number(item.premium_over_best_perc || 0),
    quantityPurchased: Number(item.total_pieces_purchased || 0),
    totalSpend: Number(item.total_spend_exc || 0),
    potentialSavings: Number(item.potential_savings_realizable || 0),
    priceStatus: item.price_status,
    lastPurchasedDate: item.last_purchased_date,
    actionInsight: item.action_insight,
  }))
  .sort((a, b) => b.premiumPercentage - a.premiumPercentage)
  .slice(0, 10);
  // ============================================================
  // RETURN ALL CALCULATED VALUES
  // ============================================================
  return {
    formatAmount,
    totalSpend,
    activeSuppliers,
    avgLeadTime,
    bottomSuppliers,
    spendBySupplier,
    topSuppliers,
    top2Suppliers,
    branchData,
    priceAlerts,
    maverickSpendPercentage,
    maverickSpend,
    actualSpendChart,
    overdueSupplierAccounts,
    monthToDateChart,
    currentReceivables,
    overdue31To60,
    overdue61To90,
    overdue91To120,
    overdue120Plus,
    bestPricePerSupplier,
    // OverdueAccounts,
    spendByCategory,
  };
};

export default usePurchaseOrders;