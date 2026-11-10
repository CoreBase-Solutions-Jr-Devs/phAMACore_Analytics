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
import { getDateRanges } from "../../../helpers/date_helper";
import Performance from "./Performance";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getSalesTarget } from "../../../slices/dashboardSales/SalesTarget/thunk";
import { clearSalesTargetData } from "../../../slices/dashboardSales/SalesTarget/reducer";
import BranchTarget from "./BranchTarget";

const PerformanceSummary = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);
const [selectedBranchName, setSelectedBranchName] =
  useState("All Branches");
  const {
    salesTargetSummary = [],
    salesTargetBranch = [],
    salesTargetMONTHLY_PIVOT = [],
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
    performanceSummaryMONTHLY,
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
  [], // 1. sales
  [], // 2. kpiOverdueAccounts
  [], // 3. salesType
  [], // 4. salesBranch
  [], // 5. salesBranch_Type
  [], // 6. salesChannel
  [], // 7. salesComparativeYTD
  [], // 8. salesComparativeMTD
  [], // 9. salesMonthly
  [], // 10. salesDaily
   [], // 11. salesPeriodicBreakdown  <-- MISSING
  [], // 12. salesSubgroup
  [], // 13. monthlySales
  [], // 14. monthToDateSales
  [], // 14. lastYearMonthToDateSales
  [], // 16. lastYearMonthlySales
  [], // 17. marginAnalysisBand
  [], // 18. marginAnalysisDrilldown
  [], // 19. marginAnalysisSku
  [], // 20. customerMemberAnalysisSummary
  [], // 21. customerMemberAnalysisBranch
  [], // 22. customerMemberAnalysisCohort
  [], // 23. julySalesTarget
  [], // 24. augustSalesTarget
  [], // 25. septemberSalesTarget
  [], // 26. octoberSalesTarget
  [], // 27. salesTarget
  salesTargetSummary,      
  salesTargetBranch,        
  salesTargetMONTHLY_PIVOT, 
  filters,                 
);

  useEffect(() => {
    const dateRanges = getDateRanges();
    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
   
      PivotMetric: 'ALL',
    };

    dispatch(
      getSalesTarget({
        ...params,
           branchcode: filters.branch,
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getSalesTarget({
        ...params,
           branchcode: filters.branch,
        groupBy: "BRANCH",
      }),
    );
       dispatch(
      getSalesTarget({
        ...params,
        
        groupBy: "MONTHLY",
          startDate: dateRanges.currentYearStart,
  endDate: dateRanges.today,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSalesTargetData());
    };
  }, [dispatch]);

  const handleApplyFilters = () => {
    const dateRanges = getDateRanges();
   const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,

     PivotMetric: 'ALL',
    };

    dispatch(
      getSalesTarget({
        ...params,
              branchcode: filters.branch,
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getSalesTarget({
        ...params,
              branchcode: filters.branch,
        groupBy: "BRANCH",
      }),
    );
       dispatch(
      getSalesTarget({
        ...params,
        groupBy: "MONTHLY",
          startDate: dateRanges.currentYearStart,
  endDate: dateRanges.today,
      }),
    );
  };
  // const selectedBranchName =
  //   filters.branch == null || filters.branch === ""
  //     ? "All Branches"
  //     : (salesTargetBranch || []).find(
  //         (m) => Number(m.branchID) === Number(filters.branch),
  //       )?.branchName || "Unknown Branch";

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
              performanceSummary={performanceSummary}
              selectedBranchName={selectedBranchName}
              loading={loading}
              error={error}
              rightClickBtn={toggleRightColumn}
            />
          </Col>
         
        </Row>
        <Row>
          <Col xl={12}>
          
          <BranchTarget 
          data = {performanceSummaryMONTHLY}/>
             loading={loading}
              error={error}
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
  );
};

export default PerformanceSummary;
