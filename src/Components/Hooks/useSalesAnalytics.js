import { useMemo } from "react";

const useSalesAnalytics = (
  sales = [],
  monthlySales = [],
  monthToDateSales = []
) => {

// const branchMap = useMemo(() => {
//    if (!filters.branch) return null;
//   const map = {};
//   sales.forEach((item) => {
//     map[item.branch_ID] = item.brancch_Name;
//   });
//   return map;
// }, [sales]);

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

  const totalRevenue = sales.reduce(
    (sum, item) => sum + (item.revenue || 0),
    0
);

const getStartOfDay = (date = new Date()) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
};

const todayStart = getStartOfDay(new Date());
const yesterdayStart = new Date(todayStart);
yesterdayStart.setDate(yesterdayStart.getDate() - 1);

const todayRevenue = sales.reduce((sum, item) => {
  const itemDate = new Date(item.transaction_Date);
  if (getStartOfDay(itemDate) === todayStart) {
    return sum + (item.revenue || 0);
  }
  return sum;
}, 0);

const yesterdayRevenue = sales.reduce((sum, item) => {
  const itemDate = new Date(item.transaction_Date);
  if (getStartOfDay(itemDate) === yesterdayStart.getTime()) {
    return sum + (item.revenue || 0);
  }
  return sum;
}, 0);

const revenueChange = yesterdayRevenue > 0 
  ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
  : 0;


    const cashSales = sales
    .filter(item => item.client_ID === "CSC999")
    .reduce((sum, item) => sum + (item.revenue || 0), 0);

    const creditSales = sales
    .filter(item => item.client_ID !== "CSC999")
    .reduce((sum, item) => sum + (item.revenue || 0), 0);

    const cashPercentage =
    totalRevenue > 0 ? (cashSales / totalRevenue) * 100 : 0;

    const creditPercentage =
    totalRevenue > 0 ? (creditSales / totalRevenue) * 100 : 0;

    const cashInvoices = sales.filter(
  item => item.client_ID === "CSC999"
).length;

    const ordersReceived = new Set(
      sales
    .filter(item => item.invoice_Number) 
    .map(item => item.invoice_Number)
      ).size;   

    const branchTotals = sales.reduce((acc, item) => {
    const branchName = item.brancch_Name || "UNKNOWN BRANCH";
    const revenue = Number(item.revenue || 0);
    acc[branchName] = (acc[branchName] || 0) + revenue;
    return acc;
    }, {});

    const branchData = Object.keys(branchTotals).map((branch) => ({
    name: branch,
    amount: branchTotals[branch],
    }));
    console.log(branchTotals);

const branchChartSeries = branchData.map(
  (branch) => Number(branch.amount || 0)
);

const branchCategories = branchData.map(
  (branch) => branch.name
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

  /* -------------------------------------------------------
   * Standardizes product names to prevent duplicates.
   * Example:
   * Panadol Tabs
   * Panadol Tablets
   * -> Panadol Tab
   * ------------------------------------------------------*/
  const normalizeProductName = (name = "") =>
    name
      .toLowerCase()
      .trim()
      .replace(/\b(tabs?|tablets?)\b/g, "tab")
      .replace(/\s+/g, " ")
      .trim();

  /* -------------------------------------------------------
   * Top 5 best-selling products.
   * Products are ranked by quantity sold.
   * ------------------------------------------------------*/
  const topProducts = useMemo(() => {
    const totals = {};

    sales.forEach((item) => {
      const key = normalizeProductName(
        item.item_Name
      );

      if (!totals[key]) {
        totals[key] = {
          name: item.item_Name,
          qty: 0,
        };
      }

      totals[key].qty += Number(
        item.quantity_Sold || 0
      );
    });

    return Object.values(totals)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales]);

  /* -------------------------------------------------------
   * Monthly Revenue Chart
 
   * ------------------------------------------------------*/
const monthlyChart = useMemo(() => {

    const currentMonth = new Date().getMonth() + 1;

  const months = Array.from({ length: currentMonth  }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("en-US", {
      month: "short",
    })
  );

  const map = Object.fromEntries(months.map((m) => [m, 0]));

  (monthlySales || []).forEach((item) => {
    if (!item.transaction_Date) return;

    const date = new Date(item.transaction_Date);

    // console.log("PARSED DATE:", date);

    const month = date.toLocaleString("en-US", {
      month: "short",
    });

    console.log("MONTH:", month);

    if (map[month] !== undefined) {
      map[month] += Number(item.revenue || 0);
    }
  });

  return {
    categories: months,
    series: [
      {
        name: "Revenue",
        data: months.map((m) => map[m]),
      },
    ],
  };
}, [monthlySales]);

  /* -------------------------------------------------------
   * Month-to-Date Revenue Chart
   * ------------------------------------------------------*/
const monthToDateChart = useMemo(() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const today = now.getDate();

  const DAYS = Array.from({ length: today }, (_, i) => i + 1);

  const map = DAYS.reduce((acc, d) => {
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

    if (map[day] !== undefined) {
      map[day] += Number(s.revenue || 0);
    }
  });

  console.log(
    "FINAL SERIES:",
    DAYS.map((d) => map[d])
  );

  return {
    categories: DAYS.map(String),
    series: [
      {
        name: "Revenue",
        data: DAYS.map((d) => Number(map[d] || 0)),
      },
    ],
  };
}, [monthToDateSales]);


const topProductsData = sales.reduce((acc, item) => {
  const rawName = item.item_Name || "UNKNOWN PRODUCT";
  const name = normalizeProductName(rawName);

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
    const rawName = item.item_Name || "UNKNOWN PRODUCT";
    const name = normalizeProductName(rawName);

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
    todayRevenue,
    yesterdayRevenue,
    revenueChange,
    cashSales,
    creditSales,
    cashPercentage,
    creditPercentage,
    cashInvoices,
    ordersReceived,
    branchData,
    branchChartSeries,
    branchCategories,
    salesmanData,
    topCustomersData,
    topProducts,
    bottomProducts,
   monthlyChart,
    monthToDateChart
  };
};

export default useSalesAnalytics;