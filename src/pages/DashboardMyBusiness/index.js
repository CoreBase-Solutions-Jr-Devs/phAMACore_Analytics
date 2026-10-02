import React, { useState, useEffect } from "react";
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
import { setBranch } from "../../slices/dashboardMyBusiness/reducer";
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

  const toggleRightColumn = () => {
    setRightColumn((prev) => !prev);
  };

  const { filters = {} } = useSelector(
    (state) =>
      state.DashboardMyBusiness ||
      state.MyBusiness || { filters: {} }
  );

  // Sync URL branchId into Redux state when URL changes
  useEffect(() => {
    if (branchCode) {
      dispatch(setBranch(branchCode));
      saveActiveBranch("mybusiness", branchCode);
    }
  }, [dispatch, branchCode]);

  const handleApplyFilters = () => {
    setRightColumn(false);
    if (filters.branch) {
      saveActiveBranch("mybusiness", filters.branch);
      navigate(`/dashboard/branch/${filters.branch}`);
    } else {
      navigate("/dashboard");
    }
  };

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
          <Col xl={6}>
            <ReceivablesAgeing />
          </Col>

          <Col xl={6}>
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
