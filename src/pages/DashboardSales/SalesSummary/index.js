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
} from "../../../slices/dashboardSales/SalesSummary/reducer";
import SummaryCards from "./SummaryCards";
import SummaryTable from "./SummaryTable";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getKPISalesTransactions } from "../../../slices/dashboardSales/thunk";
import { clearSalesSummaryData } from "../../../slices/dashboardSales/SalesSummary/reducer";
// import { groupBy } from "lodash";

const SalesSummary = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);
const [selectedBranchName, setSelectedBranchName] =
  useState("All Branches");
  const {
  
    salesPeriodicBreakdown = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.salesSummary);
   

  const {
  salesPeriodicBreakdownData,
   totalSalesIncl,
  netSales,
  totalTax,
  clientsServed,
  averageMargin,
  averageBasket,
  bestMonthName,
  bestMonthSales,
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
  salesPeriodicBreakdown,
  [], // salesSubgroup - MISSING ARGUMENT
  [], // monthlySales
  [], // monthToDateSales
  [], // lastYearMonthToDateSales
  [], // lastYearMonthlySales
  [], // marginAnalysisBand
  [], // marginAnalysisDrilldown
  [], // marginAnalysisSku
  [], // customerMemberAnalysisSummary
  [], // customerMemberAnalysisBranch
  [], // customerMemberAnalysisCohort
  [], // julySalesTarget
  [], // augustSalesTarget
  [], // septemberSalesTarget
  [], // octoberSalesTarget
  [], // salesTarget
  [], // salesTargetSummary
  [], // salesTargetBranch
  [], // salesTargetMONTHLY_PIVOT
  filters,
);

useEffect(() => {
  const params = {
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: filters.branch,
    GroupBy: "PERIODIC_BREAKDOWN",
  };



  dispatch(getKPISalesTransactions(params));
}, [dispatch]);

useEffect(() => {
  return () => {
    console.log("[SalesSummary] Unmounting — clearSalesData dispatched");
    dispatch(clearSalesSummaryData());
  };
}, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(
      getKPISalesTransactions({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: filters.branch,
    GroupBy: "PERIODIC_BREAKDOWN",
        // IncludeCollections: 1,
      }),
    );
  };
  // const selectedBranchName =
  //   filters.branch == null || filters.branch === ""
  //     ? "All Branches"
  //     : (salesBranch || []).find(
  //         (m) => Number(m.branchID) === Number(filters.branch),
  //       )?.branchName || "";

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
            <SummaryCards
              totalSalesIncl={totalSalesIncl}
  netSales={netSales}
  totalTax={totalTax}
  clientsServed={clientsServed}
  averageMargin={averageMargin}
  averageBasket={averageBasket}
  bestMonthName={bestMonthName}
  bestMonthSales={bestMonthSales}
              selectedBranchName={selectedBranchName}
              loading={loading}
              error={error}
              rightClickBtn={toggleRightColumn}
            />
          </Col>
        </Row>
        <Row>
          <Col xl={12}>
            <SummaryTable
              salesPeriodicBreakdownData={salesPeriodicBreakdownData}
                            selectedBranchName={selectedBranchName}

               rightClickBtn={toggleRightColumn}
                 loading={loading}
              error={error}
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

export default SalesSummary;
