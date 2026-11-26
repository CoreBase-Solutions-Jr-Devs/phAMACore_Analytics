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
const [isSticky, setIsSticky] = useState(false);

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
    [], // KPIPurchases
    [], // KPISummary
    [], // KPICategory,
    [], // KPISupplier
    [], // KPIBranch
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

    [], // LastYearActualSpend

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

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title="Supplier Order FillRate"
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
              <SupplierOrder
                rightClickBtn={toggleRightColumn}
                selectedBranchName={selectedBranchName}
                SupplierOrderFillRateSummaryData={
                  SupplierOrderFillRateSummaryData
                }
                error={error}
                loading={loading.kpiSupplierOrderFillRate}
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
                loading={loading.kpiSupplierOrderFillRate}
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
