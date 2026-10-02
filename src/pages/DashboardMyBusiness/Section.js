import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { exportDashboardReportToExcel, triggerPrint } from "../../helpers/export_helper";
import { getCachedBranchName } from "../../helpers/branch_helper";
import { formatAmount } from "../../helpers/format_helper";

const Section = ({ rightClickBtn, kpiData = {} }) => {
  const { filters = {} } = useSelector(
    (state) =>
      state.DashboardMyBusiness ||
      state.MyBusiness || { filters: {} }
  );

  const { branch, startDate, endDate } = filters;

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
      { Metric: "Cash Available", Amount: formatAmount(kpiData.cashAvailable || 0), Notes: "Total cash collections" },
      { Metric: "Stock Profit", Amount: formatAmount(kpiData.stockProfit || 0), Notes: "Gross profit" },
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

  const formatDisplay = (date) => date || "";

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      {/* Title */}
      <h4 className="card-title mb-0">KEY METRICS</h4>

      {/* Center - Filter indicators */}
      <div className="d-flex align-items-center gap-2 flex-wrap text-muted fs-13">
        {isBranchView && (
          <>
            <span>Branch:</span>
            <strong className="text-primary">{branchDisplayName}</strong>
            <span className="mx-1 text-muted">|</span>
          </>
        )}
        <span>Filtered From:</span>
        <strong className="text-dark">{formatDisplay(startDate)}</strong>
        <span>to</span>
        <strong className="text-dark">{formatDisplay(endDate)}</strong>
      </div>

      {/* Right - Action Buttons */}
      <div className="d-flex align-items-center gap-2 no-print">
        <button
          type="button"
          className="btn btn-soft-success btn-export-excel d-flex align-items-center gap-1"
          onClick={handleExportExcel}
          title="Export to Excel"
        >
          <i className="ri-file-excel-2-line align-bottom"></i>
          <span>Export Excel</span>
        </button>

        <button
          type="button"
          className="btn btn-soft-info btn-export-print d-flex align-items-center gap-1"
          onClick={handlePrint}
          title="Print Dashboard"
        >
          <i className="ri-printer-line align-bottom"></i>
          <span>Print</span>
        </button>

        <button
          type="button"
          className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
          onClick={rightClickBtn}
          title="Filter by Branch & Date Range"
        >
          <i className="ri-filter-fill align-bottom"></i>
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
};

export default Section;
