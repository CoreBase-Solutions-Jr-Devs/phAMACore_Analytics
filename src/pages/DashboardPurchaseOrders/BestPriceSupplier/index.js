import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BestPricePerSupplierTable from "../BestPriceSupplier/BestPriceSupplierTable";
import BestPricePerSupplierCards from "../BestPriceSupplier/BestPriceSupplierCards";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { getKPIBestPricePerSupplier} from "../../../slices/dashboardPurchase/BestPriceSupplier/thunk";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardPurchase/BestPriceSupplier/reducer";
import { clearBestPricePerSupplierData } from "../../../slices/dashboardPurchase/BestPriceSupplier/reducer";
import usePurchaseOrders from "../../../Components/Hooks/usePurchaseOrders";

const BestPriceSupplier = () => {
  document.title = "Purchases Dashboard | phAMACore Analytics";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  const [selectedBranchName, setSelectedBranchName] = useState("All Branches");

  const {
KPIBestPricePerSupplierItemMatrix = [],
  KPIBestPricePerSupplierSupplierScorecard = [],
 KPIBestPricePerSupplierBestPriceCatalog = [],
 KPIBestPricePerSupplierProposedHistorical = [],
    loading,
    error,
    filters,
  } = useSelector((state) => state.bestPricePerSupplier);

const {
  BestPricePerSupplierItemMatrixData,
  BestPricePerSupplierSupplierScorecardData,
  BestPricePerSupplierBestPriceCatalogData,
  BestPricePerSupplierProposedHistoricalData, 
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

  [], // KPIConsolidatedLPOReviewConsolidatedList
  [], // KPIConsolidatedLPOReviewSummary
  [], // KPIConsolidatedLPOReviewSupplier
  [], // KPIConsolidatedLPOReviewBranch
  [], // KPIConsolidatedLPOReviewDrilldown

  KPIBestPricePerSupplierItemMatrix,
  KPIBestPricePerSupplierSupplierScorecard,
 KPIBestPricePerSupplierBestPriceCatalog,
 KPIBestPricePerSupplierProposedHistorical,
  filters
);

  useEffect(() => {
    const params = {
      clientid: 1,
      branchcode: filters.branch,
      startDate: filters.startDate,
      endDate: filters.endDate,
      TopN: 500,
      IncludeZeroPrice: "false",
      // status: "All",
    };
    dispatch(
      getKPIBestPricePerSupplier({
        ...params,
        groupBy: "ITEM_MATRIX",
      }),
    );
   dispatch(
      getKPIBestPricePerSupplier({
        ...params,
        groupBy: "SUPPLIER_SCORECARD",
      }),
    );
     dispatch(
      getKPIBestPricePerSupplier({
        ...params,
        groupBy: "BEST_PRICE_CATALOG",
      }),
    );
      dispatch(
      getKPIBestPricePerSupplier({
        ...params,
        groupBy: "PROPOSED_VS_HISTORICAL",
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
      dispatch(clearBestPricePerSupplierData());
    };
  }, [dispatch]);

  const handleApplyFilters = () => {
    const params = {
      clientid: 1,
      branchcode: filters.branch,
      startDate: filters.startDate,
      endDate: filters.endDate,
      TopN: 500,
      IncludeZeroPrice: "false",
      // status: "All",
    };
    dispatch(
      getKPIBestPricePerSupplier({
        ...params,
        groupBy: "ITEM_MATRIX",
      }),
    );
   dispatch(
      getKPIBestPricePerSupplier({
        ...params,
        groupBy: "SUPPLIER_SCORECARD",
      }),
    );
     dispatch(
      getKPIBestPricePerSupplier({
        ...params,
        groupBy: "BEST_PRICE_CATALOG",
      }),
    );
      dispatch(
      getKPIBestPricePerSupplier({
        ...params,
        groupBy: "PROPOSED_VS_HISTORICAL",
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
            title="BestPricePerSupplier
            "
            pageTitle="Purchases"
            subtitle={selectedBranchName}
          />
          <Row>
            <Col xl={12}>
              <BestPricePerSupplierCards
                rightClickBtn={toggleRightColumn}
                selectedBranchName={selectedBranchName}
                BestPricePerSupplierSupplierScorecardData={
                  BestPricePerSupplierSupplierScorecardData
                }
                error={error}
                loading={loading}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <BestPricePerSupplierTable
                BestPricePerSupplierSupplierScorecardData={BestPricePerSupplierSupplierScorecardData}
 BestPricePerSupplierItemMatrixData={BestPricePerSupplierItemMatrixData}
  BestPricePerSupplierBestPriceCatalogData={BestPricePerSupplierBestPriceCatalogData}
  BestPricePerSupplierProposedHistoricalData={BestPricePerSupplierProposedHistoricalData}
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

export default BestPriceSupplier;
