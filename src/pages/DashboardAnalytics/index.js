import React, { useEffect, useMemo } from "react";
import { Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
formatToApiDate,
} from "../../pages/utils/dateHelper";
import Widget from "./Widget";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import OrderPipeline from "./Order Pipeline";
import BranchPerformance from "./BranchPerfomance";
import TopProducts from "./TopProducts";
import SalesmanRevenue from "./SalesmanRevenue";
import ReceivablesAgeing from "./ReceivablesAgeing";
import TopCustomers from "./TopCustomers";
import ProgressiveSales from "./ProgressiveSales";
import MonthToDateSales from "./MonthToDateSales";
import BranchDropdown from "./BranchDropdown";
import { getSalesTransactions } from "../../slices/dashboardSales/thunk";

const DashboardAnalytics = () => {

  const dispatch = useDispatch();

 const { sales = [], filters } = useSelector(
    (state) => state.powerbi
  );

const handleApplyFilters = () => {
    console.log("APPLY CLICKED");
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

useEffect(() => {
  dispatch(
    getSalesTransactions({
      clientid: 1,
  startDate: filters.startDate,
        endDate: filters.endDate,
      branchcode:
        filters.branch === "All Branches"
          ? null
          : filters.branch,
    })
  );
}, []);

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

const getDateOnly = (dateStr) =>
  new Date(dateStr).toDateString();
const today = new Date().toDateString();

const todayRevenue = sales
  .filter(item => getDateOnly(item.transaction_Date) === today)
  .reduce((sum, item) => sum + (item.revenue || 0), 0);
  const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const yesterdayRevenue = sales
  .filter(item => getDateOnly(item.transaction_Date) === yesterday.toDateString())
  .reduce((sum, item) => sum + (item.revenue || 0), 0);

  const revenueChange =
  yesterdayRevenue > 0
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
  .slice(0, 5);
  
const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("default", { month: "short" })
  );
};

const monthlyChart = useMemo(() => {
  const MONTHS = getMonths();

  const map = MONTHS.reduce((acc, m) => {
    acc[m] = 0;
    return acc;
  }, {});

  sales.forEach((s) => {
    const date = new Date(s.transaction_Date);
    const month = date.toLocaleString("default", { month: "short" });

    if (map.hasOwnProperty(month)) {
      map[month] += Number(s.revenue || 0);
    }
  });

  const totals = MONTHS.map((m) => map[m]);

  console.log("📊 Monthly Sales Totals:", map);

  return {
    categories: MONTHS,
    series: [
      {
        name: "Revenue",
        data: totals,
      },
    ],
  };
}, [sales]);

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

  sales.forEach((s) => {
    const date = new Date(s.transaction_Date);

    if (
      date.getFullYear() !== currentYear ||
      date.getMonth() !== currentMonth
    ) return;

    const day = date.getDate();

    if (map[day] !== undefined) {
      map[day] += Number(s.revenue || 0);
    }
  });

  console.log("📊 MTD DAILY MAP:", map);

  return {
    categories: DAYS.map(String),
    series: [
      {
        name: "Revenue",
        data: DAYS.map((d) => map[d] ),
      },
    ],
  };
}, [sales]);

const normalizeProductName = (name = "") => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\b(tabs?|tablets?)\b/g, "tab")
    .replace(/\s+/g, " ")
    .trim();
};

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

const topProducts = Object.values(topProductsData)
  .sort((a, b) => b.qty - a.qty)
  .slice(0, 5);

console.log(topProducts);

document.title = "Sales Dashboard | phAMACore Analytics";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>

          <BreadCrumb title="Sales" pageTitle="Dashboards" />

          {/* STATUS */}
          {/* {loading && <p>Loading analytics...</p>}
          {error && <p className="text-danger">{error}</p>} */}
<Row>
  <Col xl={12}>
  <BranchDropdown  onApply={handleApplyFilters} />
  </Col>
</Row>
          <Row>
            <Col xxl={5}>
              <Widget sales={sales}  totalRevenue={totalRevenue}
  cashSales={cashSales}
  creditSales={creditSales}
  ordersReceived={sales.length}
  formatAmount={formatAmount}
    cashPercentage ={cashPercentage}
  creditPercentage={creditPercentage}
revenueChange={revenueChange}
  />
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
<BranchPerformance
  sales={sales}
  totalRevenue={totalRevenue}
  branchData={branchData}
  formatAmount={formatAmount}
/>            </Col>

            <Col xl={6}>
<TopProducts data={topProducts} />
            </Col>
          </Row>

          <Row>
            <Col xl={4}>
              <SalesmanRevenue sales={sales} data={salesmanData} formatAmount={formatAmount} />
            </Col>

            <Col xl={4}>
              <ReceivablesAgeing sales={sales} />
            </Col>

            <Col xl={4}> 
            <TopCustomers sales={sales} data={topCustomersData} formatAmount={formatAmount} /> 
            </Col>
          </Row>

          <Row>
           
          </Row>
 <Row>
  <Col xl={6}>
            <ProgressiveSales     series={monthlyChart.series}
              categories={monthlyChart.categories}  formatAmount={formatAmount}/>
            </Col>
            <Col xl={6}>
            <MonthToDateSales series={monthToDateChart.series} categories={monthToDateChart.categories} formatAmount={formatAmount}/>  
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardAnalytics;