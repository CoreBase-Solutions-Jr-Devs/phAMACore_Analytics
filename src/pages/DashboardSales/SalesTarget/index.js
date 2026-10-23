import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
// import { getDateRanges } from "../../../";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardSales/SalesTarget/reducer";
// import Bands from "./Bands";
// import Drilldown from "./Drilldown";
// import MarginSKU from "./MarginSKU";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import {
  getSalesTarget,
  getJulySalesTarget,
  getAugustSalesTarget,
  getSeptemberSalesTarget,
  getOctoberSalesTarget,
} from "../../../slices/dashboardSales/SalesTarget/thunk";
import { clearSalesTargetData } from "../../../slices/dashboardSales/SalesTarget/reducer";
import { getDateRanges } from "../../../helpers/date_helper";
import BranchTarget from "./BranchTarget";
const SalesTarget = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);

  const {
    salesTarget = [],
    salesTargetSummary = [],
    salesTargetBranch = [],
    salesTargetMONTHLY_PIVOT = [],
    julySalesTarget = [],
    augustSalesTarget = [],
    septemberSalesTarget = [],
    octoberSalesTarget = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.salesTarget);

  const {
    //     branchTargetSyokimau,
    //   branchTargetTassia,
    //   branchTargetMachakos,
    //   branchTargetMtwapa,
    //   branchTargetKasarani,
    //   branchTargetEldoret,
    //   branchTargetBusia,
    //   branchTargetMsaGpo,
    //   branchTargetKitale,
    //   branchTargetKisii,
    // julyBranchTargetSyokimau,
    // julyBranchTargetTassia,
    // julyBranchTargetMachakos,
    // julyBranchTargetMtwapa,
    // julyBranchTargetKasarani,
    // julyBranchTargetEldoret,
    // julyBranchTargetBusia,
    // julyBranchTargetMsaGpo,
    // julyBranchTargetKitale,
    // julyBranchTargetKisii,
    // // August
    // augustBranchTargetSyokimau,
    // augustBranchTargetTassia,
    // augustBranchTargetMachakos,
    // augustBranchTargetMtwapa,
    // augustBranchTargetKasarani,
    // augustBranchTargetEldoret,
    // augustBranchTargetBusia,
    // augustBranchTargetMsaGpo,
    // augustBranchTargetKitale,
    // augustBranchTargetKisii,
    // // September
    // septemberBranchTargetSyokimau,
    // septemberBranchTargetTassia,
    // septemberBranchTargetMachakos,
    // septemberBranchTargetMtwapa,
    // septemberBranchTargetKasarani,
    // septemberBranchTargetEldoret,
    // septemberBranchTargetBusia,
    // septemberBranchTargetMsaGpo,
    // septemberBranchTargetKitale,
    // septemberBranchTargetKisii,
    // // October
    // octoberBranchTargetSyokimau,
    // octoberBranchTargetTassia,
    // octoberBranchTargetMachakos,
    // octoberBranchTargetMtwapa,
    // octoberBranchTargetKasarani,
    // octoberBranchTargetEldoret,
    // octoberBranchTargetBusia,
    // octoberBranchTargetMsaGpo,
    // octoberBranchTargetKitale,
    // octoberBranchTargetKisii,
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
    [], // customerMemberAnalysisSummary
    [], // customerMemberAnalysisBranch
    [], // customerMemberAnalysisCohort
    salesTarget,
    salesTargetSummary,
    salesTargetBranch,
    julySalesTarget,
    augustSalesTarget,
    septemberSalesTarget,
    octoberSalesTarget,
    filters,
  );

  const { currentYearStart, today } = getDateRanges();

  useEffect(() => {
    const params = {
      clientid: 1,
      startDate: currentYearStart,
      endDate: today,
      branchcode: filters.branch,
      PivotMetric: "ALL",
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
    dispatch(
      getSalesTarget({
        ...params,
        groupBy: "MONTHLY_PIVOT",
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
      startDate: currentYearStart,
      endDate: today,
      branchcode: filters.branch,
      PivotMetric: "ALL",
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
    dispatch(
      getSalesTarget({
        ...params,
        groupBy: "MONTHLY_PIVOT",
      }),
    );

    };
  const selectedBranchName =
    filters.branch == null || filters.branch === ""
      ? ""
      : (marginAnalysisDrilldown || []).find(
          (m) => Number(m.branch_id) === Number(filters.branch),
        )?.branch_name || "Unknown Branch";
  document.title = "Sales Target | phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Sales target"
          pageTitle="Dashboards"
          subtitle={selectedBranchName}
        />

        <Row>
          <Col xl={12}>
 <BranchTarget
  // branchTargets={branchTargets}
  // getBranchTarget={getBranchTarget}

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
export default SalesTarget;
