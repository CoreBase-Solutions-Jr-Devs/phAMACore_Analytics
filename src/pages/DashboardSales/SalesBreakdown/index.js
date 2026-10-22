import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardSales/reducer";
// import Customer from "./Customer";
import Breakdown from "./Breakdown";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getKPISalesTransactions } from "../../../slices/dashboardSales/thunk";
import { clearSalesData } from "../../../slices/dashboardSales/reducer";
// import { groupBy } from "lodash";

const SalesBreakdown = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);

  const {
    // salesTargetSummary = [],
    // salesTargetBranch = [],
    salesBranch = [],
    salesChannel = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.powerbi);

  const {
    // totalActiveMembers,
    // newMembersOnboarded,
    // returningMembers,
    // newMemberTransactions,
    // newMemberSales,
    // newMemberABV,
    // repeatMemberTransactions,
    // repeatMemberSales,
    // repeatMemberABV,
    // totalStoreTransactions,
    // totalStoreSales,
    // overallAverageBasketValue,
    // memberTransactionShare,
    // memberActionInsight,
    // newCohortMemberCount,
    // newCohortTransactions,
    // newCohortSalesExcl,
    // newCohortSalesIncl,
    // newCohortABV,
    // newCohortSalesContribution,
    // repeatCohortMemberCount,
    // repeatCohortTransactions,
    // repeatCohortSalesExcl,
    // repeatCohortSalesIncl,
    // repeatCohortABV,
    // repeatCohortSalesContribution,
    // nonMemberCount,
    // nonMemberTransactions,
    // nonMemberSalesExcl,
    // nonMemberSalesIncl,
    // nonMemberABV,
    // nonMemberSalesContribution,
    // performanceSummary,
    // netSales,
    // targetSales,
    // achievementPct,
    // grossProfit,
    // grossMarginPct,
    // averageBasketValue,
    // transactionCount,
    // totalBranches,
    // targetVariance,
    // targetActionInsight,
    CASH,
    INSURANCE,
    OTHER_ACCOUNT,
    RETURN,
    TOTAL,
  } = useSalesAnalytics(
    [], // sales
    [], // kpiOverdueAccounts
    [], // salesType
    [], // salesBranch
    [], // salesBranch_Type
    salesChannel,
    [], // salesComparativeYTD
    [], // salesComparativeMTD
    [], // salesMonthly
    [], // salesDaily
    [], // monthlySales
    [], // monthToDateSales
    [], // lastYearMonthToDateSales
    [], // lastYearMonthlySales

    [], // marginAnalysisBand
    [], // marginAnalysisDrilldown
    [], // marginAnalysisSku

    [], //  customerMemberAnalysisSummary,
    [], //  customerMemberAnalysisBranch,
    [], // customerMemberAnalysisCohort

    [], // julySalesTarget
    [], // augustSalesTarget
    [], // septemberSalesTarget
    [], // octoberSalesTarget

    [], // salesTarget
    [], // salesTargetSummary
    [], // salesTargetBranch

    filters,
  );

  useEffect(() => {
    dispatch(
      getKPISalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        groupBy: "CHANNEL",
        IncludeCollections: 1,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSalesData());
    };
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(
      getKPISalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        groupBy: "CHANNEL",
                IncludeCollections: 1,

      }),
    );
  };
  const selectedBranchName =
    filters.branch == null || filters.branch === ""
      ? ""
      : (salesBranch || []).find(
          (m) => Number(m.branchID) === Number(filters.branch),
        )?.branchName || "";

  document.title = "Sales Breakdown| phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Sales Breakdown"
          pageTitle="Dashboards"
          subtitle={selectedBranchName}
        />

        <Row>
          <Col xl={12}>
            <Breakdown
              CASH={CASH}
              INSURANCE={INSURANCE}
              OTHER_ACCOUNT={OTHER_ACCOUNT}
              RETURN={RETURN}
              TOTAL={TOTAL}
              selectedBranchName={selectedBranchName}
              loading={loading}
              error={error}
              rightClickBtn={toggleRightColumn}
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
  );
};

export default SalesBreakdown;
