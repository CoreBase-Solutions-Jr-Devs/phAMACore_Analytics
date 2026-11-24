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
} from "../../../slices/dashboardSales/CustomerMemberAnalysis/reducer";
import Customer from "./Customer";
import MemberAnalysis from "./MemberAnalysis";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getCustomerMemberAnalysis } from "../../../slices/dashboardSales/CustomerMemberAnalysis/thunk";
import { clearCustomerMemberAnalysisData } from "../../../slices/dashboardSales/CustomerMemberAnalysis/reducer";

const CustomerMemberAnalysis = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);

  const [selectedBranchName, setSelectedBranchName] = useState("All Branches");
  const {
    customerMemberAnalysis = [],
    customerMemberAnalysisSummary = [],
    customerMemberAnalysisBranch = [],
    customerMemberAnalysisCohort = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.customerMemberAnalysis);

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
    [], // salesPeriodicBreakdown - MISSING ARGUMENT
    [], // salesSubgroup
    [], // monthlySales
    [], // monthToDateSales
    [], // lastYearMonthToDateSales
    [], // lastYearMonthlySales
    [], // marginAnalysisBand
    [], // marginAnalysisDrilldown
    [], // marginAnalysisSku
    customerMemberAnalysisSummary, // customerMemberAnalysisSummary
    customerMemberAnalysisBranch, // customerMemberAnalysisBranch
    customerMemberAnalysisCohort, // customerMemberAnalysisCohort
    [], // julySalesTarget
    [], // augustSalesTarget
    [], // septemberSalesTarget
    [], // octoberSalesTarget - MISSING ARGUMENT
    [], // salesTarget
    [], // salesTargetSummary
    [], // salesTargetBranch
    [], // salesTargetMONTHLY_PIVOT
    filters, // filters
  );

  useEffect(() => {
    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch,
    };

    dispatch(
      getCustomerMemberAnalysis({
        ...params,
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getCustomerMemberAnalysis({
        ...params,
        groupBy: "BRANCH",
      }),
    );

    dispatch(
      getCustomerMemberAnalysis({
        ...params,
        groupBy: "COHORT",
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCustomerMemberAnalysisData());
    };
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleApplyFilters = () => {
    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch,
    };

    dispatch(
      getCustomerMemberAnalysis({
        ...params,
        groupBy: "SUMMARY",
      }),
    );

    dispatch(
      getCustomerMemberAnalysis({
        ...params,
        groupBy: "BRANCH",
      }),
    );

    dispatch(
      getCustomerMemberAnalysis({
        ...params,
        groupBy: "COHORT",
      }),
    );
  };

  document.title = "Customer Member Analysis | phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Customer Member Analysis"
          pageTitle="Sales"
          subtitle={selectedBranchName}
        />
        <div
          className={`d-flex justify-content-end flex-wrap gap-4 p-1 mb-0 ${
            isSticky ? "bg-white border-top border-bottom shadow-sm" : ""
          }`}
          style={{
            position: "sticky",
            top: "70px",
            zIndex: 100,
            width: "100%",
            marginTop: "-15px",
          }}
        >
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-1">
              <span>Filtered From:</span>
              <strong>{filters?.startDate || ""}</strong> to{" "}
              <strong>{filters?.endDate || ""}</strong>
            </div>

            <div
              style={{
                borderLeft: "2px solid #ced4da",
                height: "12px",
                margin: "0 4px",
              }}
            />

            <div className="d-flex align-items-center gap-1">
              <span>Selected Branch:</span>
              <strong>{selectedBranchName}</strong>
            </div>
            <div
              style={{
                borderLeft: "2px solid #ced4da",
                height: "12px",
                margin: "0 4px",
              }}
            />
            <div className="d-flex align-items-center gap-1 no-print">
              <button
                type="button"
                className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
                onClick={toggleRightColumn}
              >
                <i className="ri-filter-fill"></i>
                Filter
              </button>
            </div>
          </div>
        </div>
        <Row>
          <Col xl={12}>
            <Customer
              totalActiveMembers={totalActiveMembers}
              newMembersOnboarded={newMembersOnboarded}
              returningMembers={returningMembers}
              newMemberTransactions={newMemberTransactions}
              newMemberSales={newMemberSales}
              newMemberABV={newMemberABV}
              repeatMemberTransactions={repeatMemberTransactions}
              repeatMemberSales={repeatMemberSales}
              repeatMemberABV={repeatMemberABV}
              totalStoreTransactions={totalStoreTransactions}
              totalStoreSales={totalStoreSales}
              overallAverageBasketValue={overallAverageBasketValue}
              memberTransactionShare={memberTransactionShare}
              memberActionInsight={memberActionInsight}
              selectedBranchName={selectedBranchName}
              loading={loading}
              error={error}
              rightClickBtn={toggleRightColumn}
            />
          </Col>
        </Row>

        <Row>
          <Col xl={12}>
            <MemberAnalysis
              newCohortMemberCount={newCohortMemberCount}
              newCohortTransactions={newCohortTransactions}
              newCohortSalesExcl={newCohortSalesExcl}
              newCohortSalesIncl={newCohortSalesIncl}
              newCohortABV={newCohortABV}
              newCohortSalesContribution={newCohortSalesContribution}
              repeatCohortMemberCount={repeatCohortMemberCount}
              repeatCohortTransactions={repeatCohortTransactions}
              repeatCohortSalesExcl={repeatCohortSalesExcl}
              repeatCohortSalesIncl={repeatCohortSalesIncl}
              repeatCohortABV={repeatCohortABV}
              repeatCohortSalesContribution={repeatCohortSalesContribution}
              nonMemberCount={nonMemberCount}
              nonMemberTransactions={nonMemberTransactions}
              nonMemberSalesExcl={nonMemberSalesExcl}
              nonMemberSalesIncl={nonMemberSalesIncl}
              nonMemberABV={nonMemberABV}
              nonMemberSalesContribution={nonMemberSalesContribution}
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

export default CustomerMemberAnalysis;
