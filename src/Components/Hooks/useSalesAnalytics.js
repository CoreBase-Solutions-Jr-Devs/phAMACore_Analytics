import { useMemo } from "react";

const useSalesAnalytics = (
 sales = [],
  kpiOverdueAccounts = [],
    salesType = [],
  salesBranch = [],
  salesBranch_Type = [],
   salesChannel= [],
salesComparativeYTD= [],
salesComparativeMTD= [],
salesMonthly= [],
salesDaily= [],
  monthlySales = [],
  monthToDateSales = [],
  lastYearMonthToDateSales = [],
  lastYearMonthlySales = [],
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
    0
  )
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

 const branchData = salesBranch.map((item) => ({
  name: item.branch_name || "UNKNOWN BRANCH",
  amount: Number(item.net_sales_incl || 0),
}));

const branchChartSeries = branchData.map((branch) =>
  Number(branch.amount || 0)
);

const branchCategories = branchData.map((branch) => branch.name);

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
const overdue = Array.isArray(kpiOverdueAccounts)
  ? kpiOverdueAccounts
  : [];

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

const overdueDebtorsCount = overdue.filter(
  (item) => Number(item.total_balance || 0) > 0
).length;

const topDebtors = (kpiOverdueAccounts || [])
  .slice()
  .sort(
    (a, b) =>
      Number(b.total_balance ?? 0) -
      Number(a.total_balance ?? 0)
  )
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
    const key = (item.item_Name);

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
    branchChartSeries,
    branchCategories,
    salesmanData,
    topCustomersData,
    topProducts,
    bottomProducts,
    monthlyChart,
    monthToDateChart,
  };
};

export default useSalesAnalytics;
