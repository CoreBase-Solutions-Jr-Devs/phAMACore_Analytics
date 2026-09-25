import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Widget from "./Widgets";
import StoreVisits from "./StoreVisits";
import SalesByLocations from "./SalesByLocations";
import YearToDatePurchases from "./YearToDatePurchases";
import MonthToDatePurchases from "./MonthToDatePurchases";
import SupplierSpendBottom from "./SupplierSpendBottom";
import FilterActions from "./FilterActions";
import SupplierSpend from "./SupplierSpend";
import RecentOrders from "./RecentOrders";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import RecentActivity from "./RecentActivity";

import {
  getPurchaseOrders,
  getActualSpend,
  getDailySpend,
  getLastYearActualSpend,
  getLastYearDailySpend,
  getKPIPurchases,
} from "../../slices/dashboardPurchase/thunk";

import { clearPurchaseOrdersData } from "../../slices/dashboardPurchase/reducer";

import usePurchaseOrders from "../../Components/Hooks/usePurchaseOrders";

// --------------------------------------------------
// GROUP BY CONFIGURATION
// --------------------------------------------------

const KPI_GROUP_BYS = [
  "SUMMARY",
  "CATEGORY",
  "SUPPLIER",
  "BRANCH",
  "MONTHLY",
  "TYPE",
];

const ACTUAL_SPEND_GROUP_BYS = [
  "SUMMARY",
  "CATEGORY",
  "SUPPLIER",
  "TYPE",
  "BRANCH",
  "MONTHLY",
];

const DAILY_SPEND_GROUP_BYS = [
  "MONTHLY",
  "SUMMARY",
  "TYPE",
  "SUPPLIER",
  "BRANCH",
  "CATEGORY",
];

const LAST_YEAR_ACTUAL_SPEND_GROUP_BYS = [
  "SUMMARY",
  "SUPPLIER",
  "CATEGORY",
  "TYPE",
  "MONTHLY",
  "BRANCH",
];

const LAST_YEAR_DAILY_SPEND_GROUP_BYS = [
  "MONTHLY",
  "CATEGORY",
  "SUPPLIER",
  "SUMMARY",
  "TYPE",
  "BRANCH",
];

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const DashboardPurchaseOrders = () => {
  document.title = "Purchases Dashboard | phAMACore Analytics";

  const { branchId } = useParams();

  const branchCode = branchId ?? null;
  const isBranchView = !!branchCode;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

 const {
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

   LastYearActualSpend =[],
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

  filters,
} = useSelector((state) => state.PurchaseOrders);

  const {
    formatAmount,
    totalSpend,
    activeSuppliers,
    avgLeadTime,
    topSuppliers,
    top2Suppliers,
    branchData,
    actualSpendChart,
    monthToDateChart,
    OverdueAccounts,
    bottomSuppliers,
    spendByCategory,
  } = usePurchaseOrders(
  PurchaseOrders,

  KPIPurchases,
  KPISummary,
  KPICategory,
  KPISupplier,
  KPIBranch,
  KPIMonthly,
  KPIType,

   ActualSpend,
  ActualSpendSummary,
  ActualSpendCategory,
  ActualSpendSupplier,
  ActualSpendBranch,
  ActualSpendMonthly,
  ActualSpendType,

   DailySpend,
  DailySpendSummary,
  DailySpendCategory,
  DailySpendSupplier,
  DailySpendBranch,
  DailySpendMonthly,
  DailySpendType,

   LastYearActualSpend,
  LastYearActualSpendSummary,
  LastYearActualSpendCategory,
  LastYearActualSpendSupplier,
  LastYearActualSpendBranch,
  LastYearActualSpendMonthly,
  LastYearActualSpendType,

   LastYearDailySpend,
  LastYearDailySpendSummary,
  LastYearDailySpendCategory,
  LastYearDailySpendSupplier,
  LastYearDailySpendBranch,
  LastYearDailySpendMonthly,
  LastYearDailySpendType,

  filters
);
  // --------------------------------------------------
  // DATE HELPERS
  // --------------------------------------------------

  const getPreviousYearDate = (dateString) => {
    const [day, month, year] = dateString.split("/");

    return `${day}/${month}/${Number(year) - 1}`;
  };

const getDateRanges = () => {
  const today = new Date();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  return {
    // Current year
    currentYearStart: new Date(
      currentYear,
      0,
      1
    ).toLocaleDateString("en-GB"),

    // Current month
    currentMonthStart: new Date(
      currentYear,
      currentMonth,
      1
    ).toLocaleDateString("en-GB"),

    // Today
    today: today.toLocaleDateString("en-GB"),

    // Previous year
    lastYearStart: new Date(
      currentYear - 1,
      0,
      1
    ).toLocaleDateString("en-GB"),

    // Same month last year
    lastYearMonthStart: new Date(
      currentYear - 1,
      currentMonth,
      1
    ).toLocaleDateString("en-GB"),

    // Same day last year
    lastYearToday: new Date(
      currentYear - 1,
      currentMonth,
      currentDay
    ).toLocaleDateString("en-GB"),
  };
};

  // --------------------------------------------------
  // DISPATCH MULTIPLE GROUP BY REQUESTS
  // --------------------------------------------------

  const dispatchGroupByRequests = (
    thunk,
    commonParams,
    groupBys
  ) => {
    groupBys.forEach((groupBy) => {
      dispatch(
        thunk({
          ...commonParams,
          groupBy,
        })
      );
    });
  };

  // --------------------------------------------------
  // INITIAL DATA LOAD
  // --------------------------------------------------

useEffect(() => {
  const dates = getDateRanges();

  // ----------------------------------------------
  // PURCHASE ORDERS
  // ----------------------------------------------

  dispatch(
    getPurchaseOrders({
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: branchId ,
    })
  );

  // ----------------------------------------------
  // ACTUAL SPEND - CURRENT YEAR YTD
  // ----------------------------------------------

  dispatchGroupByRequests(
    getActualSpend,
    {
      clientid: 1,
      startDate: dates.currentYearStart,
      endDate: dates.today,
      branchcode: branchId ,
    },
    ACTUAL_SPEND_GROUP_BYS
  );

  // ----------------------------------------------
  // DAILY SPEND - CURRENT MONTH MTD
  // ----------------------------------------------

  dispatchGroupByRequests(
    getDailySpend,
    {
      clientid: 1,
      startDate: dates.currentMonthStart,
      endDate: dates.today,
      branchcode: branchId ,
    },
    DAILY_SPEND_GROUP_BYS
  );

  // ----------------------------------------------
  // LAST YEAR ACTUAL SPEND - PREVIOUS YEAR YTD
  // ----------------------------------------------

  dispatchGroupByRequests(
    getLastYearActualSpend,
    {
      clientid: 1,
      startDate: dates.lastYearStart,
      endDate: dates.lastYearToday,
      branchcode: branchId ,
    },
    LAST_YEAR_ACTUAL_SPEND_GROUP_BYS
  );

  // ----------------------------------------------
  // LAST YEAR DAILY SPEND - PREVIOUS YEAR MTD
  // ----------------------------------------------

  dispatchGroupByRequests(
    getLastYearDailySpend,
    {
      clientid: 1,
      startDate: dates.lastYearMonthStart,
      endDate: dates.lastYearToday,
      branchcode: branchId ,
    },
    LAST_YEAR_DAILY_SPEND_GROUP_BYS
  );

  // ----------------------------------------------
  // KPI PURCHASES
  // ----------------------------------------------

  dispatchGroupByRequests(
    getKPIPurchases,
    {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: branchId ,
      TopN: 0,
    },
    KPI_GROUP_BYS
  );
}, [dispatch, branchId]);

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      dispatch(clearPurchaseOrdersData());
    };
  }, [dispatch]);

  // --------------------------------------------------
  // APPLY FILTERS
  // --------------------------------------------------

const handleApplyFilters = () => {
  // ----------------------------------------------
  // PURCHASE ORDERS
  // ----------------------------------------------

  dispatch(
    getPurchaseOrders({
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch ?? null,
    })
  );

  // ----------------------------------------------
  // KPI PURCHASES
  // ----------------------------------------------

  dispatchGroupByRequests(
    getKPIPurchases,
    {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch ?? null,
      TopN: 0,
    },
    KPI_GROUP_BYS
  );

  // ----------------------------------------------
  // YEAR TO DATE
  // ----------------------------------------------

  if (filters.dateRange === "Year To Date") {
    // Current year YTD
    dispatchGroupByRequests(
      getActualSpend,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch ?? null,
      },
      ACTUAL_SPEND_GROUP_BYS
    );

    // Previous year YTD
    dispatchGroupByRequests(
      getLastYearActualSpend,
      {
        clientid: 1,
        startDate: getPreviousYearDate(filters.startDate),
        endDate: getPreviousYearDate(filters.endDate),
        branchcode: filters.branch ?? null,
      },
      LAST_YEAR_ACTUAL_SPEND_GROUP_BYS
    );
  }

  // ----------------------------------------------
  // MONTH TO DATE
  // ----------------------------------------------

  if (filters.dateRange === "Month To Date") {
    // Current year MTD
    dispatchGroupByRequests(
      getDailySpend,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch ?? null,
      },
      DAILY_SPEND_GROUP_BYS
    );

    // Previous year MTD
    dispatchGroupByRequests(
      getLastYearDailySpend,
      {
        clientid: 1,
        startDate: getPreviousYearDate(filters.startDate),
        endDate: getPreviousYearDate(filters.endDate),
        branchcode: filters.branch ?? null,
      },
      LAST_YEAR_DAILY_SPEND_GROUP_BYS
    );
  }

  // ----------------------------------------------
  // NAVIGATION
  // ----------------------------------------------

  if (filters.branch) {
    navigate(
      `/dashboard-purchase-orders/branch/${filters.branch}`
    );
  } else {
    navigate("/dashboard-purchase-orders");
  }
};


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title="Purchases"
            pageTitle="Dashboards"
            subtitle={
              isBranchView
                ? PurchaseOrders.find(
                    (item) => item.branch_ID === Number(branchCode),
                  )?.branch_name
                : undefined
            }
          />
          <Row>
            <Col>
              <div className="h-100">
                <Row>
                  <Widget
                    rightClickBtn={toggleRightColumn}
                    formatAmount={formatAmount}
                    totalSpend={totalSpend}
                    activeSuppliers={activeSuppliers}
                    avgLeadTime={avgLeadTime}
                  />
                </Row>
                <Row>
                  <Col xl={6}>
                    {isBranchView ? (
                      <StoreVisits
                        data={branchData}
                        formatAmount={formatAmount}
                      />
                    ) : (
                      <StoreVisits
                        data={branchData}
                        formatAmount={formatAmount}
                      />
                    )}
                  </Col>

                  <Col xl={6}>
                    {isBranchView ? (
                      <SupplierSpendBottom
                        supplierData={bottomSuppliers}
                        formatAmount={formatAmount}
                      />
                    ) : (
                     <SalesByLocations 
  data={spendByCategory} 
  totalSpend={totalSpend} 
  formatAmount={formatAmount} 
/>
                    )}
                  </Col>
                  <Row>
                    <Col xl={6}>
                      <SupplierSpend
                        supplierData={topSuppliers}
                        formatAmount={formatAmount}
                        top2Suppliers={top2Suppliers}
                        totalSpend={totalSpend}
                      />
                    </Col>
                    <Col xl={6}>
                      <RecentOrders
                        data={PurchaseOrders}
                        OverdueAccounts={OverdueAccounts}
                      />
                    </Col>
                  </Row>
                </Row>

                <Row>
                  <Col xl={6}>
                    <YearToDatePurchases
                      categories={actualSpendChart.categories}
                      series={actualSpendChart.series}
                      formatAmount={formatAmount}
                    />
                  </Col>
                  <Col xl={6}>
                    <MonthToDatePurchases
                      categories={monthToDateChart.categories}
                      series={monthToDateChart.series}
                      formatAmount={formatAmount}
                    />
                  </Col>
                </Row>
              </div>
            </Col>
            <FilterActions
              onApply={handleApplyFilters}
              rightColumn={rightColumn}
              hideRightColumn={toggleRightColumn}
            />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardPurchaseOrders;
