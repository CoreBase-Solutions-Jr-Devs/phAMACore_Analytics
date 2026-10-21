import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import SalesTargetFilterActions from "../../DashboardSales/SalesTarget/FilterActions";

// import Bands from "./Bands";
// import Drilldown from "./Drilldown";
// import MarginSKU from "./MarginSKU";
import useSalesAnalytics from "../../../Components/Hooks/useSalesAnalytics";
import { getSalesTarget,   getJulySalesTarget,
  getAugustSalesTarget,
  getSeptemberSalesTarget,
  getOctoberSalesTarget, } from "../../../slices/dashboardSales/SalesTarget/thunk";
import { clearSalesTargetData } from "../../../slices/dashboardSales/SalesTarget/reducer";
import { getPeriod } from "../../../helpers/date_helper";
import BranchTarget from "./BranchTarget";
const SalesTarget = () => {
  const dispatch = useDispatch();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => setRightColumn((prev) => !prev);

  const {
  
  salesTarget = [],
salesTargetSummary = [],
salesTargetBranch = [],
julySalesTarget = [],
augustSalesTarget = [],
septemberSalesTarget = [],
octoberSalesTarget = [],
    filters,
    loading,
    error,
  } = useSelector((state) => state.salesTarget);

const {
    branchTargetSyokimau,
  branchTargetTassia,
  branchTargetMachakos,
  branchTargetMtwapa,
  branchTargetKasarani,
  branchTargetEldoret,
  branchTargetBusia,
  branchTargetMsaGpo,
  branchTargetKitale,
  branchTargetKisii,
  
julyBranchTargetSyokimau,
julyBranchTargetTassia,
julyBranchTargetMachakos,
julyBranchTargetMtwapa,
julyBranchTargetKasarani,
julyBranchTargetEldoret,
julyBranchTargetBusia,
julyBranchTargetMsaGpo,
julyBranchTargetKitale,
julyBranchTargetKisii,

// August
augustBranchTargetSyokimau,
augustBranchTargetTassia,
augustBranchTargetMachakos,
augustBranchTargetMtwapa,
augustBranchTargetKasarani,
augustBranchTargetEldoret,
augustBranchTargetBusia,
augustBranchTargetMsaGpo,
augustBranchTargetKitale,
augustBranchTargetKisii,

// September
septemberBranchTargetSyokimau,
septemberBranchTargetTassia,
septemberBranchTargetMachakos,
septemberBranchTargetMtwapa,
septemberBranchTargetKasarani,
septemberBranchTargetEldoret,
septemberBranchTargetBusia,
septemberBranchTargetMsaGpo,
septemberBranchTargetKitale,
septemberBranchTargetKisii,

// October
octoberBranchTargetSyokimau,
octoberBranchTargetTassia,
octoberBranchTargetMachakos,
octoberBranchTargetMtwapa,
octoberBranchTargetKasarani,
octoberBranchTargetEldoret,
octoberBranchTargetBusia,
octoberBranchTargetMsaGpo,
octoberBranchTargetKitale,
octoberBranchTargetKisii,
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
salesTarget,
salesTargetSummary,
salesTargetBranch,
  filters
);
const period = getPeriod(filters.startDate);

useEffect(() => {
  const today = new Date();

  const formatDate = (date) => date.toLocaleDateString("en-GB");

  const getMonthDates = (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const endDate =
      year === today.getFullYear() &&
      month === today.getMonth() + 1
        ? today
        : lastDay;

    return {
      clientid: 1,
      StartDate: formatDate(startDate),
      EndDate: formatDate(endDate),
      Year: year,
      Month: month,
      GroupBy: "BRANCH",
    };
  };

  // July Sales Target
  dispatch(getJulySalesTarget(getMonthDates(2026, 7)));

  // August Sales Target
  dispatch(getAugustSalesTarget(getMonthDates(2026, 8)));

  // September Sales Target
  dispatch(getSeptemberSalesTarget(getMonthDates(2026, 9)));

  // October Sales Target
  dispatch(getOctoberSalesTarget(getMonthDates(2026, 10)));
}, [dispatch]);

   useEffect(() => {
      return () => {
        dispatch(clearSalesTargetData());
      };
    }, [dispatch]);

  const handleApplyFilters = () => {
   
   const startYear = 2026;
const startMonth = 7; // July

const currentDate = new Date();
const endYear = currentDate.getFullYear();
const endMonth = currentDate.getMonth() + 1;

for (
  let year = startYear, month = startMonth;
  year < endYear || (year === endYear && month <= endMonth);
  month++
) {
  if (month > 12) {
    month = 1;
    year++;
  }

  // First day of this month
  const monthStart = new Date(year, month - 1, 1);

  // Last day of previous months; today for the current month
  const monthEnd =
    year === endYear && month === endMonth
      ? currentDate
      : new Date(year, month, 0);

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB");

  const params = {
    clientid: 1,
    startDate: formatDate(monthStart),
    endDate: formatDate(monthEnd),
    // branchcode: filters.branch || "",
    Year: String(year),
    Month: String(month).padStart(2, "0"),
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
}
    
        
        //  dispatch(
        //   getMarginAnalysis({
        //     ...params,
        //     groupBy: "SKU",
        //   }),
        // );
    
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
             subtitle={ selectedBranchName
          }
        />

        <Row>
          <Col xl={12}>
 <BranchTarget
  // branchTargets={branchTargets}
  // getBranchTarget={getBranchTarget}

  branchTargetSyokimau={branchTargetSyokimau}
  branchTargetTassia={branchTargetTassia}
  branchTargetMachakos={branchTargetMachakos}
  branchTargetMtwapa={branchTargetMtwapa}
  branchTargetKasarani={branchTargetKasarani}
  branchTargetEldoret={branchTargetEldoret}
  branchTargetBusia={branchTargetBusia}
  branchTargetMsaGpo={branchTargetMsaGpo}
  branchTargetKitale={branchTargetKitale}
  branchTargetKisii={branchTargetKisii}

 
  julyBranchTargetSyokimau={julyBranchTargetSyokimau}
  julyBranchTargetTassia={julyBranchTargetTassia}
  julyBranchTargetMachakos={julyBranchTargetMachakos}
  julyBranchTargetMtwapa={julyBranchTargetMtwapa}
  julyBranchTargetKasarani={julyBranchTargetKasarani}
  julyBranchTargetEldoret={julyBranchTargetEldoret}
  julyBranchTargetBusia={julyBranchTargetBusia}
  julyBranchTargetMsaGpo={julyBranchTargetMsaGpo}
  julyBranchTargetKitale={julyBranchTargetKitale}
  julyBranchTargetKisii={julyBranchTargetKisii}

 
  augustBranchTargetSyokimau={augustBranchTargetSyokimau}
  augustBranchTargetTassia={augustBranchTargetTassia}
  augustBranchTargetMachakos={augustBranchTargetMachakos}
  augustBranchTargetMtwapa={augustBranchTargetMtwapa}
  augustBranchTargetKasarani={augustBranchTargetKasarani}
  augustBranchTargetEldoret={augustBranchTargetEldoret}
  augustBranchTargetBusia={augustBranchTargetBusia}
  augustBranchTargetMsaGpo={augustBranchTargetMsaGpo}
  augustBranchTargetKitale={augustBranchTargetKitale}
  augustBranchTargetKisii={augustBranchTargetKisii}

  septemberBranchTargetSyokimau={septemberBranchTargetSyokimau}
  septemberBranchTargetTassia={septemberBranchTargetTassia}
  septemberBranchTargetMachakos={septemberBranchTargetMachakos}
  septemberBranchTargetMtwapa={septemberBranchTargetMtwapa}
  septemberBranchTargetKasarani={septemberBranchTargetKasarani}
  septemberBranchTargetEldoret={septemberBranchTargetEldoret}
  septemberBranchTargetBusia={septemberBranchTargetBusia}
  septemberBranchTargetMsaGpo={septemberBranchTargetMsaGpo}
  septemberBranchTargetKitale={septemberBranchTargetKitale}
  septemberBranchTargetKisii={septemberBranchTargetKisii}

  octoberBranchTargetSyokimau={octoberBranchTargetSyokimau}
  octoberBranchTargetTassia={octoberBranchTargetTassia}
  octoberBranchTargetMachakos={octoberBranchTargetMachakos}
  octoberBranchTargetMtwapa={octoberBranchTargetMtwapa}
  octoberBranchTargetKasarani={octoberBranchTargetKasarani}
  octoberBranchTargetEldoret={octoberBranchTargetEldoret}
  octoberBranchTargetBusia={octoberBranchTargetBusia}
  octoberBranchTargetMsaGpo={octoberBranchTargetMsaGpo}
  octoberBranchTargetKitale={octoberBranchTargetKitale}
  octoberBranchTargetKisii={octoberBranchTargetKisii}

  selectedBranchName={selectedBranchName}
  loading={loading}
  error={error}
  rightClickBtn={toggleRightColumn}
/>
          </Col>

             <SalesTargetFilterActions
          onApply={handleApplyFilters}
          rightColumn={rightColumn}
            hideRightColumn={toggleRightColumn}
        />
        </Row>

     
      </Container>
    </div>
  );
};
export default SalesTarget