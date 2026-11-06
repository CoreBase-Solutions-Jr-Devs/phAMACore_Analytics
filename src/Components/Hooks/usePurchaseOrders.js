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

  KPIMaverickSpend = [],
  KPIMaverickSpendSummary = [],
  KPIMaverickSpendSupplier = [],
  KPIMaverickSpendBranch = [],
  KPIMaverickSpendOffPOInvoices = [],
  KPIMaverickSpendPOPriceVariance = [],


  KPIPriceAlerts = [],
  KPIPriceAlertsSummary = [],
  KPIPriceAlertsItems = [],
  KPIPriceAlertsHistory = [],

  BestPricePerSupplier = [],

  KPILeadTime = [],
  KPILeadTimeSummary = [],
  KPILeadTimeSupplier = [],
  KPILeadTimePODetails = [],
  KPILeadTimeMonth = [],
  KPILeadTimeBranch = [],

  GoodsReceived = [],
  LastYearGoodsReceived = [],

  ActualSpend = [],
  ActualSpendSummary = [],
  ActualSpendCategory = [],
  ActualSpendSupplier = [],
  ActualSpendBranch = [],
  ActualSpendMonthly = [],
  ActualSpendType = [],

  DailySpend = [],
  DailySpendSummary = [],
  DailySpendCategory = [],
  DailySpendSupplier = [],
  DailySpendBranch = [],
  DailySpendMonthly = [],
  DailySpendType = [],

  LastYearActualSpend = [],
  LastYearActualSpendSummary = [],
  LastYearActualSpendCategory = [],
  LastYearActualSpendSupplier = [],
  LastYearActualSpendBranch = [],
  LastYearActualSpendMonthly = [],
  LastYearActualSpendType = [],

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

    return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
  };
  
const totalSpend = Number(
  KPISummary?.[0]?.gross_purchases_excl || 0
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

const maverickSpendPercentage =
  totalSpend > 0
    ? (maverickSpend / totalSpend) * 100
    : 0;
    
 const leadTimeSummary = KPILeadTimeSummary?.[0] || {};

const avgLeadTime = Number(
  leadTimeSummary.avg_lead_time_days || 0
);
  const branchData = useMemo(() => {
  const grouped = (KPIBranch || []).reduce((acc, item) => {
const group = (item?.branch_name || "UNKNOWN BRANCH")
      .replace(/^AXCESS PHARMACY\s*-\s*/i, "");
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
const spendBySupplier = KPISupplier || [];


  // ============================================================
  // TOP 7 SUPPLIERS
  // ============================================================
  // const topSuppliers = useMemo(() => {

  //   return Object.entries(spendBySupplier)
  //     .sort((a, b) => b[1] - a[1])
  //     .slice(0, 7)
  //     .map(([name, value]) => ({
  //       name,
  //       value,
  //     }));

  // }, [spendBySupplier]);


  // ============================================================
  // TOP 2 SUPPLIERS
  // ============================================================
  // const top2Suppliers = useMemo(() => {

  //   return Object.entries(spendBySupplier)
  //     .sort((a, b) => b[1] - a[1])
  //     .slice(0, 2)
  //     .map(([name, value]) => ({
  //       name,
  //       value,
  //     }));

  // }, [spendBySupplier]);


  // ============================================================
  // BOTTOM 7 SUPPLIERS
  // ============================================================
  // const bottomSuppliers = useMemo(() => {

  //   return Object.entries(spendBySupplier)
  //     .sort((a, b) => a[1] - b[1])
  //     .slice(0, 7)
  //     .map(([name, value]) => ({
  //       name,
  //       value,
  //     }));

  // }, [spendBySupplier]);


  // ============================================================
  // SPEND BY BRANCH
  // Groups purchase-order spend by branch
  // ============================================================
const spendByCategory = KPICategory || [];

const categoryTotals = spendByCategory.reduce(
  (totals, item) => ({
    grossPurchases: totals.grossPurchases + Number(item.gross_purchases_excl || 0),
    purchaseReturns: totals.purchaseReturns + Number(item.purchase_returns_excl || 0),
    netPurchasesIncl: totals.netPurchasesIncl + Number(item.net_purchases_incl || 0),
    uniqueItems: totals.uniqueItems + Number(item.unique_items || 0),
  }),
  {
    grossPurchases: 0,
    purchaseReturns: 0,
    netPurchasesIncl: 0,
    uniqueItems: 0,
  }
);

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

  // const endMonth = endDate.getMonth() + 1;

  // January → selected month
const months = Array.from(
  { length: 12 },
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
const daysInMonth = new Date(
  currentYear,
  currentMonth + 1,
  0
).getDate();

const DAYS = Array.from(
  { length: daysInMonth },
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
 console.log("========== MTD PURCHASES DEBUG ==========");

console.log("Current year:", currentYear);
console.log("Last year:", lastYear);

console.log("GoodsReceived:", GoodsReceived);
console.log("LastYearGoodsReceived:", LastYearGoodsReceived);

console.log("Current year map:", currentYearMap);
console.log("Last year map:", lastYearMap);

console.log("Current year chart data:", DAYS.map(
  (day) => currentYearMap[day]
));

console.log("Last year chart data:", DAYS.map(
  (day) => lastYearMap[day]
));
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
const overdueSupplierAccounts = kpiOverdueAccounts || [];

// Ageing totals
const currentReceivables = overdueSupplierAccounts.reduce(
  (sum, item) => sum + Number(item.current_0_30 || 0),
  0
);

const overdue31To60 = overdueSupplierAccounts.reduce(
  (sum, item) => sum + Number(item.days_31_60 || 0),
  0
);

const overdue61To90 = overdueSupplierAccounts.reduce(
  (sum, item) => sum + Number(item.days_61_90 || 0),
  0
);

const overdue91To120 = overdueSupplierAccounts.reduce(
  (sum, item) => sum + Number(item.days_91_120 || 0),
  0
);

const overdue120Plus = overdueSupplierAccounts.reduce(
  (sum, item) => sum + Number(item.over_120 || 0),
  0
);

const totalPayables = overdueSupplierAccounts.reduce(
  (sum, item) => sum + Number(item.total_balance || 0),
  0
);

// Data for overdue supplier table
// const overdueSupplierAccounts = overdue
//   .slice()
//   .sort(
//     (a, b) =>
//       Number(b.total_balance || 0) -
//       Number(a.total_balance || 0)
//   )
//   .slice(0, 5)
//   .map((item) => ({
//     supplier: item.cusname,
//  cuscode: item.cuscode,
//     outstanding: Number(item.total_balance || 0),

//     lastInvoice: item.last_invoice_date,

//     ageing: {
//       current: Number(item.current_0_30 || 0),
//       days31To60: Number(item.days_31_60 || 0),
//       days61To90: Number(item.days_61_90 || 0),
//       days91To120: Number(item.days_91_120 || 0),
//       over120: Number(item.over_120 || 0),
//     },

//     lastPayment: item.last_payment_date,

//     action: item.action_insight,
//   }));

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
 
    totalSpend,
    activeSuppliers,
    avgLeadTime,
    
    spendBySupplier,
  
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
      categoryTotals,
  };
};

export default usePurchaseOrders;