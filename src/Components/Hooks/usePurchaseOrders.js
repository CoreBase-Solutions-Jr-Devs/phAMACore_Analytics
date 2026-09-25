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
  const avgLeadTime = useMemo(() => {

    const lpoMap = {};

    PurchaseOrders.forEach((item) => {

      const id = item?.lpo_id;

      if (!id || lpoMap[id] !== undefined) {
        return;
      }

      const start = new Date(item?.lpo_date);
      const end = new Date(item?.expected_date);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return;
      }

      const diffDays =
        (end - start) /
        (1000 * 60 * 60 * 24);

      lpoMap[id] = diffDays;
    });

    const leadTimes = Object.values(lpoMap);

    if (!leadTimes.length) {
      return 0;
    }

    return Math.round(
      leadTimes.reduce(
        (sum, value) => sum + value,
        0
      ) / leadTimes.length
    );

  }, [PurchaseOrders]);

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

  const data = Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }));

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
  (DailySpend || []).forEach((item) => {
    if (!item?.period_start) return;

    const date = new Date(item.period_start);

    if (
      date.getFullYear() !== currentYear ||
      date.getMonth() !== currentMonth
    ) {
      return;
    }

    const day = date.getDate();

    if (currentYearMap[day] !== undefined) {
      currentYearMap[day] += Number(
        item?.net_purchases_incl || 0
      );
    }
  });

  // =========================
  // LAST YEAR
  // =========================
  (LastYearDailySpend || []).forEach((item) => {
    if (!item?.period_start) return;

    const date = new Date(item.period_start);

    if (
      date.getFullYear() !== lastYear ||
      date.getMonth() !== currentMonth
    ) {
      return;
    }

    const day = date.getDate();

    if (lastYearMap[day] !== undefined) {
      lastYearMap[day] += Number(
        item?.net_purchases_incl || 0
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
}, [DailySpend, LastYearDailySpend]);


  // ============================================================
  // OVERDUE ACCOUNTS
  //
  // Groups purchase orders by supplier and calculates:
  // - Total amount
  // - Earliest due date
  // - Worst overdue value
  // ============================================================
  const OverdueAccounts = useMemo(() => {

    const groupedMap = new Map();

    PurchaseOrders.forEach((item) => {

      const supplier =
        item?.supplier_Name || "Unknown";

      const dueDate =
        new Date(item?.expected_date);

      if (Number.isNaN(dueDate.getTime())) {
        return;
      }

      const today = new Date();

      const daysOverdue = Math.max(
        0,
        Math.floor(
          (today - dueDate) /
          (1000 * 60 * 60 * 24)
        )
      );

      if (!groupedMap.has(supplier)) {

        groupedMap.set(supplier, {
          supplier,
          amount:
            Number(
              item?.total_lpo_value || 0
            ),
          dueDate,
          daysOverdue,
        });

      } else {

        const existing =
          groupedMap.get(supplier);

        // Combine supplier amounts
        existing.amount +=
          Number(
            item?.total_lpo_value || 0
          );

        // Keep worst overdue value
        existing.daysOverdue =
          Math.max(
            existing.daysOverdue,
            daysOverdue
          );

        // Keep earliest due date
        if (
          dueDate <
          existing.dueDate
        ) {
          existing.dueDate =
            dueDate;
        }

      }

    });

    return Array.from(
      groupedMap.values()
    )
      .map((item) => ({

        supplier:
          item.supplier,

        amount:
          formatAmount(item.amount),

        dueDate:
          item.dueDate.toLocaleDateString(
            "en-GB"
          ),

        daysOverdue:
          item.daysOverdue,

        daysOverdueLabel:
          `${item.daysOverdue} days`,

        actionClass:
          item.daysOverdue > 30
            ? "danger"
            : item.daysOverdue > 7
            ? "warning"
            : "success",

      }))
      .sort(
        (a, b) =>
          b.daysOverdue -
          a.daysOverdue
      )
      .slice(0, 10);

  }, [PurchaseOrders]);


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
    actualSpendChart,
    monthToDateChart,
    OverdueAccounts,
    spendByCategory,
  };
};

export default usePurchaseOrders;