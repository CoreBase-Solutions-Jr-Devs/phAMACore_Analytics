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
  getLastYearMonthToDateSales,
  getLastYearMonthlySales,
  getKPISalesTransactions,
  getKPIOverdueAccounts,
} from "../../slices/dashboardSales/thunk";
import {
  getDateRanges,
  getPreviousYearDate,
  getPeriod,
} from "../../helpers/date_helper";
import { clearSalesData } from "../../slices/dashboardSales/reducer";
import useSalesAnalytics from "../../Components/Hooks/useSalesAnalytics";

const DashboardSales = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { branchId } = useParams();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);

  const {
    sales = [],
    monthlySales = [],
    monthToDateSales = [],
    lastYearMonthToDateSales = [],
    lastYearMonthlySales = [],
    kpiSales = [],
    kpiOverdueAccounts = [],
    overdueSummary = [],
    overdueCustomers = [],
    overdueCategories = [],

    salesType = [],
    salesBranch = [],
    salesBranch_Type = [],

    filters,
    error,
    loading,
  } = useSelector((state) => state.powerbi);

  const branchCode = branchId ?? null;
  const isBranchView = !!branchCode;

  const {
    formatAmount,
    totalRevenue,
    revenueChange,
    lastYearRevenue,
    cashSales,
    salesInvoices,
    cashInvoicesPercentage,
    salesInvoicesPercentage,
    cashSalesPercentage,
    creditNotesPercentage,
    // creditInvoicesPercentage,
    cashInvoices,
    ordersReceived,
    branchData,
    branchChartSeries,
    branchCategories,
    currentReceivables,
    overdue31To60,
    overdue61To90,
    overdue91To120,
    overdue120Plus,
    topDebtors,
    creditNotes,
    overdueDebtorsCount,
    bottomProducts,
    salesmanData,
    topCustomersData,
    topProducts,
    monthlyChart,
    monthToDateChart,
  } = useSalesAnalytics(
    sales,
    kpiOverdueAccounts,
    salesType,
    salesBranch,
    salesBranch_Type,
    monthlySales,
    monthToDateSales,
    lastYearMonthToDateSales,
    lastYearMonthlySales,
    filters,
  );

  const {
    currentYearStart,
    currentMonthStart,
    today,
    lastYearStart,
    lastYearMonthStart,
    lastYearToday,
  } = getDateRanges();

  const dates = getDateRanges();

  useEffect(() => {
    dispatch(
      getSalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: branchId,
      }),
    );

    dispatch(
      getLastYearMonthlySales({
        clientid: 1,
        startDate: dates.lastYearStart,
        endDate: dates.lastYearToday,
        branchcode: branchId,
      }),
    );

    dispatch(
      getMonthlySales({
        clientid: 1,
        startDate: dates.currentYearStart,
        endDate: dates.currentYearToday,
        branchcode: branchId,
      }),
    );

    dispatch(
      getMonthToDateSales({
        clientid: 1,
        startDate: dates.currentYearMonthStart,
        endDate: dates.currentYearToday,
        branchcode: branchId,
      }),
    );

    dispatch(
      getLastYearMonthToDateSales({
        clientid: 1,
        startDate: dates.lastYearMonthStart,
        endDate: dates.lastYearToday,
        branchcode: branchId,
      }),
    );

    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: branchId,
    };

    dispatch(
      getKPISalesTransactions({
        ...params,
        groupBy: "TYPE",
      }),
    );

    dispatch(
      getKPISalesTransactions({
        ...params,
        groupBy: "BRANCH",
      }),
    );

    dispatch(
      getKPISalesTransactions({
        ...params,
        groupBy: "BRANCH_TYPE",
      }),
    );

    dispatch(
      getKPIOverdueAccounts({
        clientid: 1,
        mode: "AGING",
        accountType: "CUSTOMER",
        branchcode: branchId,
        dateFrom: filters.startDate,
        dateTo: filters.endDate,
        periodFrom: getPeriod(filters.startDate),
        periodTo: getPeriod(filters.endDate),
        includeZeroBal: false,
      }),
    );
  }, [dispatch, branchId]);

  useEffect(() => {
    return () => {
      dispatch(clearSalesData());
    };
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(
      getSalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: branchId,
      }),
    );

    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: branchId,
    };

    dispatch(
      getKPISalesTransactions({
        ...params,
        groupBy: "TYPE",
      }),
    );

    dispatch(
      getKPISalesTransactions({
        ...params,
        groupBy: "BRANCH",
      }),
    );

    dispatch(
      getKPISalesTransactions({
        ...params,
        groupBy: "BRANCH_TYPE",
      }),
    );

    dispatch(
      getKPIOverdueAccounts({
        clientid: 1,
        mode: "AGING",
        accountType: "CUSTOMER",
        branchcode: branchId,
        dateFrom: filters.startDate,
        dateTo: filters.endDate,
        periodFrom: getPeriod(filters.startDate),
        periodTo: getPeriod(filters.endDate),
        includeZeroBal: "false",
      }),
    );

    if (filters.branch) {
      navigate(`/dashboard-sales/branch/${filters.branch}`);
    } else {
      navigate("/dashboard-sales");
    }
  };

  document.title = "Sales Dashboard | phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Sales"
          pageTitle="Dashboards"
          subtitle={
            isBranchView
              ? salesBranch.find((s) => s.branch_ID === Number(branchCode))
                  ?.brancch_Name
              : undefined
          }
        />

        <Row>
          <Widget
            kpisales={kpiSales}
            totalRevenue={totalRevenue}
            cashSales={cashSales}
            salesInvoices={salesInvoices}
            ordersReceived={ordersReceived}
            formatAmount={formatAmount}
            cashInvoicesPercentage={cashInvoicesPercentage}
            salesInvoicesPercentage={salesInvoicesPercentage}
            cashSalesPercentage={cashSalesPercentage}
            overdueDebtorsCount={overdueDebtorsCount}
            creditNotesPercentage={creditNotesPercentage}
            creditNotes={creditNotes}
            // revenueChange={revenueChange}
            cashInvoices={cashInvoices}
            // branchMap={branchMap}
            rightClickBtn={toggleRightColumn}
            loading={loading}
            error={error}
          />
        </Row>
        <Row>
          <Col xl={6}>
            {isBranchView ? (
              <TopProducts data={topProducts}   loading={loading}
                error={error}/>
            ) : (
              <BranchPerformance
                branchData={branchData}
                chartSeries={branchChartSeries}
                categories={branchCategories}
                totalRevenue={totalRevenue}
                formatAmount={formatAmount}
                loading={loading}
                error={error}
              />
            )}
          </Col>

          <Col xl={6}>
            {isBranchView ? (
              <BottomProducts
                data={bottomProducts}
                error={error}
                loading={loading}
              />
            ) : (
              <TopProducts data={topProducts} error={error} loading={loading} />
            )}
          </Col>
        </Row>

        <Row>
          <Col xl={4}>
            <SalesmanRevenue
              sales={sales}
              data={salesmanData}
              formatAmount={formatAmount}
              error={error}
              loading={loading}
            />
          </Col>

          <Col xl={4}>
            <ReceivablesAgeing
              kpiOverdueAccounts={kpiOverdueAccounts}
              currentReceivables={currentReceivables}
              // overdue1To30={overdue1To30}
              overdue31To60={overdue31To60}
              overdue61To90={overdue61To90}
              overdue91To120={overdue91To120}
              overdue120Plus={overdue120Plus}
              topDebtors={topDebtors}
              formatAmount={formatAmount}
              error={error}
              loading={loading}
            />
          </Col>

          <Col xl={4}>
            <TopCustomers
              sales={sales}
              data={topCustomersData}
              formatAmount={formatAmount}
              error={error}
              loading={loading}
            />
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <YearToDateSales
              series={monthlyChart.series}
              categories={monthlyChart.categories}
              formatAmount={formatAmount}
              error={error}
              loading={loading}
            />
          </Col>

          <Col xl={6}>
            <MonthToDateSales
              series={monthToDateChart.series}
              categories={monthToDateChart.categories}
              formatAmount={formatAmount}
              error={error}
              loading={loading}
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
