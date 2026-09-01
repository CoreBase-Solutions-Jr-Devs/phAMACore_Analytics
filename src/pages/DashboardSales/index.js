import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Widget from "./Widget";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import BranchPerformance from "./BranchPerfomance";
import TopProducts from "./TopProducts";
import BottomProducts from "./BottomProducts";
import SalesmanRevenue from "./SalesmanRevenue";
import ReceivablesAgeing from "./ReceivablesAgeing";
import TopCustomers from "./TopCustomers";
import YearToDateSales from "./YearToDateSales";
import MonthToDateSales from "./MonthToDateSales";
import FilterActions from "./FilterActions";

import {
  getSalesTransactions,
  getMonthlySales,
  getMonthToDateSales,
  fetchBranches,
} from "../../slices/dashboardSales/thunk";

import { clearSalesData, setBranch } from "../../slices/dashboardSales/reducer";
import useSalesAnalytics from "../../Components/Hooks/useSalesAnalytics";
import { resolveBranchName, saveActiveBranch } from "../../helpers/branch_helper";

const DashboardSales = () => {
const dispatch = useDispatch();
const navigate = useNavigate();

const { branchId } = useParams();

const [rightColumn, setRightColumn] = useState(false);

const toggleRightColumn = () =>
  setRightColumn(prev => !prev);

  const {
    sales = [],
    monthlySales = [],
    monthToDateSales = [],
    branches = [],
    filters,
  } = useSelector((state) => state.powerbi);

  const branchCode = branchId ? Number(branchId) : null;
  const isBranchView = !!branchCode;

  const branchDisplayName = isBranchView
    ? resolveBranchName(branchCode, branches, sales)
    : "";

  const {
    formatAmount,
    totalRevenue,
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
    bottomProducts,
    salesmanData,
    topCustomersData,
    topProducts,

    monthlyChart,
    monthToDateChart,
  } = useSalesAnalytics(
    sales,
    monthlySales,
    monthToDateSales,
    filters
  );

  // Sync URL branchId into Redux filters and persist active branch
  useEffect(() => {
    dispatch(setBranch(branchCode));
    if (branchCode) {
      saveActiveBranch("sales", branchCode);
    }
  }, [dispatch, branchCode]);

  // Fetch branches once on mount
  useEffect(() => {
    dispatch(fetchBranches({ clientid: 1 }));
  }, [dispatch]);

 useEffect(() => {
    dispatch(
        getSalesTransactions({
            clientid: 1,
            startDate: filters.startDate,
            endDate: filters.endDate,
            branchcode: branchCode || null,
        })
    );

    dispatch(
        getMonthlySales({
            clientid: 1,
            startDate: new Date(
                new Date().getFullYear(),
                0,
                1
            ).toLocaleDateString("en-GB"),

            endDate: new Date().toLocaleDateString("en-GB"),

            branchcode: branchCode || null,
        })
    );

    dispatch(
        getMonthToDateSales({
            clientid: 1,
            startDate: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
            ).toLocaleDateString("en-GB"),

            endDate: new Date().toLocaleDateString("en-GB"),

            branchcode: branchCode || null,
        })
    );

}, [
    dispatch,
    branchCode,
    filters.startDate,
    filters.endDate,
]);

  useEffect(() => {
    return () => {
      dispatch(clearSalesData());
    };
  }, [dispatch]);

 const handleApplyFilters = () => {
    setRightColumn(false);

    if (filters.branch) {
        navigate(`/dashboard-sales/branch/${filters.branch}`);
    } else {
        navigate("/dashboard-sales");
    }
};


  document.title = "Sales Dashboard | phAMACore Analytics";

// const branchMap = useMemo(() => {
//     if (!filters.branch) return null;
//     const map = {};
//     sales.forEach((item) => {
//       map[item.branch_ID] = item.brancch_Name;
//     });
//     return map;
//   }, [sales]);
  return (
    <div className="page-content">
      <Container fluid>
<BreadCrumb
    title="Sales"
    pageTitle="Dashboards"
    subtitle={isBranchView ? branchDisplayName : undefined}
/>

        <Row>
          <Widget
            sales={sales}
            totalRevenue={totalRevenue}
            cashSales={cashSales}
            creditSales={creditSales}
            ordersReceived={ordersReceived}
            formatAmount={formatAmount}
            cashPercentage={cashPercentage}
            creditPercentage={creditPercentage}
            revenueChange={revenueChange}
            cashInvoices={cashInvoices}
            rightClickBtn={toggleRightColumn}
            isBranchView={isBranchView}
            branchDisplayName={branchDisplayName}
          />
        </Row>
<Row className="mt-4">

    <Col xl={6}>

        {isBranchView ? (

            <TopProducts data={topProducts}/>

        ) : (

            <BranchPerformance
                branchData={branchData}
                chartSeries={branchChartSeries}
                categories={branchCategories}
                totalRevenue={totalRevenue}
                formatAmount={formatAmount}
            />

        )}

    </Col>

    <Col xl={6}>

        {isBranchView ? (

            <BottomProducts
                data={bottomProducts}
            />

        ) : (

            <TopProducts
                data={topProducts}
            />

        )}

    </Col>

</Row>

        <Row>
          <Col xl={4}>
            <SalesmanRevenue
              sales={sales}
              data={salesmanData}
              formatAmount={formatAmount}
            />
          </Col>

          <Col xl={4}>
            <ReceivablesAgeing sales={sales} />
          </Col>

          <Col xl={4}>
            <TopCustomers
              sales={sales}
              data={topCustomersData}
              formatAmount={formatAmount}
            />
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <YearToDateSales
              series={monthlyChart.series}
              categories={monthlyChart.categories}
              formatAmount={formatAmount}
            />
          </Col>

          <Col xl={6}>
            <MonthToDateSales
              series={monthToDateChart.series}
              categories={monthToDateChart.categories}
              formatAmount={formatAmount}
            />
          </Col>

          <FilterActions
            onApply={handleApplyFilters}
            rightColumn={rightColumn}
            hideRightColumn={toggleRightColumn}
          />
        </Row>
      </Container>
    </div>
  );
};

export default DashboardSales;