import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { exportDashboardReportToExcel, triggerPrint } from "../../helpers/export_helper";
import { getCachedBranchName } from "../../helpers/branch_helper";
import { formatAmount } from "../../helpers/format_helper";
import DashboardSectionHeader from "../../Components/Common/DashboardSectionHeader";

const Section = ({ rightClickBtn, kpiData = {} }) => {
  const appliedFilters = useSelector(
    (state) => (state.DashboardMyBusiness || state.MyBusiness)?.appliedFilters || {}
  );

  const { branch, startDate, endDate } = appliedFilters;

  const isBranchView = Boolean(branch && branch !== "All Branches");
  const branchDisplayName = useMemo(() => {
    if (!isBranchView) return "All Branches";
    return getCachedBranchName(branch) || `Branch ${branch}`;
  }, [branch, isBranchView]);

  const handleExportExcel = () => {
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const fileName = `MyBusiness_Analytics_${todayStr}`;

    const metadata = [
      { label: "Report", value: "My Business Dashboard Report" },
      { label: "Generated Date", value: new Date().toLocaleString("en-GB") },
      { label: "Branch", value: isBranchView ? branchDisplayName : "All Branches" },
      { label: "Date Range Filter", value: `${startDate || ""} to ${endDate || ""}` },
    ];

    const kpiMetricsRows = [
      { Metric: "Receivables", Amount: formatAmount(kpiData.receivables || 0), Notes: "Customer balances" },
      { Metric: "Payables", Amount: formatAmount(kpiData.payables || 0), Notes: "Supplier balances" },
      { Metric: "Total Sales", Amount: formatAmount(kpiData.sales || 0), Notes: "Sales revenue" },
      { Metric: "Cash Available", Amount: formatAmount(kpiData.cashAvailable || 0), Notes: "Cash collected in the period" },
      { Metric: "Gross Profit", Amount: formatAmount(kpiData.stockProfit || 0), Notes: "Sales less cost of sales" },
      { Metric: "Collections", Amount: formatAmount(kpiData.collections || 0), Notes: "Customer payments received" },
    ];

    const sections = [
      {
        title: "Key Metrics Summary",
        headers: ["Metric", "Amount", "Notes"],
        data: kpiMetricsRows,
      },
    ];

    exportDashboardReportToExcel(
      {
        title: "My Business Analytics Report",
        metadata,
        sections,
      },
      fileName
    );
  };

  const handlePrint = () => {
    triggerPrint();
  };

  return (
    <DashboardSectionHeader
      title="KEY METRICS"
      isBranchView={isBranchView}
      branchDisplayName={branchDisplayName}
      startDate={startDate}
      endDate={endDate}
      onExportExcel={handleExportExcel}
      onPrint={handlePrint}
      onFilterClick={rightClickBtn}
    />
  );
};

export default Section;
