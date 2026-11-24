import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import Section from "./Section";
import FilterActions from "./FilterActions";
import Widgets from "./Widgets";
import RevenueExpenses from "./RevenueExpenses";
import StockPurchases from "./StockPurchases";
import SalesComposition from "./SalesComposition";
import VATBreakdown from "./VATBreakdown";
import ReceivablesAgeing from "./ReceivablesAgeing";
import StockMovements from "./StockMovements";
import SalesCollection from "./SalesCollection";
import { applyFilters } from "../../slices/dashboardMyBusiness/reducer";
import {
  fetchMonthlyTrend,
  fetchSalesByType,
  fetchBranchProfitability,
  fetchStockConversionTrend,
  fetchStockConversionByBranch,
  fetchVATBreakdown,
  fetchCustomerAging,
} from "../../slices/dashboardMyBusiness/thunk";
import {
  saveActiveBranch,
  cleanBranchName,
  getCachedBranchName,
} from "../../helpers/branch_helper";

export default function DashboardMyBusiness() {
  document.title = "My Business | phAMACore Analytics";

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { branchId } = useParams();

  const branchCode = branchId ? Number(branchId) : null;
  const isBranchView = !!branchCode;

  const [rightColumn, setRightColumn] = useState(false);
  const [kpiData, setKpiData] = useState({});

  const toggleRightColumn = useCallback(() => {
    setRightColumn((prev) => !prev);
  }, []);

  const appliedFilters = useSelector(
    (state) => (state.DashboardMyBusiness || state.MyBusiness)?.appliedFilters || {}
  );

  // Sync URL branchId into Redux state when URL changes
  useEffect(() => {
    if (branchCode && appliedFilters.branch !== branchCode) {
      dispatch(applyFilters({ branch: branchCode }));
      saveActiveBranch("mybusiness", branchCode);
    }
  }, [dispatch, branchCode, appliedFilters.branch]);

  // Dispatch shared dashboard data fetches whenever filters change
  useEffect(() => {
    const startDate = appliedFilters.startDate;
    const endDate = appliedFilters.endDate;
    const branch = appliedFilters.branch ?? null;
    const range = { startDate, endDate, branch };

    dispatch(fetchMonthlyTrend(range));
    dispatch(fetchSalesByType(range));
    dispatch(fetchBranchProfitability({ StartDate: startDate, EndDate: endDate, branchcode: branch }));
    dispatch(
      fetchStockConversionTrend({
        StartDate: startDate,
        EndDate: endDate,
        branchcode: branch,
        GroupBy: "MONTHLY",
        whichcost: 1,
        IncludeBlocked: true,
      })
    );
    dispatch(
      fetchStockConversionByBranch({
        StartDate: startDate,
        EndDate: endDate,
        whichcost: 1,
        IncludeBlocked: true,
      })
    );
    dispatch(fetchVATBreakdown({ StartDate: startDate, EndDate: endDate, branchcode: branch }));
    dispatch(fetchCustomerAging({ DateTo: endDate, branchcode: branch }));
  }, [dispatch, appliedFilters.startDate, appliedFilters.endDate, appliedFilters.branch]);

  const handleApplyFilters = useCallback(
    (draftFilters) => {
      const nextBranch =
        draftFilters && "branch" in draftFilters
          ? draftFilters.branch
          : appliedFilters.branch;

      dispatch(applyFilters(draftFilters));
      setRightColumn(false);
      if (nextBranch) {
        saveActiveBranch("mybusiness", nextBranch);
        navigate(`/dashboard/branch/${nextBranch}`);
      } else {
        saveActiveBranch("mybusiness", null);
        navigate("/dashboard");
      }
    },
    [dispatch, navigate, appliedFilters.branch]
  );

  const branchDisplayName = isBranchView
    ? cleanBranchName(getCachedBranchName(branchCode) || `Branch ${branchCode}`)
    : undefined;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="My Business"
          pageTitle="Dashboards"
          subtitle={branchDisplayName}
        />

        <Section rightClickBtn={toggleRightColumn} kpiData={kpiData} />

        <Widgets onKpiComputed={setKpiData} />

        <Row className="mb-3">
          <Col xl={6}>
            <RevenueExpenses />
          </Col>
          <Col xl={6}>
            <StockPurchases />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <SalesComposition />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <VATBreakdown />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <ReceivablesAgeing />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <StockMovements />
          </Col>
        </Row>

        <Row>
          <Col>
            <SalesCollection />
          </Col>
        </Row>

        <FilterActions
          onApply={handleApplyFilters}
          rightColumn={rightColumn}
          hideRightColumn={toggleRightColumn}
        />
      </Container>
    </div>
  );
}
