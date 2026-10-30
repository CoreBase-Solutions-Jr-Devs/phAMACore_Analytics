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
import FilterActions from "../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../slices/dashboardSales/reducer";
import {
  getSalesTransactions,
  getKPISalesTransactions,
  getKPIOverdueAccounts,
} from "../../slices/dashboardSales/thunk";
import {

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

const [selectedBranchName, setSelectedBranchName] =
  useState("All Branches");

  const {
    sales = [],
    
    kpiSales = [],
    kpiOverdueAccounts = [],
    overdueSummary = [],
    overdueCustomers = [],
    overdueCategories = [],

    salesType = [],
    salesBranch = [],
    salesBranch_Type = [],
   
    salesComparativeMTD = [],
    salesComparativeYTD = [],

    filters,
    error,
    loading,
  } = useSelector((state) => state.powerbi);

  // const branchCode = branchId ?? null;
  // const isBranchView = !!branchCode;

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
   [], // salesChannel,
    salesComparativeMTD,
    salesComparativeYTD,
    filters,
  );

  // const {
  //   currentYearStart,
  //   currentMonthStart,
  //   today,
  //   lastYearStart,
  //   lastYearMonthStart,
  //   lastYearToday,
  // } = getDateRanges();

  // const dates = getDateRanges();

  useEffect(() => {
    dispatch(
      getSalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
      }),
    );

    // dispatch(
    //   getLastYearMonthlySales({
    //     clientid: 1,
    //     startDate: dates.lastYearStart,
    //     endDate: dates.lastYearToday,
    //     branchcode: branchId,
    //   }),
    // );

    // dispatch(
    //   getMonthlySales({
    //     clientid: 1,
    //     startDate: dates.currentYearStart,
    //     endDate: dates.today,
    //     branchcode: branchId,
    //   }),
    // );

    // dispatch(
    //   getMonthToDateSales({
    //     clientid: 1,
    //     startDate: dates.currentMonthStart,
    //     endDate: dates.today,
    //     branchcode: branchId,
    //   }),
    // );

    // dispatch(
    //   getLastYearMonthToDateSales({
    //     clientid: 1,
    //     startDate: dates.lastYearMonthStart,
    //     endDate: dates.lastYearToday,
    //     branchcode: branchId,
    //   }),
    // );

    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch,
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
      getKPISalesTransactions({
        ...params,
        groupBy: "COMPARATIVE_MTD",
      }),
    );

     dispatch(
      getKPISalesTransactions({
        ...params,
        groupBy: "COMPARATIVE_YTD",
      }),
    );

    dispatch(
      getKPIOverdueAccounts({
        clientid: 1,
        mode: "AGING",
        accountType: "CUSTOMER",
        branchcode: filters.branch,
        dateFrom: filters.startDate,
        dateTo: filters.endDate,
        periodFrom: getPeriod(filters.startDate),
        periodTo: getPeriod(filters.endDate),
        includeZeroBal: false,
      }),
    );
  }, [dispatch,]);

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
        branchcode: filters.branch,
      }),
    );

    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
        branchcode: filters.branch,
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
      getKPISalesTransactions({
        ...params,
        groupBy: "COMPARATIVE_MTD",
      }),
    );

     dispatch(
      getKPISalesTransactions({
        ...params,
        groupBy: "COMPARATIVE_YTD",
      }),
    );
    
    dispatch(
      getKPIOverdueAccounts({
        clientid: 1,
        mode: "AGING",
        accountType: "CUSTOMER",
        branchcode: filters.branch,
        dateFrom: filters.startDate,
        dateTo: filters.endDate,
        periodFrom: getPeriod(filters.startDate),
        periodTo: getPeriod(filters.endDate),
        includeZeroBal: "false",
      }),
    );
  };
  // const selectedBranchName =
  //   filters.branch == null || filters.branch === ""
  //     ? "All Branches"
  //     : (salesBranch || []).find(
  //         (m) => Number(m.branch_id) === Number(filters.branch),
  //       )?.branch_name || "";
        
  document.title = "Sales Dashboard | phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Sales"
          pageTitle="Dashboards"
          subtitle=
          {selectedBranchName}
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
            selectedBranchName={selectedBranchName}
            rightClickBtn={toggleRightColumn}
            loading={loading}
            error={error}
          />
        </Row>
        <Row>
          <Col xl={6}>
         
              <BranchPerformance
                branchData={branchData}
                chartSeries={branchChartSeries}
                categories={branchCategories}
                totalRevenue={totalRevenue}
                formatAmount={formatAmount}
                loading={loading}
                error={error}
              />
            
          </Col>

          <Col xl={6}>
          
              {/* <TopProducts data={topProducts} error={error} loading={loading} /> */}
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
        </Row>

        <Row>
          <Col xl={6}>
            <SalesmanRevenue
              sales={sales}
              data={salesmanData}
              formatAmount={formatAmount}
              error={error}
              loading={loading}
            />
          </Col>

          {/* <Col xl={4}>

          </Col> */}

          <Col xl={6}>
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
                  branch={filters.branch}
                    dateRange={filters.dateRange}
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    onBranchChange={(value) =>
                      dispatch(setBranch(value === "" ? null : Number(value)))
                    }
                      onBranchNameChange={setSelectedBranchName}

                    onDateRangeChange={(value) =>
                      dispatch(setDateRange(value))
                    }
                    onStartDateChange={(value) =>
                      dispatch(setStartDate(value))
                    }
                    onEndDateChange={(value) =>
                      dispatch(setEndDate(value))
                    }
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
