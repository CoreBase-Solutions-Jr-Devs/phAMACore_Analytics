import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ConsolidatedLPOReviewTable from "../ConsolidatedLPOReview/ConsolidatedLPOReviewTable";
import ConsolidatedLPOReviewCards from "../ConsolidatedLPOReview/ConsolidatedLPOReviewCards";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { getKPIConsolidatedLPOReview} from "../../../slices/dashboardPurchase/ConsolidatedLPOReview/thunk";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardPurchase/ConsolidatedLPOReview/reducer";
import { clearConsolidatedLPOReviewData } from "../../../slices/dashboardPurchase/ConsolidatedLPOReview/reducer";
import usePurchaseOrders from "../../../Components/Hooks/usePurchaseOrders";

const ConsolidatedLPOReview = () => {
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
 KPIConsolidatedLPOReviewConsolidatedList = [],
  KPIConsolidatedLPOReviewSummary = [],
  KPIConsolidatedLPOReviewSupplier = [],
  KPIConsolidatedLPOReviewBranch = [],
  KPIConsolidatedLPOReviewDrilldown = [],

    loading,
    error,
    filters,
  } = useSelector((state) => state.consolidatedLPOReview);

const {
  ConsolidatedLPOReviewConsolidatedListData,
  ConsolidatedLPOReviewSummaryData,
  ConsolidatedLPOReviewSupplierData,
  ConsolidatedLPOReviewBranchData,
  ConsolidatedLPOReviewDrilldownData,
} = usePurchaseOrders(
  [], // PurchaseOrders
  [], // KPIPurchases
  [], // KPISummary
  [], // KPICategory
  [], // KPISupplier
  [], // KPIBranch
  [], // KPIMonthly
  [], // KPIType

  [], // KPIMaverickSpend
  [], // KPIMaverickSpendSummary
  [], // KPIMaverickSpendSupplier
  [], // KPIMaverickSpendBranch
  [], // KPIMaverickSpendOffPOInvoices
  [], // KPIMaverickSpendPOPriceVariance

  [], // KPIPriceAlerts
  [], // KPIPriceAlertsSummary
  [], // KPIPriceAlertsItems
  [], // KPIPriceAlertsHistory

  [], // KPILeadTime
  [], // KPILeadTimeSummary
  [], // KPILeadTimeSupplier
  [], // KPILeadTimePODetails
  [], // KPILeadTimeMonth
  [], // KPILeadTimeBranch

  [], // GoodsReceived
  [], // LastYearGoodsReceived

  [], // ActualSpend
  [], // ActualSpendSummary
  [], // ActualSpendCategory
  [], // ActualSpendSupplier
  [], // ActualSpendBranch
  [], // ActualSpendMonthly
  [], // ActualSpendType

  [], // DailySpend
  [], // DailySpendSummary
  [], // DailySpendCategory
  [], // DailySpendSupplier
  [], // DailySpendBranch
  [], // DailySpendMonthly
  [], // DailySpendType

  [], // LastYearActualSpend
  [], // LastYearActualSpendSummary
  [], // LastYearActualSpendCategory
  [], // LastYearActualSpendSupplier
  [], // LastYearActualSpendBranch
  [], // LastYearActualSpendMonthly
  [], // LastYearActualSpendType

  [], // LastYearDailySpend
  [], // LastYearDailySpendSummary
  [], // LastYearDailySpendCategory
  [], // LastYearDailySpendSupplier
  [], // LastYearDailySpendBranch
  [], // LastYearDailySpendMonthly
  [], // LastYearDailySpendType

  [], // kpiOverdueAccounts

  [], // KPISupplierOrderFillRateSummary
  [], // KPISupplierOrderFillRateSupplierOFR
  [], // KPISupplierOrderFillRateOrderDrilldown
  [], // KPISupplierOrderFillRateBranch

  [], // KPISupplierReturnsSummary
  [], // KPISupplierReturnsSupplier
  [], // KPISupplierReturnsDrilldown
  [], // KPISupplierReturnsBranch
  [], // KPISupplierReturnsSKU
  [], // KPISupplierReturnsReason

  KPIConsolidatedLPOReviewConsolidatedList,
  KPIConsolidatedLPOReviewSummary,
  KPIConsolidatedLPOReviewSupplier,
  KPIConsolidatedLPOReviewBranch,
  KPIConsolidatedLPOReviewDrilldown,

  filters
);

  useEffect(() => {
    const params = {
      clientid: 1,
      branchcode: filters.branch,
      startDate: filters.startDate,
      endDate: filters.endDate,
      TopN: 0,
      status: "All",
    };
    dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "SUMMARY",
      }),
    );
    dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "SUPPLIER",
      }),
    );
    dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "ITEM_DRILLDOWN",
      }),
    );
    dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "BRANCH",
      }),
    );
      dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "CONSOLIDATED_LIST",
      }),
    );
    //   dispatch(
    //   getKPISupplierReturns({
    //     ...params,
    //     groupBy: "SKU",
    //   }),
    // );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearConsolidatedLPOReviewData());
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
   const params = {
      clientid: 1,
      branchcode: filters.branch,
      startDate: filters.startDate,
      endDate: filters.endDate,
      TopN: 0,
      status: "All",
    };
    dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "SUMMARY",
      }),
    );
    dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "SUPPLIER",
      }),
    );
    dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "ITEM_DRILLDOWN",
      }),
    );
    dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "BRANCH",
      }),
    );
      dispatch(
      getKPIConsolidatedLPOReview({
        ...params,
        groupBy: "CONSOLIDATED_LIST",
      }),
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title="Consolidated-LPO-Review"
            pageTitle="Purchases"
            subtitle={selectedBranchName}
          />
          <div
  className={`d-flex justify-content-end flex-wrap gap-4 p-1 mb-0 ${
  isSticky ? "bg-white border-top border-bottom shadow-sm" : ""
}`}
  style={{
    position: "sticky",
    top: "70px",
    zIndex: 1030,
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
              <ConsolidatedLPOReviewCards
                rightClickBtn={toggleRightColumn}
                selectedBranchName={selectedBranchName}
                ConsolidatedLPOReviewSummaryData={
                  ConsolidatedLPOReviewSummaryData
                }
                error={error}
                loading={loading}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <ConsolidatedLPOReviewTable
                ConsolidatedLPOReviewSupplier={ConsolidatedLPOReviewSupplierData}
 ConsolidatedLPOReviewDrilldown={ConsolidatedLPOReviewDrilldownData}
  ConsolidatedLPOReviewBranch={ConsolidatedLPOReviewBranchData}
  ConsolidatedLPOReviewConsolidatedList={ConsolidatedLPOReviewConsolidatedListData}
  // SupplierReturnsReason={SupplierReturnsReasonData}
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

export default ConsolidatedLPOReview;
