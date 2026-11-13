import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SupplierReturnsTable from "../SupplierReturns/SupplierReturnsTable";
import SupplierReturnsSummaryCards from "../SupplierReturns/SupplierReturnsSummaryCards";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { getKPISupplierReturns } from "../../../slices/dashboardPurchase/SupplierReturns/thunk";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardPurchase/SupplierReturns/reducer";
import { clearSupplierReturnsData } from "../../../slices/dashboardPurchase/SupplierReturns/reducer";
import usePurchaseOrders from "../../../Components/Hooks/usePurchaseOrders";

const SupplierReturns = () => {
  document.title = "Purchases Dashboard | phAMACore Analytics";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  const [selectedBranchName, setSelectedBranchName] = useState("All Branches");

  const {
  KPISupplierReturnsSummary = [],
  KPISupplierReturnsSupplier = [],
 KPISupplierReturnsDrilldown = [],
 KPISupplierReturnsBranch = [],
KPISupplierReturnsSKU = [],
KPISupplierReturnsReason = [],
    loading,
    error,
    filters,
  } = useSelector((state) => state.supplierReturns);
 const {
  SupplierReturnsSummaryData,
  SupplierReturnsSupplierData,
 SupplierReturnsDrilldownData,
 SupplierReturnsBranchData,
SupplierReturnsSKUData,
SupplierReturnsReasonData,
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

   KPISupplierReturnsSummary,
   KPISupplierReturnsSupplier,
   KPISupplierReturnsDrilldown,
   KPISupplierReturnsBranch,
   KPISupplierReturnsSKU,
  KPISupplierReturnsReason,

  filters
);

  useEffect(() => {
    const params = {
      clientid: 1,

      branchcode: filters.branch,
      startDate: filters.startDate,
      endDate: filters.endDate,
      TopN: 500,
      status: "All",
    };
    dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "SUMMARY",
      }),
    );
    dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "SUPPLIER",
      }),
    );
    dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "DRILLDOWN",
      }),
    );
    dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "BRANCH",
      }),
    );
      dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "REASON",
      }),
    );
      dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "SKU",
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSupplierReturnsData());
    };
  }, [dispatch]);

  const handleApplyFilters = () => {
    const params = {
      clientid: 1,
      branchcode: filters.branch,
      startDate: filters.startDate,
      endDate: filters.endDate,
      TopN: 500,
      status: "All",
    };
    dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "SUMMARY",
      }),
    );
    dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "SUPPLIER",
      }),
    );
    dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "DRILLDOWN",
      }),
    );
    dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "BRANCH",
      }),
    );
      dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "REASON",
      }),
    );
      dispatch(
      getKPISupplierReturns({
        ...params,
        groupBy: "SKU",
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
              <SupplierReturnsSummaryCards
                rightClickBtn={toggleRightColumn}
                selectedBranchName={selectedBranchName}
                SupplierReturnsSummaryData={
                  SupplierReturnsSummaryData
                }
                error={error}
                loading={loading}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <SupplierReturnsTable
                SupplierReturnsSupplier={SupplierReturnsSupplierData}
  SupplierReturnsDrilldown={SupplierReturnsDrilldownData}
  SupplierReturnsBranch={SupplierReturnsBranchData}
  SupplierReturnsSKU={SupplierReturnsSKUData}
  SupplierReturnsReason={SupplierReturnsReasonData}
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

export default SupplierReturns;
