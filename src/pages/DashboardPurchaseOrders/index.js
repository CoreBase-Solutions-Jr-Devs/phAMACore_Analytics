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
// import FilterActions from "./FilterActions";
import SupplierSpend from "./SupplierSpend";

import BreadCrumb from "../../Components/Common/BreadCrumb";
// import RecentActivity from "./RecentActivity";
import {

  getActualSpend,

  getLastYearActualSpend,
 
  getKPIPurchases,
  getKPIMaverickSpend,
  getKPIPriceAlerts,
  getKPILeadTime,
  getGoodsReceived,
  getLastYearGoodsReceived,
  
} from "../../slices/dashboardPurchase/thunk";
import FilterActions from "../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../slices/dashboardPurchase/reducer";
import { getKPIOverdueAccounts } from "../../slices/dashboardSales/thunk";
import { clearPurchaseOrdersData } from "../../slices/dashboardPurchase/reducer";
import usePurchaseOrders from "../../Components/Hooks/usePurchaseOrders";
// import BestPrices from "./BestPrices";
import {
  getDateRanges,
  getPreviousYearDate,
  getPeriod,
} from "../../helpers/date_helper";
import { getKPIConsolidatedLPOReview } from "../../slices/dashboardPurchase/ConsolidatedLPOReview/thunk";
import { groupBy } from "lodash";

const KPI_GROUP_BYS = [
  "SUMMARY",
 
  "SUPPLIER",
  "BRANCH",
  // "MONTHLY",
  "TYPE",
];

// const ACTUAL_SPEND_GROUP_BYS = ["MONTHLY"];

const LEAD_TIME_GROUP_BYS = [
  "SUMMARY",
  "SUPPLIER",
  "PO_DETAILS",
  "MONTH",
  "BRANCH",
];
const PRICE_ALERTS_GROUP_BYS = ["SUMMARY", "ITEM_ALERTS", "ITEM_HISTORY"];
const MAVERICK_SPEND_GROUP_BYS = [
  "SUMMARY",
  "SUPPLIER",
  "BRANCH",
  "OFF_PO_INVOICES",
  // "PO_PRICE_VARIANCE",
];

const DashboardPurchaseOrders = () => {
  document.title = "Purchases Dashboard | phAMACore Analytics";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rightColumn, setRightColumn] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  const [selectedBranchName, setSelectedBranchName] = useState("All Branches");

  const {
    KPIPurchases = [],
    kpiOverdueAccounts = [],

    KPISummary = [],
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

    // BestPricePerSupplier = [],

    KPILeadTime = [],
    KPILeadTimeSummary = [],
    KPILeadTimeSupplier = [],
    KPILeadTimePODetails = [],
    KPILeadTimeMonth = [],
    KPILeadTimeBranch = [],

    GoodsReceived = [],
    LastYearGoodsReceived = [],

    ActualSpend = [],

    
    LastYearActualSpend= [],

    loading,
    error,
    filters,
  } = useSelector((state) => state.PurchaseOrders);

  const {
    KPIConsolidatedLPOReviewConsolidatedList = [],
    KPIConsolidatedLPOReviewSummary = [],
    KPIConsolidatedLPOReviewSupplier = [],
    KPIConsolidatedLPOReviewBranch = [],
    KPIConsolidatedLPOReviewDrilldown = [],
  } = useSelector((state) => state.consolidatedLPOReview);

  const {
    formatAmount,
    purchaseSummary,
    leadTimeSummary,
    priceAlertSummary,
    maverickSpendSummary,
    maverickSpendPercentage,
    spendBySupplier,
    branchData,
    actualSpendChart,
    monthToDateChart,  
    ConsolidatedLPOReviewSummaryData,
  } = usePurchaseOrders(
    KPIPurchases,
    KPISummary,
    [], //KPICategory,
    KPISupplier,
    KPIBranch,
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

    KPILeadTime,
    KPILeadTimeSummary,
    KPILeadTimeSupplier,
    KPILeadTimePODetails,
    KPILeadTimeMonth,
    KPILeadTimeBranch,

    GoodsReceived,
    LastYearGoodsReceived,
 
    ActualSpend,

    LastYearActualSpend,
    
    kpiOverdueAccounts,

    [], //KPISupplierOrderFillRateSummary,
    [], //KPISupplierOrderFillRateSupplierOFR,
    [], //KPISupplierOrderFillRateOrderDrilldown,
    [], //KPISupplierOrderFillRateBranch,

    [], //KPISupplierReturnsSummary,
    [], //KPISupplierReturnsSupplier,
    [], //KPISupplierReturnsDrilldown,
    [], //KPISupplierReturnsBranch,
    [], //KPISupplierReturnsSKU,
    [], //KPISupplierReturnsReason,

    [], //KPIConsolidatedLPOReviewConsolidatedList,
    KPIConsolidatedLPOReviewSummary,
    [], //KPIConsolidatedLPOReviewSupplier,
    [], //KPIConsolidatedLPOReviewBranch,
    [], //KPIConsolidatedLPOReviewDrilldown,

    [], //KPIBestPricePerSupplierItemMatrix,
    [], //KPIBestPricePerSupplierSupplierScorecard,
    [], //KPIBestPricePerSupplierBestPriceCatalog,
    [], //KPIBestPricePerSupplierProposedHistorical,

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

  const dispatchGroupByRequests = (thunk, commonParams, groupBys) => {
    groupBys.forEach((groupBy) => {
      dispatch(
        thunk({
          ...commonParams,
          groupBy,
        }),
      );
    });
  };

  useEffect(() => {

    dispatch(
      getKPIConsolidatedLPOReview({
        clientid: 1,
        branchcode: filters.branch,
        startDate: filters.startDate,
        endDate: filters.endDate,
        TopN: 0,
        status: "All",
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getGoodsReceived({
        startDate: dates.currentMonthStart,
        endDate: dates.today,
        clientid: 1,
        branchcode: filters.branch,
      }),
    );

    dispatch(
      getLastYearGoodsReceived({
        startDate: dates.lastYearMonthStart,
        endDate: dates.lastYearToday,
        clientid: 1,
        branchcode: filters.branch,
       
      }),
    );

    dispatch(
      getActualSpend({     
        clientid: 1,
        startDate: dates.currentYearStart,
        endDate: dates.today,
        branchcode: filters.branch,
         groupBy: "MONTHLY"
      }),     
    );

    dispatch(
      getLastYearActualSpend({
        clientid: 1,
        startDate: dates.lastYearStart,
        endDate: dates.lastYearToday,
        branchcode: filters.branch,
        groupBy: "MONTHLY"
      }),     
    );

    dispatchGroupByRequests(
      getKPIPurchases,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        TopN: 0,
      },
      KPI_GROUP_BYS,
    );

    

    dispatchGroupByRequests(
      getKPILeadTime,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        supplier_code: "",
        TopN: 0,
      },
      LEAD_TIME_GROUP_BYS,
    );

    dispatchGroupByRequests(
      getKPIPriceAlerts,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        ThresholdPerc: 10,
        ChangeType: "ALL",
        ItemCode: "",
        IncludeZeroPrice: false,
        TopN: 0,
      },
      PRICE_ALERTS_GROUP_BYS,
    );
    dispatchGroupByRequests(
      getKPIMaverickSpend,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        TopN: 0,
      },
      MAVERICK_SPEND_GROUP_BYS,
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearPurchaseOrdersData());
    };
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleApplyFilters = () => {
    dispatch(
      getGoodsReceived({
        startDate: dates.currentMonthStart,
        endDate: dates.today,
        clientid: 1,
        branchcode: filters.branch,
      }),
    );

    dispatch(
      getLastYearGoodsReceived({
        startDate: dates.lastYearMonthStart,
        endDate: dates.lastYearToday,
        clientid: 1,
        branchcode: filters.branch,
      }),
    );

       dispatch(
      getActualSpend({     
        clientid: 1,
        startDate: dates.currentYearStart,
        endDate: dates.today,
        branchcode: filters.branch,
         groupBy: "MONTHLY"
      }),     
    );

    dispatch(
      getLastYearActualSpend({
        clientid: 1,
        startDate: dates.lastYearStart,
        endDate: dates.lastYearToday,
        branchcode: filters.branch,
        groupBy: "MONTHLY"
      }),     
    );

    dispatch(
      getKPIConsolidatedLPOReview({
        clientid: 1,
        branchcode: filters.branch,
        startDate: filters.startDate,
        endDate: filters.endDate,
        TopN: 0,
        status: "All",
        groupBy: "SUMMARY",
      }),
    );

    dispatchGroupByRequests(
      getKPIPurchases,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        TopN: 0,
      },
      KPI_GROUP_BYS,
    );

    dispatchGroupByRequests(
      getKPILeadTime,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        supplier_code: "",
        TopN: 0,
      },
      LEAD_TIME_GROUP_BYS,
    );

    dispatchGroupByRequests(
      getKPIPriceAlerts,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        ThresholdPerc: 10,
        ChangeType: "ALL",
        ItemCode: "",
        IncludeZeroPrice: false,
        TopN: 0,
      },
      PRICE_ALERTS_GROUP_BYS,
    );  

    dispatchGroupByRequests(
      getKPIMaverickSpend,
      {
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        TopN: 0,
      },
      MAVERICK_SPEND_GROUP_BYS,
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title="Purchases"
            pageTitle="Dashboard"
            subtitle={selectedBranchName}
          />
          <div
            className={`d-flex justify-content-end flex-wrap gap-4 p-1 mb-0 ${
              isSticky ? "bg-white border-top border-bottom shadow-sm" : ""
            }`}
            style={{
              position: "sticky",
              top: "70px",
              zIndex: 100,
              width: "100%",
              marginTop: "-15px",
              // backgroundColor: "#",
            }}
          >
            <div className="d-flex align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-1">
                <span>Filtered From:</span>
                <strong>{filters?.startDate || ""}</strong> to{" "}
                <strong>{filters?.endDate || ""}</strong>
              </div>

              <div
                style={{
                  borderLeft: "2px solid #ced4da",
                  height: "12px",
                  margin: "0 4px",
                }}
              />

              <div className="d-flex align-items-center gap-1">
                <span>Selected Branch:</span>
                <strong>{selectedBranchName}</strong>
              </div>
              <div
                style={{
                  borderLeft: "2px solid #ced4da",
                  height: "12px",
                  margin: "0 4px",
                }}
              />
              <div className="d-flex align-items-center gap-1 no-print">
                <button
                  type="button"
                  className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
                  onClick={toggleRightColumn}
                >
                  <i className="ri-filter-fill"></i>
                  Filter
                </button>
              </div>
            </div>
          </div>
          <Row>
            <Col xl={12}>
              <Widget
                rightClickBtn={toggleRightColumn}
                formatAmount={formatAmount}
                purchaseSummary={purchaseSummary}
                ConsolidatedLPOReviewSummaryData={
                  ConsolidatedLPOReviewSummaryData
                }
                leadTimeSummary={leadTimeSummary}
                priceAlertSummary={priceAlertSummary}
                maverickSpendSummary={maverickSpendSummary}
                maverickSpendPercentage={maverickSpendPercentage}
                selectedBranchName={selectedBranchName}
                error={error}
                loading={loading}
              />
            </Col>
          </Row>
          <Row>
            <Col xl={12}>
              <StoreVisits data={branchData} error={error} loading={loading} />
            </Col>
          </Row>
          <Row>
            <Col xl={12}>
              <SupplierSpend
                supplierData={spendBySupplier}
                loading={loading}
                error={error}
              />
            </Col>
          </Row>
          <Row>
            <Col xl={6}>
              <MonthToDatePurchases
                categories={monthToDateChart.categories}
                series={monthToDateChart.series}
                formatAmount={formatAmount}
              />
            </Col>
            <Col xl={6}>
              <YearToDatePurchases
                categories={actualSpendChart.categories}
                series={actualSpendChart.series}
                formatAmount={formatAmount}
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
              onDateRangeChange={(value) => dispatch(setDateRange(value))}
              onStartDateChange={(value) => dispatch(setStartDate(value))}
              onEndDateChange={(value) => dispatch(setEndDate(value))}
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
