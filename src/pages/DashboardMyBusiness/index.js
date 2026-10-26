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
import ReceivablesAgeing from "./ReceivablesAgeing";
import StockMovements from "./StockMovements";
import SalesCollection from "./SalesCollection";
import { applyFilters } from "../../slices/dashboardMyBusiness/reducer";
import { fetchMonthlyTrend, fetchSalesByType } from "../../slices/dashboardMyBusiness/thunk";
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

  // One shared fetch feeds the three trend cards, and one feeds Sales Composition + VAT
  useEffect(() => {
    const range = {
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      branch: appliedFilters.branch ?? null,
    };
    dispatch(fetchMonthlyTrend(range));
    dispatch(fetchSalesByType(range));
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

        <Row>
          <Col xl={6}>
            <RevenueExpenses />
          </Col>
          <Col xl={6}>
            <StockPurchases />
          </Col>
        </Row>

        <Row>
          <Col>
            <ReceivablesAgeing />
          </Col>
        </Row>
        <Row>
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
