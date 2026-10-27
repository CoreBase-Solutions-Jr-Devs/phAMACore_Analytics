import { useMemo } from "react";

const useSalesAnalytics = (
  sales = [],
  kpiOverdueAccounts = [],
  salesType = [],
  salesBranch = [],
  salesBranch_Type = [],
  salesChannel = [],
  salesComparativeYTD = [],
  salesComparativeMTD = [],
  salesMonthly = [],
  salesDaily = [],
  salesSubgroup = [],
  monthlySales = [],
  monthToDateSales = [],
  lastYearMonthToDateSales = [],
  lastYearMonthlySales = [],
  marginAnalysisBand = [],
  marginAnalysisDrilldown = [],
  marginAnalysisSku = [],
  customerMemberAnalysisSummary = [],
  customerMemberAnalysisBranch = [],
  customerMemberAnalysisCohort = [],

  // Monthly Sales Targets
  julySalesTarget = [],
  augustSalesTarget = [],
  septemberSalesTarget = [],
  octoberSalesTarget = [],
  salesTarget= [],
salesTargetSummary= [],
salesTargetBranch= [],
salesTargetMONTHLY_PIVOT= [],
  filters = {},
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

  const totalRevenue = Number(
    salesType.find((item) => item.transaction_type === "TOTAL")
      ?.total_sales_incl ?? 0,
  );
  const cashSales = Number(
    salesType.find((item) => item.transaction_type === "CASHSALE")
      ?.total_sales_incl ?? 0,
  );
  const salesInvoices = Number(
    salesType.find((item) => item.transaction_type === "SALESINVOICE")
      ?.total_sales_incl ?? 0,
  );
  const cashInvoices = Number(
    salesType.find((item) => item.transaction_type === "CASHINVOICE")
      ?.total_sales_incl ?? 0,
  );

  const creditNotes = Number(
    salesBranch.reduce(
      (sum, item) => sum + Number(item.credit_notes_excl ?? 0),
      0,
    ),
  );

  const cashInvoicesPercentage =
    totalRevenue > 0 ? (cashInvoices / totalRevenue) * 100 : 0;

  const salesInvoicesPercentage =
    totalRevenue > 0 ? (salesInvoices / totalRevenue) * 100 : 0;

  const cashSalesPercentage =
    totalRevenue > 0 ? (cashSales / totalRevenue) * 100 : 0;

  const creditNotesPercentage =
    totalRevenue > 0 ? (creditNotes / totalRevenue) * 100 : 0;

  const ordersReceived = new Set(
    sales
      .filter((item) => item.invoice_Number)
      .map((item) => item.invoice_Number),
  ).size;

 const branchData = useMemo(
  () =>
    (Array.isArray(salesBranch) ? salesBranch : []).map((item) => ({
      name: (item.branch_name || "UNKNOWN BRANCH").replace(
        /^AXCESS PHARMACY\s*-\s*/i,
        "",
      ),
      amount: Number(item.net_sales_incl ?? 0),
    })),
  [salesBranch],
);

const branchChartSeries = useMemo(
  () => [
    {
      name: "Revenue",
      data: branchData.map((branch) => branch.amount),
    },
  ],
  [branchData],
);

const branchCategories = useMemo(
  () => branchData.map((branch) => branch.name),
  [branchData],
);

  /* -------------------------------------------------------
   * Revenue grouped by Sales Representative.
   * Used in the Salesman Revenue widget.
   * ------------------------------------------------------*/
  const salesmanTotals = sales.reduce((acc, item) => {
    const rep = item.staff_Name || "UNKNOWN REP";
    const branch = item.brancch_Name || "UNKNOWN BRANCH";
    const revenue = Number(item.revenue || 0);

    const key = `${rep}__${branch}`;

    if (!acc[key]) {
      acc[key] = { rep, branch, revenue: 0 };
    }

    acc[key].revenue += revenue;

    return acc;
  }, {});

  const salesmanData = Object.values(salesmanTotals);

  /* -------------------------------------------------------
   * Top customers ranked by total revenue.
   * ------------------------------------------------------*/
  const customerTotals = sales.reduce((acc, item) => {
    const name = item.client_Name || "UNKNOWN CUSTOMER";
    const branch = item.brancch_Name || "UNKNOWN BRANCH";
    const revenue = Number(item.revenue || 0);

    const key = `${name}__${branch}`;

    if (!acc[key]) {
      acc[key] = { name, branch, revenue: 0 };
    }

    acc[key].revenue += revenue;

    return acc;
  }, {});

  const topCustomersData = Object.values(customerTotals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  const overdue = Array.isArray(kpiOverdueAccounts) ? kpiOverdueAccounts : [];

  const currentReceivables = overdue.reduce(
    (sum, item) => sum + Number(item.current_0_30 || 0),
    0,
  );

  const overdue31To60 = overdue.reduce(
    (sum, item) => sum + Number(item.days_31_60 || 0),
    0,
  );

  const overdue61To90 = overdue.reduce(
    (sum, item) => sum + Number(item.days_61_90 || 0),
    0,
  );

  const overdue91To120 = overdue.reduce(
    (sum, item) => sum + Number(item.days_91_120 || 0),
    0,
  );

  const overdue120Plus = overdue.reduce(
    (sum, item) => sum + Number(item.over_120 || 0),
    0,
  );

  const overdueDebtorsCount = overdue.filter(
    (item) => Number(item.total_balance || 0) > 0,
  ).length;

  const topDebtors = (kpiOverdueAccounts || [])
    .slice()
    .sort((a, b) => Number(b.total_balance ?? 0) - Number(a.total_balance ?? 0))
    .slice(0, 10)
    .map((customer) => ({
      name: customer.cusname,
      amount: Number(customer.total_balance ?? 0),
      actionInsight: customer.action_insight,
    }));

  /* -------------------------------------------------------
   * Top 5 best-selling products.
   * Products are ranked by quantity sold.
   * ------------------------------------------------------*/
  const topProducts = useMemo(() => {
    const totals = {};

    sales.forEach((item) => {
      const key = item.item_Name;

      if (!totals[key]) {
        totals[key] = {
          name: item.item_Name,
          qty: 0,
        };
      }

      totals[key].qty += Number(item.quantity_Sold || 0);
    });

    return Object.values(totals)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        qty: Math.round(item.qty),
      }));
  }, [sales]);

  /* -------------------------------------------------------
   * Monthly Revenue Chart
 
   * ------------------------------------------------------*/
  const monthlyChart = useMemo(() => {
    const data = salesComparativeMTD || [];

    console.log("YTD API Data:", data);

    return {
      categories: data.map((item) => item.month_name),
      series: [
        {
          name: String(data[0]?.current_year ?? ""),
          data: data.map((item) => Number(item.current_year_sales) || 0),
        },
        {
          name: String(data[0]?.prior_year ?? ""),
          data: data.map((item) => Number(item.prior_year_sales) || 0),
        },
      ],
    };
  }, [salesComparativeMTD]);

  /* -------------------------------------------------------
   * Month-to-Date Revenue Chart
   * ------------------------------------------------------*/
  const monthToDateChart = useMemo(() => {
    const data = salesComparativeYTD || [];

    console.log("MTD API Data:", data);

    return {
      categories: data.map((item) => item.day_no),
      series: [
        {
          name: String(data[0]?.curr_date?.slice(0, 4) ?? ""),
          data: data.map((item) => Number(item.current_year_sales) || 0),
        },
        {
          name: String(data[0]?.prior_date?.slice(0, 4) ?? ""),
          data: data.map((item) => Number(item.prior_year_sales) || 0),
        },
      ],
    };
  }, [salesComparativeYTD]);

  const topProductsData = sales.reduce((acc, item) => {
    const name = item.item_Name || "UNKNOWN PRODUCT";

    const qty = Number(item.quantity_Sold || 0);

    if (!acc[name]) {
      acc[name] = {
        name: name,
        qty: 0,
      };
    }

    acc[name].qty += qty;

    return acc;
  }, {});

  const bottomProductsData = sales.reduce((acc, item) => {
    const name = item.item_Name || "UNKNOWN PRODUCT";

    const qty = Number(item.quantity_Sold || 0);

    if (!acc[name]) {
      acc[name] = {
        name: name,
        qty: 0,
      };
    }

    acc[name].qty += qty;

    return acc;
  }, {});

  const bottomProducts = Object.values(bottomProductsData)
    .sort((a, b) => a.qty - b.qty)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      qty: Math.round(item.qty),
    }));

  const marginBands = Array.isArray(marginAnalysisBand)
    ? marginAnalysisBand
    : [];

  const getMarginBand = (band) => {
    const item = marginBands.find((item) => item.margin_band === band);

    return {
      margin_band: band,
      sales_value_kes: Number(item?.sales_value_kes ?? 0),
      sales_share_perc: Number(item?.sales_share_perc ?? 0),
      gross_profit_kes: Number(item?.gross_profit_kes ?? 0),
      band_gross_margin_perc: Number(item?.band_gross_margin_perc ?? 0),
      action_insight: item?.action_insight ?? "",
    };
  };

  const marginBand25 = getMarginBand("<25%");
  const marginBand25To30 = getMarginBand("25% to 30%");
  const marginBand30To45 = getMarginBand("30% to 45%");
  const marginBandAbove45 = getMarginBand(">45%");

  // Margin Analysis — Drilldown response
  const marginDrilldown = Array.isArray(marginAnalysisDrilldown)
    ? marginAnalysisDrilldown
    : [];

  const getMarginDrilldown = (band) => {
    return marginDrilldown
      .filter((item) => item.margin_band === band)
      .map((item) => ({
        margin_band: item.margin_band,
        transaction_id: item.transaction_id,
        transaction_date: item.transaction_date,
        item_code: item.item_code,
        item_name: item.item_name,
        quantity_sold: item.quantity_sold,
        selling_price_unit: item.selling_price_unit,
        cost_price_unit: item.cost_price_unit,
        sales_value_excl: item.sales_value_excl,
        gross_profit: item.gross_profit,
        gross_margin_perc: item.gross_margin_perc,
        branch_id: item.branch_id,
        branch_name: item.branch_name,
        staff_member: item.staff_member,
      }));
  };

  const marginDrilldown25 = getMarginDrilldown("<25%");
  const marginDrilldown25To30 = getMarginDrilldown("25% to 30%");
  const marginDrilldown30To45 = getMarginDrilldown("30% to 45%");
  const marginDrilldownAbove45 = getMarginDrilldown(">45%");

  // -------------------------------------------------------
  // CUSTOMER MEMBER ANALYSIS — SUMMARY
  // -------------------------------------------------------
  const memberSummary = customerMemberAnalysisSummary?.[0] || {};

  const totalActiveMembers = Number(memberSummary.total_active_members ?? 0);

  const newMembersOnboarded = Number(memberSummary.new_members_onboarded ?? 0);

  const returningMembers = Number(memberSummary.returning_members ?? 0);

  const newMemberTransactions = Number(
    memberSummary.new_member_transactions ?? 0,
  );

  const newMemberSales = Number(memberSummary.new_member_sales_excl ?? 0);

  const newMemberABV = Number(memberSummary.new_member_abv ?? 0);

  const repeatMemberTransactions = Number(
    memberSummary.repeat_member_transactions ?? 0,
  );

  const repeatMemberSales = Number(memberSummary.repeat_member_sales_excl ?? 0);

  const repeatMemberABV = Number(memberSummary.repeat_member_abv ?? 0);

  const totalStoreTransactions = Number(
    memberSummary.total_store_transactions ?? 0,
  );

  const totalStoreSales = Number(memberSummary.total_store_sales_excl ?? 0);

  const overallAverageBasketValue = Number(
    memberSummary.overall_avg_basket_value ?? 0,
  );

  const memberTransactionShare = Number(
    memberSummary.member_transaction_share_pct ?? 0,
  );

  const memberActionInsight = memberSummary.action_insight ?? "";

  const cohortData = customerMemberAnalysisCohort || [];

  const newMemberCohort =
    cohortData.find((item) => item.cohort_type === "NEW_MEMBER") || {};

  const repeatMemberCohort =
    cohortData.find((item) => item.cohort_type === "REPEAT_MEMBER") || {};

  const nonMemberCohort =
    cohortData.find((item) => item.cohort_type === "NON_MEMBER") || {};

  // NEW MEMBERS
  const newCohortMemberCount = Number(newMemberCohort.member_count ?? 0);
  const newCohortTransactions = Number(newMemberCohort.transaction_count ?? 0);
  const newCohortSalesExcl = Number(newMemberCohort.sales_value_excl ?? 0);
  const newCohortSalesIncl = Number(newMemberCohort.sales_value_incl ?? 0);
  const newCohortABV = Number(newMemberCohort.avg_basket_value ?? 0);
  const newCohortSalesContribution = Number(
    newMemberCohort.sales_contribution_pct ?? 0,
  );

  // REPEAT MEMBERS
  const repeatCohortMemberCount = Number(repeatMemberCohort.member_count ?? 0);
  const repeatCohortTransactions = Number(
    repeatMemberCohort.transaction_count ?? 0,
  );
  const repeatCohortSalesExcl = Number(
    repeatMemberCohort.sales_value_excl ?? 0,
  );
  const repeatCohortSalesIncl = Number(
    repeatMemberCohort.sales_value_incl ?? 0,
  );
  const repeatCohortABV = Number(repeatMemberCohort.avg_basket_value ?? 0);
  const repeatCohortSalesContribution = Number(
    repeatMemberCohort.sales_contribution_pct ?? 0,
  );

  // NON-MEMBERS
  const nonMemberCount = Number(nonMemberCohort.member_count ?? 0);
  const nonMemberTransactions = Number(nonMemberCohort.transaction_count ?? 0);
  const nonMemberSalesExcl = Number(nonMemberCohort.sales_value_excl ?? 0);
  const nonMemberSalesIncl = Number(nonMemberCohort.sales_value_incl ?? 0);
  const nonMemberABV = Number(nonMemberCohort.avg_basket_value ?? 0);
  const nonMemberSalesContribution = Number(
    nonMemberCohort.sales_contribution_pct ?? 0,
  );

const performanceSummary = salesTargetSummary?.[0] ?? {};
const performanceSummaryMONTHLY =
  salesTargetMONTHLY_PIVOT ?? [];

const getChannelData = (channel) =>
  salesChannel.find((item) => item.sales_channel === channel) || {};

const CASH = getChannelData("CASH");
const INSURANCE = getChannelData("INSURANCE");
const OTHER_ACCOUNT = getChannelData("OTHER_ACCOUNT");
const RETURN = getChannelData("RETURN");
const TOTAL = getChannelData("TOTAL");

const categoryPerformance = Array.isArray(salesSubgroup)
  ? salesSubgroup
  : [];

const categoryTotals = (Array.isArray(categoryPerformance)
  ? categoryPerformance
  : []
).reduce(
  (totals, item) => ({
    total_sales_excl:
      totals.total_sales_excl + Number(item.total_sales_excl ?? 0),

    total_tax:
      totals.total_tax + Number(item.total_tax ?? 0),

    total_sales_incl:
      totals.total_sales_incl + Number(item.total_sales_incl ?? 0),

    total_cogs:
      totals.total_cogs + Number(item.total_cogs ?? 0),

    gross_profit:
      totals.gross_profit + Number(item.gross_profit ?? 0),

    total_units_sold:
      totals.total_units_sold + Number(item.total_units_sold ?? 0),

    active_items_count:
      totals.active_items_count + Number(item.active_items_count ?? 0),

    transaction_count:
      totals.transaction_count + Number(item.transaction_count ?? 0),

    total_line_items:
      totals.total_line_items + Number(item.total_line_items ?? 0),

    unique_clients:
      totals.unique_clients + Number(item.unique_clients ?? 0),
  }),
  {
    total_sales_excl: 0,
    total_tax: 0,
    total_sales_incl: 0,
    total_cogs: 0,
    gross_profit: 0,
    total_units_sold: 0,
    active_items_count: 0,
    transaction_count: 0,
    total_line_items: 0,
    unique_clients: 0,
  }
);

const categoryGrossMargin =
  categoryTotals.total_sales_excl > 0
    ? (categoryTotals.gross_profit / categoryTotals.total_sales_excl) * 100
    : 0;

// Use the API's total sales including tax and transaction count
// to calculate the overall average order value.
const categoryAvgOrderValue =
  categoryTotals.transaction_count > 0
    ? categoryTotals.total_sales_incl / categoryTotals.transaction_count
    : 0;

  return {
    formatAmount,
    totalRevenue,
    cashSales,
    salesInvoices,
    cashInvoicesPercentage,
    salesInvoicesPercentage,
    cashSalesPercentage,
    creditNotesPercentage,
    cashInvoices,
    ordersReceived,
    branchData,
    currentReceivables,
    overdue31To60,
    overdue61To90,
    overdue91To120,
    overdue120Plus,
    topDebtors,
    creditNotes,
    overdueDebtorsCount,
    branchData,
    branchChartSeries,
    branchCategories,
    salesmanData,
    topCustomersData,
    topProducts,
    bottomProducts,
    monthlyChart,
    monthToDateChart,
    marginDrilldown,
    marginDrilldown25,
    marginDrilldown25To30,
    marginDrilldown30To45,
    marginDrilldownAbove45,
    marginBand25,
    marginBand25To30,
    marginBand30To45,
    marginBandAbove45,
    totalActiveMembers,
    newMembersOnboarded,
    returningMembers,
    newMemberTransactions,
    newMemberSales,
    newMemberABV,
    repeatMemberTransactions,
    repeatMemberSales,
    repeatMemberABV,
    totalStoreTransactions,
    totalStoreSales,
    overallAverageBasketValue,
    memberTransactionShare,
    memberActionInsight,
    newCohortMemberCount,
    newCohortTransactions,
    newCohortSalesExcl,
    newCohortSalesIncl,
    newCohortABV,
    newCohortSalesContribution,

    repeatCohortMemberCount,
    repeatCohortTransactions,
    repeatCohortSalesExcl,
    repeatCohortSalesIncl,
    repeatCohortABV,
    repeatCohortSalesContribution,

    nonMemberCount,
    nonMemberTransactions,
    nonMemberSalesExcl,
    nonMemberSalesIncl,
    nonMemberABV,
    nonMemberSalesContribution,
performanceSummary,
performanceSummaryMONTHLY,
  CASH,
    INSURANCE,
    OTHER_ACCOUNT,
    RETURN,
    TOTAL,
    categoryPerformance,
    categoryTotals,
    categoryAvgOrderValue,
categoryGrossMargin,
// netSales,
// targetSales,
// achievementPct,
// grossProfit,
// grossMarginPct,
// averageBasketValue,
// transactionCount,
// totalBranches,
// targetVariance,
// targetActionInsight,
  };
};

export default useSalesAnalytics;
