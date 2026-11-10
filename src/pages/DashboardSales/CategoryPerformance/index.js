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
} from "../../../slices/dashboardSales/CategoryPerformance/reducer";
// import Customer from "./Customer";
import Products from "./Products";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getKPISalesTransactions } from "../../../slices/dashboardSales/thunk";
import { clearCategoryPerformanceData } from "../../../slices/dashboardSales/CategoryPerformance/reducer";
import Category from "./Category"

const CategoryPerformance = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);
const [selectedBranchName, setSelectedBranchName] =
  useState("All Branches");

 const {
    // salesTargetSummary = [],
    // salesTargetBranch = [],
    // salesBranch = [],
    // salesChannel = [],
    salesSubgroup = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.categoryPerformance);
const {
  categoryPerformance,
  categoryTotals,
  categoryAvgOrderValue,
  categoryGrossMargin,
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
  [], // 11. salesPeriodicBreakdown - INSERTED
  salesSubgroup, // 12. salesSubgroup
  [], // 13. monthlySales
  [], // 14. monthToDateSales
  [], // 15. lastYearMonthToDateSales
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
  [], // 28. salesTargetSummary
  [], // 29. salesTargetBranch
  [], // 30. salesTargetMONTHLY_PIVOT
  filters // 31. filters
);

  useEffect(() => {
    dispatch(
      getKPISalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
        groupBy: "SUBGROUP",
      
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCategoryPerformanceData());
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
              

      }),
    );
  };
  // const selectedBranchName =
  //   filters.branch == null || filters.branch === ""
  //     ? "All Branches"
  //     :( 
  //     (salesBranch || []).find(
  //         (m) => Number(m.branch_id) === Number(filters.branch),
  //       )?.branch_name || ""
  //       ).replace(/^AXCESS PHARMACY\s*-\s*/i, "");

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
                categoryPerformance={categoryTotals}
                 categoryAvgOrderValue={categoryAvgOrderValue}
    categoryGrossMargin={categoryGrossMargin}
      loading={loading}
              error={error}
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
              // rightClickBtn={toggleRightColumn}
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
  );
};

export default CategoryPerformance