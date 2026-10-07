import { useMemo } from "react";

const useSalesAnalytics = (
 sales = [],
  kpiOverdueAccounts = [],
    salesType = [],
  salesBranch = [],
  salesBranch_Type = [],
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
    const currentDate = new Date();

    const currentYear = currentDate.getFullYear();
    const lastYear = currentYear - 1;

    let endDate = currentDate;

    if (filters?.dateRange === "Year To Date" && filters?.endDate) {
      const [day, month, year] = filters.endDate.split("/").map(Number);
      endDate = new Date(year, month - 1, day);
    }

    const currentMonth = endDate.getMonth() + 1;

    const months = Array.from({ length: currentMonth }, (_, i) =>
      new Date(2000, i, 1).toLocaleString("en-US", {
        month: "short",
      }),
    );

    const currentYearMap = Object.fromEntries(months.map((m) => [m, 0]));

    const lastYearMap = Object.fromEntries(months.map((m) => [m, 0]));

    (monthlySales || []).forEach((item) => {
      if (!item.transaction_Date) return;

      const date = new Date(item.transaction_Date);

      if (date.getFullYear() !== currentYear) return;

      const month = date.toLocaleString("en-US", {
        month: "short",
      });

      if (currentYearMap[month] !== undefined) {
        currentYearMap[month] += Number(item.revenue || 0);
      }
    });

    (lastYearMonthlySales || []).forEach((item) => {
      if (!item.transaction_Date) return;

      const date = new Date(item.transaction_Date);

      if (date.getFullYear() !== lastYear) return;

      const month = date.toLocaleString("en-US", {
        month: "short",
      });

      if (lastYearMap[month] !== undefined) {
        lastYearMap[month] += Number(item.revenue || 0);
      }
    });

    return {
      categories: months,

      series: [
        {
          name: `${currentYear}`,
          data: months.map((m) => currentYearMap[m]),
        },
        {
          name: `${lastYear}`,
          data: months.map((m) => lastYearMap[m]),
        },
      ],
    };
  }, [monthlySales, lastYearMonthlySales, filters]);

  /* -------------------------------------------------------
   * Month-to-Date Revenue Chart
   * ------------------------------------------------------*/
  const monthToDateChart = useMemo(() => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    let endDate = now;

    if (filters?.dateRange === "Month To Date" && filters?.endDate) {
      const [day, month, year] = filters.endDate.split("/").map(Number);
      endDate = new Date(year, month - 1, day);
    }

    const currentMonth = endDate.getMonth();
    const endDay = endDate.getDate();

    const DAYS = Array.from({ length: endDay }, (_, i) => i + 1);

    const currentYearMap = DAYS.reduce((acc, d) => {
      acc[d] = 0;
      return acc;
    }, {});

    const lastYearMap = DAYS.reduce((acc, d) => {
      acc[d] = 0;
      return acc;
    }, {});

    (monthToDateSales || []).forEach((s) => {
      if (!s.transaction_Date) return;

      const date = new Date(s.transaction_Date);

      if (
        date.getFullYear() !== currentYear ||
        date.getMonth() !== currentMonth
      ) {
        return;
      }

      const day = date.getDate();

      if (currentYearMap[day] !== undefined) {
        currentYearMap[day] += Number(s.revenue || 0);
      }
    });

    (lastYearMonthToDateSales || []).forEach((s) => {
      if (!s.transaction_Date) return;

      const date = new Date(s.transaction_Date);

      if (date.getFullYear() !== lastYear || date.getMonth() !== currentMonth) {
        return;
      }

      const day = date.getDate();

      if (lastYearMap[day] !== undefined) {
        lastYearMap[day] += Number(s.revenue || 0);
      }
    });

    return {
      categories: DAYS.map(String),

      series: [
        {
          name: `${currentYear}`,
          data: DAYS.map((d) => Number(currentYearMap[d] || 0)),
        },
        {
          name: `${lastYear}`,
          data: DAYS.map((d) => Number(lastYearMap[d] || 0)),
        },
      ],
    };
  }, [monthToDateSales, lastYearMonthToDateSales, filters]);

  const topProductsData = sales.reduce((acc, item) => {
    const name = item.item_Name || "UNKNOWN PRODUCT";
  

    const qty = Number(item.quantity_Sold || 0);

    if (!acc[name]) {
      acc[name] = {
        name: rawName,
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
        name: rawName,
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
