import { useMemo } from "react";

const usePurchaseOrders = (
  PurchaseOrders = [],
  ActualSpend = [],
  DailySpend = []
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
  // TOTAL SPEND
  // Calculates the total value of all purchase orders
  // ============================================================
  const totalSpend = useMemo(() => {
    return PurchaseOrders.reduce(
      (sum, item) =>
        sum + Number(item?.total_lpo_value || 0),
      0
    );
  }, [PurchaseOrders]);


  // ============================================================
  // ACTIVE SUPPLIERS
  // Counts the number of unique suppliers
  // ============================================================
  const activeSuppliers = useMemo(() => {
    return new Set(
      PurchaseOrders
        .map((item) => item?.supplier_id)
        .filter(Boolean)
    ).size;
  }, [PurchaseOrders]);


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


  // ============================================================
  // SPEND BY SUPPLIER
  // Groups purchase-order spend by supplier
  // ============================================================
  const spendBySupplier = useMemo(() => {

    return PurchaseOrders
      .filter(Boolean)
      .reduce((acc, item) => {

        const supplier =
          item?.supplier_Name || "Unknown";

        const value =
          Number(item?.total_lpo_value || 0);

        acc[supplier] =
          (acc[supplier] || 0) + value;

        return acc;

      }, {});

  }, [PurchaseOrders]);


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
  const branchData = useMemo(() => {

    const spendByBranch = PurchaseOrders.reduce(
      (acc, item) => {

        const branch =
          item?.branch_name || "Unknown";

        const value =
          Number(item?.total_lpo_value || 0);

        acc[branch] =
          (acc[branch] || 0) + value;

        return acc;

      },
      {}
    );

    return Object.entries(spendByBranch)
      .map(([name, value]) => ({
        name,
        value,
      }));

  }, [PurchaseOrders]);


  // ============================================================
  // YEAR-TO-DATE ACTUAL SPEND CHART
  //
  // Creates monthly spend from January
  // up to the current month.
  // ============================================================
  const actualSpendChart = useMemo(() => {

    const currentMonth =
      new Date().getMonth() + 1;

    const months = Array.from(
      { length: currentMonth },
      (_, i) =>
        new Date(
          2000,
          i,
          1
        ).toLocaleString("en-US", {
          month: "short",
        })
    );

    const map = Object.fromEntries(
      months.map((month) => [
        month,
        0,
      ])
    );

    ActualSpend.forEach((item) => {

      if (!item?.lpo_date) {
        return;
      }

      const date =
        new Date(item.lpo_date);

      const month =
        date.toLocaleString(
          "en-US",
          { month: "short" }
        );

      const spend =
        Number(
          item?.total_lpo_value || 0
        );

      if (map[month] !== undefined) {
        map[month] += spend;
      }

    });

    return {
      categories: months,

      series: [
        {
          name: "Actual Spend",
          data: months.map(
            (month) => map[month]
          ),
        },
      ],
    };

  }, [ActualSpend]);


  // ============================================================
  // MONTH-TO-DATE SPEND CHART
  //
  // Creates daily spend from the first day
  // of the current month up to today.
  // ============================================================
  const monthToDateChart = useMemo(() => {

    const now = new Date();

    const currentYear =
      now.getFullYear();

    const currentMonth =
      now.getMonth();

    const today =
      now.getDate();

    // Create days 1 -> today
    const DAYS = Array.from(
      { length: today },
      (_, i) => i + 1
    );

    // Initialize every day to zero
    const map = DAYS.reduce(
      (acc, day) => {
        acc[day] = 0;
        return acc;
      },
      {}
    );

    DailySpend.forEach((item) => {

      if (!item?.lpo_date) {
        return;
      }

      const date =
        new Date(item.lpo_date);

      // Only current month and year
      if (
        date.getFullYear() !== currentYear ||
        date.getMonth() !== currentMonth
      ) {
        return;
      }

      const day =
        date.getDate();

      if (map[day] !== undefined) {
        map[day] += Number(
          item?.total_lpo_value || 0
        );
      }

    });

    return {
      categories: DAYS.map(String),

      series: [
        {
          name: "Daily Spend",
          data: DAYS.map(
            (day) =>
              Number(map[day] || 0)
          ),
        },
      ],
    };

  }, [DailySpend]);


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
  };
};

export default usePurchaseOrders;