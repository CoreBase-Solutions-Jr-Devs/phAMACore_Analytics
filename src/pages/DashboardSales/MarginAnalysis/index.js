import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardSales/MarginAnalysis/reducer";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import FilterActions from "../../../Components/Common/FilterActions";
import Bands from "./Bands";
import Drilldown from "./Drilldown";
// import MarginSKU from "./MarginSKU";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getMarginAnalysis } from "../../../slices/dashboardSales/MarginAnalysis/thunk";
import { clearMarginAnalysisData } from "../../../slices/dashboardSales/MarginAnalysis/reducer";

const MarginAnalysis = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);
const [selectedMarginBand, setSelectedMarginBand] = useState("ALL");
  const {
    marginAnalysisBand = [],
    marginAnalysisDrilldown = [],
    marginAnalysisSKU = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.marginAnalysis);

const {
  marginDrilldown,
  marginBand25,
  marginBand25To30,
  marginBand30To45,
  marginBandAbove45,
  marginDrilldown25,
  marginDrilldown25To30,
  marginDrilldown30To45,
  marginDrilldownAbove45,
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
  [], // 11. salesSubgroup — missing in your current call
  [], // 12. monthlySales
  [], // 13. monthToDateSales
  [], // 14. lastYearMonthToDateSales
  [], // 15. lastYearMonthlySales
  marginAnalysisBand,       // 16
  marginAnalysisDrilldown,  // 17
  marginAnalysisSKU,        // 18
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

  console.log("Raw marginAnalysisBand from Redux:", marginAnalysisBand);
console.log("Is array:", Array.isArray(marginAnalysisBand));

const handleMarginBandSelect = (band) => {
  setSelectedMarginBand(band);

  dispatch(
    getMarginAnalysis({
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch,
      TopN: 500,
      MarginBand: band === "ALL" ? "" : band,
      groupBy: "DRILLDOWN",
    }),
  );
};

  useEffect(() => {
    const params = {
      clientid: 1,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchcode: filters.branch,
      TopN: 500,
    };

    dispatch(
      getMarginAnalysis({
        ...params,
        // MarginBand: "",
        groupBy: "SKU",
      }),
    );

    dispatch(
      getMarginAnalysis({
        ...params,
        groupBy: "BAND",
      }),
    );



   
      dispatch(
        getMarginAnalysis({
          ...params,
        // MarginBand: "",
              MarginBand: selectedMarginBand === "ALL" ? "" : selectedMarginBand,

          groupBy: "DRILLDOWN",
        }),
      );
    
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearMarginAnalysisData());
    };
  }, [dispatch]);

  const handleApplyFilters = () => {
 const params = {
    clientid: 1,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branchcode: filters.branch,
    TopN: 500,
  };

  dispatch(
    getMarginAnalysis({
      ...params,
      groupBy: "BAND",
    }),
  );

  dispatch(
    getMarginAnalysis({
      ...params,
        // MarginBand: "",
      MarginBand: selectedMarginBand === "ALL" ? "" : selectedMarginBand,

      groupBy: "DRILLDOWN",
    }),
  );

  dispatch(
    getMarginAnalysis({
      ...params,
        MarginBand: "",

      groupBy: "SKU",
    }),
  );
};
  const selectedBranchName =
    filters.branch == null || filters.branch === ""
      ? "All Branches"
      : (marginAnalysisDrilldown || []).find(
          (m) => Number(m.branch_id) === Number(filters.branch),
        )?.branch_name || "Unknown Branch";
  document.title = "Margin Analysis | phAMACore Analytics";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Margin Analysis"
          pageTitle="Dashboards"
          subtitle={selectedBranchName}
        />

        <Row>
          <Col xl={12}>
            <Bands
              marginBand25={marginBand25}
              marginBand25To30={marginBand25To30}
              marginBand30To45={marginBand30To45}
              marginBandAbove45={marginBandAbove45}
              // marginDrilldown25={marginDrilldown25}
              // marginDrilldown25To30={marginDrilldown25To30}
              // marginDrilldown30To45={marginDrilldown30To45}
              // marginDrilldownAbove45={marginDrilldownAbove45}
              selectedBranchName={selectedBranchName}
              loading={loading}
              error={error}
              rightClickBtn={toggleRightColumn}
            />
          </Col>
        </Row>
        <Row>
          <Col xl={12}>
       <Drilldown
  data={marginDrilldown}
  activeBand={selectedMarginBand}
  onBandChange={handleMarginBandSelect}
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

export default MarginAnalysis;
