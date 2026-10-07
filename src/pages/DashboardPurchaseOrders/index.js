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
// import RecentActivity from "./RecentActivity";
import {
  getPurchaseOrders,
  getActualSpend,
  getDailySpend,
  getLastYearActualSpend,
  getLastYearDailySpend,
  getKPIPurchases,
    getKPIMaverickSpend,
    getKPIPriceAlerts,
    getKPILeadTime,
    getGoodsReceived,
     getBestPricePerSupplier,
} from "../../slices/dashboardPurchase/thunk";
import {
getKPIOverdueAccounts
} from "../../slices/dashboardSales/thunk";
 import { clearPurchaseOrdersData } from "../../slices/dashboardPurchase/reducer";
import usePurchaseOrders from "../../Components/Hooks/usePurchaseOrders";
import BestPrices from "./BestPrices";
import {
  getDateRanges,
  getPreviousYearDate,
  getPeriod,
} from "../../helpers/date_helper";

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

const LEAD_TIME_GROUP_BYS = [
  "SUMMARY",
  "SUPPLIER",
  "PO_DETAILS",
  "MONTH",
  "BRANCH",
];
const PRICE_ALERTS_GROUP_BYS = [
  "SUMMARY",
  "ITEM_ALERTS",
  "ITEM_HISTORY",
];
const MAVERICK_SPEND_GROUP_BYS = [
  "SUMMARY",
  "SUPPLIER",
  "BRANCH",
  "OFF_PO_INVOICES",
  "PO_PRICE_VARIANCE",
];

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
  kpiOverdueAccounts = [],

  KPISummary = [],
  KPICategory = [],
  KPISupplier = [],
  KPIBranch = [],
  KPIMonthly = [],
  KPIType = [],

  KPIMaverickSpend = [],
  KPIMaverickSpendSummary = [],
  KPIMaverickSpendSupplier = [],
  KPIMaverickSpendBranch = [],
  KPIMaverickSpendOffPOInvoices = [],
  KPIMaverickSpendPOPriceVariance = [],

  // Price Alerts
  KPIPriceAlerts = [],
  KPIPriceAlertsSummary = [],
  KPIPriceAlertsItems = [],
  KPIPriceAlertsHistory = [],

  BestPricePerSupplier = [],

  KPILeadTime = [],
  KPILeadTimeSummary = [],
  KPILeadTimeSupplier = [],
  KPILeadTimePODetails = [],
  KPILeadTimeMonth = [],
  KPILeadTimeBranch = [],

  GoodsReceived = [],
  LastYearGoodsReceived = [],

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
loading,
  error,
  filters,
} = useSelector((state) => state.PurchaseOrders);

  const {
    formatAmount,
    totalSpend,
    activeSuppliers,
    avgLeadTime,
      priceAlerts,
  maverickSpend,
  maverickSpendPercentage,
    topSuppliers,
    top2Suppliers,
    branchData,
    actualSpendChart,
    monthToDateChart,
    bottomSuppliers,
    spendByCategory,
     currentReceivables,
    overdue31To60,
    overdue61To90,
    overdue91To120,
    overdue120Plus,
    overdueSupplierAccounts,
    bestPricePerSupplier,
  } = usePurchaseOrders(
    
  PurchaseOrders,

  KPIPurchases,
  KPISummary,
  KPICategory,
  KPISupplier,
  KPIBranch,
  KPIMonthly,
  KPIType,

  KPIMaverickSpend,
  KPIMaverickSpendSummary,
  KPIMaverickSpendSupplier,
  KPIMaverickSpendBranch,
  KPIMaverickSpendOffPOInvoices,
  KPIMaverickSpendPOPriceVariance,

  KPIPriceAlerts,
  KPIPriceAlertsSummary,
  KPIPriceAlertsItems,
  KPIPriceAlertsHistory,

  BestPricePerSupplier,

  KPILeadTime,
  KPILeadTimeSummary,
  KPILeadTimeSupplier,
  KPILeadTimePODetails,
  KPILeadTimeMonth,
  KPILeadTimeBranch,

  GoodsReceived,
  LastYearGoodsReceived,

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

  kpiOverdueAccounts,
  filters
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

useEffect(() => {

  // ----------------------------------------------
  // PURCHASE ORDERS
  // ----------------------------------------------

  // dispatch(
  //   getPurchaseOrders({
  //     clientid: 1,
  //     startDate: filters.startDate,
  //     endDate: filters.endDate,
  //     branchcode: branchId ,
  //   })
  // );

  dispatch(
  getBestPricePerSupplier({
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: branchId,
    itemCode: "",
    supplierCode: "",
    groupBy: "ITEM_MATRIX",
    includeZeroPrice: false,
    topN: 0,
  })
);

const goodsReceivedParams = {
  clientid: 1,
  branchcode: branchId,
};

dispatch(
  getGoodsReceived({
    ...goodsReceivedParams,
    startDate: filters.startDate,
    endDate: filters.endDate,
  })
);

dispatch(
  getGoodsReceived({
    ...goodsReceivedParams,
    startDate: getPreviousYearDate(filters.startDate),
    endDate: getPreviousYearDate(filters.endDate),
  })
);

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

   dispatch(
        getKPIOverdueAccounts({
          clientid: 1,
        mode: "AGING",
        accountType: "SUPPLIER",
          branchcode: branchId,
      dateFrom:  filters.startDate,
    dateTo:  filters.endDate,
    periodFrom: getPeriod(filters.startDate),
      periodTo: getPeriod(filters.endDate),
    includeZeroBal: false,
        }),
      );

      dispatchGroupByRequests(
  getKPILeadTime,
  {
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: branchId,
    supplier_code: "",
    TopN: 0,
  },
  LEAD_TIME_GROUP_BYS
);

dispatchGroupByRequests(
  getKPIPriceAlerts,
  {
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: branchId,
    ThresholdPerc: 10,
    ChangeType: "ALL",
    ItemCode: "",
    IncludeZeroPrice: false,
    TopN: 0,
  },
  PRICE_ALERTS_GROUP_BYS
);
dispatchGroupByRequests(
  getKPIMaverickSpend,
  {
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: branchId,
    TopN: 0,
  },
  MAVERICK_SPEND_GROUP_BYS
);

}, [dispatch, branchId]);

  useEffect(() => {
    return () => {
      dispatch(clearPurchaseOrdersData());
    };
  }, [dispatch]);

const handleApplyFilters = () => {
  // dispatch(
  //   getPurchaseOrders({
  //     clientid: 1,
  //     startDate: filters.startDate,
  //     endDate: filters.endDate,
  //     branchcode: filters.branch ?? null,
  //   })
  // );

const goodsReceivedParams = {
  clientid: 1,
  branchcode: filters.branch ?? null,
};

dispatch(
  getGoodsReceived({
    ...goodsReceivedParams,
    startDate: filters.startDate,
    endDate: filters.endDate,
  })
);

dispatch(
  getGoodsReceived({
    ...goodsReceivedParams,
    startDate: getPreviousYearDate(filters.startDate),
    endDate: getPreviousYearDate(filters.endDate),
  })
);

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

   dispatch(
        getKPIOverdueAccounts({
          clientid: 1,
        mode: "AGING",
        accountType: "SUPPLIER",
          branchcode: filters.branch ?? null,
      dateFrom:  filters.startDate,
    dateTo:  filters.endDate,
    periodFrom: getPeriod(filters.startDate),
      periodTo: getPeriod(filters.endDate),
    includeZeroBal: false,
        }),
      );

           dispatchGroupByRequests(
  getKPILeadTime,
  {
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: filters.branch ?? null,
    supplier_code: "",
    TopN: 0,
  },
  LEAD_TIME_GROUP_BYS
);

dispatchGroupByRequests(
  getKPIPriceAlerts,
  {
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: filters.branch ?? null,
    ThresholdPerc: 10,
    ChangeType: "ALL",
    ItemCode: "",
    IncludeZeroPrice: false,
    TopN: 0,
  },
  PRICE_ALERTS_GROUP_BYS
);
  dispatch(
  getBestPricePerSupplier({
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: filters.branch ?? null,
    itemCode: "",
    supplierCode: "",
    groupBy: "ITEM_MATRIX",
    includeZeroPrice: false,
    topN: 0,
  })
);

dispatchGroupByRequests(
  getKPIMaverickSpend,
  {
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: filters.branch ?? null,
    TopN: 0,
  },
  MAVERICK_SPEND_GROUP_BYS
);

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
                ? KPIBranch.find(
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
                    priceAlerts={priceAlerts}
                    maverickSpend={maverickSpend}
                    maverickSpendPercentage={maverickSpendPercentage}
                    error={error}
                    loading={loading}
                  />
                </Row>
                <Row>
                  <Col xl={6}>
                    {isBranchView ? (
                      <SalesByLocations
                        data={spendByCategory}
                        totalSpend={totalSpend}
                        error={error}
                        loading={loading}
                      />
                    ) : (
                      <StoreVisits
                        data={branchData}
                        error={error}
                        loading={loading}
                      />
                    )}
                  </Col>

                  <Col xl={6}>
                    {isBranchView ? (
                      <SupplierSpendBottom
                        supplierData={bottomSuppliers}
                        error={error}
                        loading={loading}
                      />
                    ) : (
                      <SalesByLocations
                        data={spendByCategory}
                        totalSpend={totalSpend}
                        error={error}
                        loading={loading}
                      />
                    )}
                  </Col>
                  <Row>
                    <Col xl={4}>
                      <SupplierSpend
                        supplierData={topSuppliers}
                        top2Suppliers={top2Suppliers}
                        totalSpend={totalSpend}
                        loading={loading}
                        error={error}
                      />
                    </Col>
                    <Col xl={4}>
                      <BestPrices
                        bestPricePerSupplier={bestPricePerSupplier}
                        error={error}
                        loading={loading}
                      />
                    </Col>
                    <Col xl={4}>
                      <RecentOrders
                        formatAmount={formatAmount}
                        overdueSupplierAccounts={overdueSupplierAccounts}
                        currentReceivables={currentReceivables}
                        overdue31To60={overdue31To60}
                        overdue61To90={overdue61To90}
                        overdue91To120={overdue91To120}
                        overdue120Plus={overdue120Plus}
                        error={error}
                        loading={loading}
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
