import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SupplierOrderFillRateTable from "../SupplierOrderFillRate/SupplierOrderFillRateTable";
import SupplierOrder from "../SupplierOrderFillRate/SupplierOrder";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { getKPISupplierOrderFillRate } from "../../../slices/dashboardPurchase/SupplierOrderFillRate/thunk";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardPurchase/SupplierOrderFillRate/reducer";
import { clearSupplierOrderFillRateData } from "../../../slices/dashboardPurchase/SupplierOrderFillRate/reducer";
import usePurchaseOrders from "../../../Components/Hooks/usePurchaseOrders";

const BranchOrderFill = () => {
  document.title = "Purchases Dashboard | phAMACore Analytics";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  const [selectedBranchName, setSelectedBranchName] = useState("All Branches");

  const {
    KPISupplierOrderFillRateSummary = [],
    KPISupplierOrderFillRateSupplierOFR = [],
    KPISupplierOrderFillRateOrderDrilldown = [],
    KPISupplierOrderFillRateBranch = [],
    loading,
    error,
    filters,
  } = useSelector((state) => state.supplierOrderFillRate);
  const {
    SupplierOrderFillRateSummaryData,
    SupplierOrderFillRateSupplierOFRData,
    SupplierOrderFillRateOrderDrilldownData,
    SupplierOrderFillRateBranchData,
  } = usePurchaseOrders(
    [], // PurchaseOrders
    [], // KPIPurchases
    [], // KPISummary
    [], // KPICategory,
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

    [], //kpiOverdueAccounts,
    KPISupplierOrderFillRateSummary,
    KPISupplierOrderFillRateSupplierOFR,
    KPISupplierOrderFillRateOrderDrilldown,
    KPISupplierOrderFillRateBranch,
    filters,
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
      getKPISupplierOrderFillRate({
        ...params,
        groupBy: "SUMMARY",
      }),
    );
    dispatch(
      getKPISupplierOrderFillRate({
        ...params,
        groupBy: "SUPPLIER_OFR",
      }),
    );
    dispatch(
      getKPISupplierOrderFillRate({
        ...params,
        groupBy: "ORDER_DRILLDOWN",
      }),
    );
    dispatch(
      getKPISupplierOrderFillRate({
        ...params,
        groupBy: "BRANCH",
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSupplierOrderFillRateData());
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
      getKPISupplierOrderFillRate({
        ...params,
        groupBy: "SUMMARY",
      }),
    );
    dispatch(
      getKPISupplierOrderFillRate({
        ...params,
        groupBy: "SUPPLIER_OFR",
      }),
    );
    dispatch(
      getKPISupplierOrderFillRate({
        ...params,
        groupBy: "ORDER_DRILLDOWN",
      }),
    );
    dispatch(
      getKPISupplierOrderFillRate({
        ...params,
        groupBy: "BRANCH",
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
              <SupplierOrder
                rightClickBtn={toggleRightColumn}
                selectedBranchName={selectedBranchName}
                SupplierOrderFillRateSummaryData={
                  SupplierOrderFillRateSummaryData
                }
                error={error}
                loading={loading}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <SupplierOrderFillRateTable
                SupplierOrderFillRateSupplierOFR={
                  SupplierOrderFillRateSupplierOFRData
                }
                SupplierOrderFillRateOrderDrilldown={
                  SupplierOrderFillRateOrderDrilldownData
                }
                SupplierOrderFillRateBranch={SupplierOrderFillRateBranchData}
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

export default BranchOrderFill;
