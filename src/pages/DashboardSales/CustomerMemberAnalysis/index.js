import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import CustomerMemberAnalysisFilterActions from "./FilterActions";

import Customer from "./Customer";
import MemberAnalysis from "./MemberAnalysis";
// import MarginSKU from "./MarginSKU";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getCustomerMemberAnalysis } from "../../../slices/dashboardSales/CustomerMemberAnalysis/thunk";
import { clearCustomerMemberAnalysisData } from "../../../slices/dashboardSales/CustomerMemberAnalysis/reducer";


const CustomerMemberAnalysis = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);

  const {

    customerMemberAnalysis= [],
customerMemberAnalysisSummary= [],
customerMemberAnalysisBranch= [],
customerMemberAnalysisCohort= [],
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
  [], // monthlySales
  [], // monthToDateSales
  [], // lastYearMonthToDateSales
  [], // lastYearMonthlySales

  [], // marginAnalysisBand
  [], // marginAnalysisDrilldown
  [], // marginAnalysisSku

  customerMemberAnalysisSummary,
  customerMemberAnalysisBranch,
  customerMemberAnalysisCohort,

  [], // salesTarget
  [], // salesTargetSummary
  [], // salesTargetBranch

  filters
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
      console.log("SELECT BUTTON CLICKED");
  console.log("Current filters:", filters);
  console.log("API request parameters:", params);
  };
  const selectedBranchName =
  filters.branch == null || filters.branch === ""
    ? ""
    : (customerMemberAnalysisBranch || []).find(
        (m) => Number(m.branch_id) === Number(filters.branch),
      )?.branch_name || "Unknown Branch";

  document.title = "Customer Member Analysis | phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Customer Member Analysis"
          pageTitle="Dashboards"
               subtitle={ selectedBranchName
          }
        />

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
   selectedBranchName={ selectedBranchName}
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
          
        <CustomerMemberAnalysisFilterActions
          onApply={handleApplyFilters}
          rightColumn={rightColumn}
            hideRightColumn={toggleRightColumn}
        />

        </Row>

        {/* <Row>
          <Col xl={12}>
            <MarginSKU
              data={marginAnalysisSKU}
              loading={loading}
              error={error}
            />
          </Col>
        </Row> */}

      </Container>
    </div>
  );
};

export default CustomerMemberAnalysis
