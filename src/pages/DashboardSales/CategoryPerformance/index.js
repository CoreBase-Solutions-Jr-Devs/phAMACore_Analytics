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
  
    salesBranch = [],

  } = useSelector((state) => state.powerbi);
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
    salesSubgroup ,
  [], // 12. monthlySales
  [], // 13. monthToDateSales
  [], // 14. lastYearMonthToDateSales
  [], // 15. lastYearMonthlySales
 [], //  marginAnalysisBand      
   [], // marginAnalysisDrilldown 
  [], //  marginAnalysisSKU        
  [], // 19. customerMemberAnalysisSummary
  [], // 20. customerMemberAnalysisBranch
  [], // 21. customerMemberAnalysisCohort
  [], // 22. julySalesTarget
  [], // 23. augustSalesTarget
  [], // 24. septemberSalesTarget
  [], // 25. octoberSalesTarget
  [], // 26. salesTarget
  [], // 27. salesTargetSummary
  [], // 28. salesTargetBranch
  [], // 29. salesTargetMONTHLY_PIVOT
  filters, // 30. filters
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