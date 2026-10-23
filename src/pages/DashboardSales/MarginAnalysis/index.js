
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

  const {
    marginAnalysisBand = [],
    marginAnalysisDrilldown = [],
    marginAnalysisSKU = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.marginAnalysis);

const {
  marginBand25,
  marginBand25To30,
  marginBand30To45,
  marginBandAbove45,
    marginDrilldown25,
  marginDrilldown25To30,
  marginDrilldown30To45,
  marginDrilldownAbove45,
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
  marginAnalysisBand,
  marginAnalysisDrilldown,
  marginAnalysisSKU,
  filters
);

  useEffect(() => {
   
     const params = {
          clientid: 1,
          startDate: filters.startDate,
          endDate: filters.endDate,
          branchcode: filters.branch,
          MarginBand: "",
          TopN: 500,
        };
    
        dispatch(
          getMarginAnalysis({
            ...params,
            groupBy: "SKU",
          }),
        );
    
        dispatch(
          getMarginAnalysis({
            ...params,
            groupBy: "DRILLDOWN",
          }),
        );
    
        dispatch(
          getMarginAnalysis({
            ...params,
            groupBy: "BAND",
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
          MarginBand: "",
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
            groupBy: "DRILLDOWN",
          }),
        );
    
        
         dispatch(
          getMarginAnalysis({
            ...params,
            groupBy: "SKU",
          }),
        );
    
  };
const selectedBranchName =
  filters.branch == null || filters.branch === ""
    ? ""
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
             subtitle={ selectedBranchName
          }
        />

        <Row>
          <Col xl={12}>
            <Bands
              marginBand25={marginBand25}
  marginBand25To30={marginBand25To30}
  marginBand30To45={marginBand30To45}
  marginBandAbove45={marginBandAbove45}
      marginDrilldown25={marginDrilldown25}
  marginDrilldown25To30={marginDrilldown25To30}
  marginDrilldown30To45={marginDrilldown30To45}
  marginDrilldownAbove45={marginDrilldownAbove45}
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
  onDateRangeChange={(value) =>
    dispatch(setDateRange(value))
  }
  onStartDateChange={(value) =>
    dispatch(setStartDate(value))
  }
  onEndDateChange={(value) =>
    dispatch(setEndDate(value))
  }
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
