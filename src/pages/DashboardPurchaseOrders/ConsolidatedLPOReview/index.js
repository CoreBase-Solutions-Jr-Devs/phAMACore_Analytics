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
  // const selectedBranchName =
  //   filters.branch == null || filters.branch === ""
  //     ? "All Branches"
  //     : (salesBranch || []).find(
  //         (m) => Number(m.branch_ID) === Number(filters.branch),
  //       )?.branch_name || "";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title="Purchases"
            pageTitle="Dashboards"
            subtitle={selectedBranchName}
          />
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
