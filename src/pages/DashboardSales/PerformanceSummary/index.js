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
} from "../../../slices/dashboardSales/SalesTarget/reducer";
// import Customer from "./Customer";
import Performance from "./Performance";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getSalesTarget } from "../../../slices/dashboardSales/SalesTarget/thunk";
import { clearSalesTargetData } from "../../../slices/dashboardSales/SalesTarget/reducer";

const PerformanceSummary = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);

  const {
    salesTargetSummary = [],
    salesTargetBranch = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.salesTarget);

  const {
    totalActiveMembers,
    newMembersOnboarded,
    returningMembers,
    newMemberTransactions,
    newMemberSales,
    newMemberABV,
    repeatMemberTransactions,
    repeatMemberSales,
    repeatMemberABV,
    totalStoreTransactions,
    totalStoreSales,
    overallAverageBasketValue,
    memberTransactionShare,
    memberActionInsight,
    newCohortMemberCount,
    newCohortTransactions,
    newCohortSalesExcl,
    newCohortSalesIncl,
    newCohortABV,
    newCohortSalesContribution,
    repeatCohortMemberCount,
    repeatCohortTransactions,
    repeatCohortSalesExcl,
    repeatCohortSalesIncl,
    repeatCohortABV,
    repeatCohortSalesContribution,
    nonMemberCount,
    nonMemberTransactions,
    nonMemberSalesExcl,
    nonMemberSalesIncl,
    nonMemberABV,
    nonMemberSalesContribution,
    performanceSummary,
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
  } = useSalesAnalytics(
    [], // sales
    [], // kpiOverdueAccounts
    [], // salesType
    [], // salesBranch
    [], // salesBranch_Type
    [], // salesChannel
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
    salesTargetSummary, // salesTargetSummary
    salesTargetBranch, // salesTargetBranch
    filters,
  );

  useEffect(() => {
    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch,
    };

    dispatch(
      getSalesTarget({
        ...params,
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getSalesTarget({
        ...params,
        groupBy: "BRANCH",
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSalesTargetData());
    };
  }, [dispatch]);

  const handleApplyFilters = () => {
    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch,
    };

    dispatch(
      getSalesTarget({
        ...params,
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getSalesTarget({
        ...params,
        groupBy: "BRANCH",
      }),
    );
  };
  const selectedBranchName =
    filters.branch == null || filters.branch === ""
      ? ""
      : (salesTargetBranch || []).find(
          (m) => Number(m.branchID) === Number(filters.branch),
        )?.branchName || "Unknown Branch";

  document.title = "Performance Summary| phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Performance Summary"
          pageTitle="Dashboards"
          subtitle={selectedBranchName}
        />

        <Row>
          <Col xl={12}>
            <Performance
              //   netSales={netSales}
              //   targetSales={targetSales}
              //   achievementPct={achievementPct}
              //   grossProfit={grossProfit}
              //   grossMarginPct={grossMarginPct}
              //   averageBasketValue={averageBasketValue}
              //   transactionCount={transactionCount}
              //   totalBranches={totalBranches}
              //   targetVariance={targetVariance}
              //   targetActionInsight={targetActionInsight}
              performanceSummary={performanceSummary}
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

export default PerformanceSummary;
