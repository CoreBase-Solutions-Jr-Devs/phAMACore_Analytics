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
 const [selectedBranchName, setSelectedBranchName] =
    useState("All Branches");
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
  [], // 11. salesPeriodicBreakdown <-- ADD THIS
  [], // 12. salesSubgroup
  [], // 13. monthlySales
  [], // 14. monthToDateSales
  [], // 15. lastYearMonthToDateSales
  [], // 16. lastYearMonthlySales
  marginAnalysisBand,      // 17. marginAnalysisBand
  marginAnalysisDrilldown, // 18. marginAnalysisDrilldown
  marginAnalysisSKU,       // 19. marginAnalysisSku
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
  filters, // 31. filters
);



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
  // const selectedBranchName =
  //   filters.branch == null || filters.branch === ""
  //     ? "All Branches"
  //     : (marginAnalysisDrilldown || []).find(
  //         (m) => Number(m.branch_id) === Number(filters.branch),
  //       )?.branch_name || "Unknown Branch";
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
  marginDrilldownData={marginDrilldown}
    marginAnalysisSKUData={marginAnalysisSKU}
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

export default MarginAnalysis;
