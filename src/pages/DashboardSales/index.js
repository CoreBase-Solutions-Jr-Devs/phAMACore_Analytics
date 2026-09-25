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

import { clearSalesData } from "../../slices/dashboardSales/reducer";
import useSalesAnalytics from "../../Components/Hooks/useSalesAnalytics";
// import { groupBy } from "lodash";

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
} = useSelector((state) => state.powerbi);

  const branchCode = branchId ?? null;
  const isBranchView = !!branchCode;

  const {
    formatAmount,
    totalRevenue,
    // revenueChange,
    cashSales,
    salesInvoices,
    cashInvoicesPercentage,
    salesInvoicesPercentage,
    cashSalesPercentage,
    // creditInvoicesPercentage,
    cashInvoices,
    ordersReceived,
    branchData,
    branchChartSeries,
    branchCategories,
    currentReceivables,
    overdue1To30,
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
    kpiSales,
    kpiOverdueAccounts,
    overdueSummary,
    overdueCustomers,
    overdueCategories,
      salesType,
  salesBranch,
  salesBranch_Type,
    monthlySales,
    monthToDateSales,
    lastYearMonthToDateSales,
    lastYearMonthlySales,
    filters,
  );

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

        startDate: new Date(
          new Date().getFullYear() - 1,
          0,
          1,
        ).toLocaleDateString("en-GB"),

        endDate: new Date(
          new Date().getFullYear() - 1,
          new Date().getMonth(),
          new Date().getDate(),
        ).toLocaleDateString("en-GB"),

        branchcode: branchId,
      }),
    );

    dispatch(
      getMonthlySales({
        clientid: 1,
        startDate: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString(
          "en-GB",
        ),

        endDate: new Date().toLocaleDateString("en-GB"),

        branchcode: branchId,
      }),
    );

    dispatch(
      getMonthToDateSales({
        clientid: 1,
        startDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ).toLocaleDateString("en-GB"),

        endDate: new Date().toLocaleDateString("en-GB"),

        branchcode: branchId,
      }),
    );

    dispatch(
      getLastYearMonthToDateSales({
        clientid: 1,
        startDate: new Date(
          new Date().getFullYear() - 1,
          new Date().getMonth(),
          1,
        ).toLocaleDateString("en-GB"),

        endDate: new Date(
          new Date().getFullYear() - 1,
          new Date().getMonth(),
          new Date().getDate(),
        ).toLocaleDateString("en-GB"),

        branchcode: branchId,
      }),
    );

    dispatch(
      getKPISalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: branchId,
        groupBy: "SUMMARY",
      }),
    );

   {
    const params = {
      clientid: 1,
      AsOfDate: filters.endDate,
        branchcode: branchId,
      OverdueOnly: true,
      MinBalance: 0,
    };

    dispatch(
      getKPIOverdueAccounts({
        ...params,
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getKPIOverdueAccounts({
        ...params,
        groupBy: "CUSTOMER",
      }),
    );

    dispatch(
      getKPIOverdueAccounts({
        ...params,
        groupBy: "CATEGORY",
      }),
    );
}

  }, [dispatch, branchId]);

  useEffect(() => {
    return () => {
      dispatch(clearSalesData());
    };
  }, [dispatch]);

  const getPreviousYearDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${day}/${month}/${Number(year) - 1}`;
  };
  const handleApplyFilters = () => {
    const branchcode = filters.branch ?? null;

    // Always fetch the main sales data
    dispatch(
      getSalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode,
      }),
    );

   const params = {
  clientid: 1,
  startDate: filters.startDate,
  endDate: filters.endDate,
  branchcode ,
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
{
    const params = {
      clientid: 1,
      AsOfDate: filters.endDate,
      branchcode,
      OverdueOnly: true,
      MinBalance: 0,
    };

    dispatch(
      getKPIOverdueAccounts({
        ...params,
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getKPIOverdueAccounts({
        ...params,
        groupBy: "CUSTOMER",
      }),
    );

    dispatch(
      getKPIOverdueAccounts({
        ...params,
        groupBy: "CATEGORY",
      }),
    );
}
    // Year To Date
    if (filters.dateRange === "Year To Date") {
      dispatch(
        getMonthlySales({
          clientid: 1,
          startDate: filters.startDate,
          endDate: filters.endDate,
          branchcode,
        }),
      );

      dispatch(
        getLastYearMonthlySales({
          clientid: 1,
          startDate: getPreviousYearDate(filters.startDate),
          endDate: getPreviousYearDate(filters.endDate),
          branchcode,
        }),
      );
    }

    // Month To Date
    if (filters.dateRange === "Month To Date") {
      dispatch(
        getMonthToDateSales({
          clientid: 1,
          startDate: filters.startDate,
          endDate: filters.endDate,
          branchcode,
        }),
      );

      dispatch(
        getLastYearMonthToDateSales({
          clientid: 1,
          startDate: getPreviousYearDate(filters.startDate),
          endDate: getPreviousYearDate(filters.endDate),
          branchcode,
        }),
      );
    }

    // Navigate according to selected branch
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
          subtitle={
            isBranchView
              ? sales.find((s) => s.branch_ID === Number(branchCode))
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
            salesPercentage={salesInvoicesPercentage}
            cashSalesPercentage={cashSalesPercentage}
            overdueDebtorsCount={overdueDebtorsCount}
            creditNotes={creditNotes}
            // revenueChange={revenueChange}
            cashInvoices={cashInvoices}
            // branchMap={branchMap}
            rightClickBtn={toggleRightColumn}
          />
        </Row>
        <Row className="mt-4">
          <Col xl={6}>
            {isBranchView ? (
              <TopProducts data={topProducts} />
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
              <BottomProducts data={bottomProducts} />
            ) : (
              <TopProducts data={topProducts} />
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
            <ReceivablesAgeing
              kpiOverdueAccounts={kpiOverdueAccounts}
              currentReceivables={currentReceivables}
              overdue1To30={overdue1To30}
              overdue31To60={overdue31To60}
              overdue61To90={overdue61To90}
              overdue91To120={overdue91To120}
              overdue120Plus={overdue120Plus}
              topDebtors={topDebtors}
              formatAmount={formatAmount}
            />
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
