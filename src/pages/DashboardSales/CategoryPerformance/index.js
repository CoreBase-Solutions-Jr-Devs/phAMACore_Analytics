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
import Products from "./Products";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getKPISalesTransactions } from "../../../slices/dashboardSales/thunk";
import { clearSalesData } from "../../../slices/dashboardSales/reducer";
import Category from "./Category"

const CategoryPerformance = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);

  const {
    // salesTargetSummary = [],
    // salesTargetBranch = [],
    salesBranch = [],
    // salesChannel = [],
    salesSubgroup = [],
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
    // CASH,
    // INSURANCE,
    // OTHER_ACCOUNT,
    // RETURN,
    // TOTAL,
    categoryPerformance,
  } = useSalesAnalytics(
    //  sales,
    [], // kpiOverdueAccounts
    [], // salesType
    [], // salesBranch
    [], // salesBranch_Type
    [], // salesChannel,
    [], // salesComparativeYTD
    [], // salesComparativeMTD
    [], // salesMonthly
    [], // salesDaily
    salesSubgroup,
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
        groupBy: "SUBGROUP",
        // IncludeCollections: 1,
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
        groupBy: "SUBGROUP",
                IncludeCollections: 1,

      }),
    );
  };
  const selectedBranchName =
    filters.branch == null || filters.branch === ""
      ? "All Branches"
      : (salesBranch || []).find(
          (m) => Number(m.branch_id) === Number(filters.branch),
        )?.branch_name || "";

  document.title = "Category Performance| phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Category Performance"
          pageTitle="Dashboards"
          subtitle= {selectedBranchName}
         
        />
<Row>
  <Col xl={12}>
  <Category
                categoryPerformance={categoryPerformance}
              rightClickBtn={toggleRightColumn}
selectedBranchName ={selectedBranchName}
  />
  </Col>
</Row>
        <Row>
          <Col xl={12}>
            <Products
              categoryPerformance={categoryPerformance}
            
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

export default CategoryPerformance