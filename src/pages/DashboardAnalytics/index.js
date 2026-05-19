import React, { useMemo } from "react";
import { Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

// Components
import Widget from "./Widget";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import BranchPerformance from "./BranchPerfomance";
import TopProducts from "./TopProducts";
import SalesmanRevenue from "./SalesmanRevenue";
import ReceivablesAgeing from "./ReceivablesAgeing";
import TopCustomers from "./TopCustomers";
import ProgressiveSales from "./ProgressiveSales";
import MonthToDateSales from "./MonthToDateSales";
import BranchDropdown from "./BranchDropdown";

// API
import { getSalesTransactions } from "../../slices/dashboardSales/thunk";

const DashboardAnalytics = () => {

  /* =========================================================
   🔹 UTILITIES
  ========================================================= */

  const formatAmount = (value) => {
    if (value === null || value === undefined) return "0";

    const abs = Math.abs(value);

    if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (abs >= 1_000) return (value / 1_000).toFixed(1) + "K";

    return value.toFixed(0);
  };

  const getDateOnly = (dateStr) => new Date(dateStr).toDateString();

  const getMonths = () =>
    Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleString("default", { month: "short" })
    );

  const normalizeProductName = (name = "") =>
    name
      .toLowerCase()
      .trim()
      .replace(/\b(tabs?|tablets?)\b/g, "tab")
      .replace(/\s+/g, " ");

  document.title = "Analytics | Velzon - React Admin & Dashboard Template";

  const dispatch = useDispatch();

  /* =========================================================
   🔹 REDUX STATE
  ========================================================= */

  const { sales = [], loading, error, filters } = useSelector(
    (state) => state.powerbi
  );

  /* =========================================================
   🔹 FILTER ACTION
  ========================================================= */

  const handleApplyFilters = () => {
    dispatch(
      getSalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode:
          filters.branch === "All Branches" ? null : filters.branch,
      })
    );
  };

  /* =========================================================
   🔹 CORE KPI CALCULATIONS
  ========================================================= */

  const totalRevenue = sales.reduce(
    (sum, item) => sum + (item.revenue || 0),
    0
  );

  // TODAY / YESTERDAY REVENUE
  const today = new Date().toDateString();

  const todayRevenue = sales
    .filter((i) => getDateOnly(i.transaction_Date) === today)
    .reduce((s, i) => s + (i.revenue || 0), 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayRevenue = sales
    .filter((i) => getDateOnly(i.transaction_Date) === yesterday.toDateString())
    .reduce((s, i) => s + (i.revenue || 0), 0);

  const revenueChange =
    yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

  // CASH vs CREDIT
  const cashSales = sales
    .filter((i) => i.transaction_Type === "CASHSALE")
    .reduce((s, i) => s + (i.revenue || 0), 0);

  const creditSales = totalRevenue - cashSales;

  const cashPercentage =
    totalRevenue > 0 ? (cashSales / totalRevenue) * 100 : 0;

  const creditPercentage =
    totalRevenue > 0 ? (creditSales / totalRevenue) * 100 : 0;

  // ORDERS
  const ordersReceived = new Set(
    sales.filter((i) => i.invoice_Number).map((i) => i.invoice_Number)
  ).size;

  /* =========================================================
   🔹 BRANCH ANALYTICS
  ========================================================= */

  const branchTotals = sales.reduce((acc, item) => {
    const branch = item.brancch_Name || "UNKNOWN BRANCH";
    acc[branch] = (acc[branch] || 0) + Number(item.revenue || 0);
    return acc;
  }, {});

  const branchData = Object.keys(branchTotals).map((b) => ({
    name: b,
    amount: branchTotals[b],
  }));

  /* =========================================================
   🔹 SALESMAN ANALYTICS
  ========================================================= */

  const salesmanTotals = sales.reduce((acc, item) => {
    const rep = item.staff_Name || "UNKNOWN REP";
    const branch = item.brancch_Name || "UNKNOWN BRANCH";
    const key = `${rep}__${branch}`;

    if (!acc[key]) {
      acc[key] = { rep, branch, revenue: 0 };
    }

    acc[key].revenue += Number(item.revenue || 0);
    return acc;
  }, {});

  const salesmanData = Object.values(salesmanTotals);

  /* =========================================================
   🔹 CUSTOMER ANALYTICS
  ========================================================= */

  const customerTotals = sales.reduce((acc, item) => {
    const name = item.client_Name || "UNKNOWN CUSTOMER";
    const branch = item.brancch_Name || "UNKNOWN BRANCH";
    const key = `${name}__${branch}`;

    if (!acc[key]) {
      acc[key] = { name, branch, revenue: 0 };
    }

    acc[key].revenue += Number(item.revenue || 0);
    return acc;
  }, {});

  const topCustomersData = Object.values(customerTotals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  /* =========================================================
   🔹 MONTHLY CHART
  ========================================================= */

  const monthlyChart = useMemo(() => {
    const MONTHS = getMonths();

    const map = MONTHS.reduce((a, m) => ((a[m] = 0), a), {});

    sales.forEach((s) => {
      const month = new Date(s.transaction_Date).toLocaleString(
        "default",
        { month: "short" }
      );

      if (map[month] !== undefined) {
        map[month] += Number(s.revenue || 0);
      }
    });

    return {
      categories: MONTHS,
      series: [{ name: "Revenue", data: MONTHS.map((m) => map[m]) }],
    };
  }, [sales]);

  /* =========================================================
   🔹 MONTH-TO-DATE CHART
  ========================================================= */

  const monthToDateChart = useMemo(() => {
    const now = new Date();
    const days = now.getDate();

    const DAYS = Array.from({ length: days }, (_, i) => i + 1);
    const map = DAYS.reduce((a, d) => ((a[d] = 0), a), {});

    sales.forEach((s) => {
      const d = new Date(s.transaction_Date);

      if (
        d.getMonth() !== now.getMonth() ||
        d.getFullYear() !== now.getFullYear()
      )
        return;

      map[d.getDate()] += Number(s.revenue || 0);
    });

    return {
      categories: DAYS.map(String),
      series: [
        {
          name: "Revenue",
          data: DAYS.map((d) => map[d] / 1000),
        },
      ],
    };
  }, [sales]);

  /* =========================================================
   🔹 TOP PRODUCTS
  ========================================================= */

  const topProducts = Object.values(
    sales.reduce((acc, item) => {
      const name = normalizeProductName(item.item_Name);

      const qty = Math.round(Number(item.quantity_Sold || 0));

      if (!acc[name]) {
        acc[name] = { name: item.item_Name, qty: 0 };
      }

      acc[name].qty += qty;
      return acc;
    }, {})
  )
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  /* =========================================================
   🔹 RENDER
  ========================================================= */

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Sales" pageTitle="Dashboards" />

        {loading && <p>Loading analytics...</p>}
        {error && <p className="text-danger">{error}</p>}

        <Row>
          <Col xl={12}>
            <BranchDropdown onApply={handleApplyFilters} />
          </Col>
        </Row>

        <Row>
          <Col xxl={5}>
            <Widget
              sales={sales}
              totalRevenue={totalRevenue}
              cashSales={cashSales}
              creditSales={creditSales}
              cashPercentage={cashPercentage}
              creditPercentage={creditPercentage}
              revenueChange={revenueChange}
              ordersReceived={ordersReceived}
              formatAmount={formatAmount}
            />
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <BranchPerformance
              sales={sales}
              branchData={branchData}
              formatAmount={formatAmount}
            />
          </Col>

          <Col xl={6}>
            <TopProducts data={topProducts} />
          </Col>
        </Row>

        <Row>
          <Col xl={4}>
            <SalesmanRevenue sales={sales} data={salesmanData} />
          </Col>

          <Col xl={4}>
            <ReceivablesAgeing sales={sales} />
          </Col>

          <Col xl={4}>
            <TopCustomers data={topCustomersData} />
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <ProgressiveSales
              series={monthlyChart.series}
              categories={monthlyChart.categories}
            />
          </Col>

          <Col xl={6}>
            <MonthToDateSales
              series={monthToDateChart.series}
              categories={monthToDateChart.categories}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardAnalytics;