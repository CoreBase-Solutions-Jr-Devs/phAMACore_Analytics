import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { exportDashboardReportToExcel, triggerPrint } from "../../helpers/export_helper";
import { computeKPIs, getKPIMeta, getExpiryRows, getLookbackDays } from "../utils/StockInventoryUtils";
import { resolveBranchName, cleanBranchName } from "../../helpers/branch_helper";
import { formatAmount } from "../../helpers/format_helper";

const Section = ({ rightClickBtn }) => {
  const {
    batchExpiryNeo = [],
    totalStockValueByBranch = [],
    stockHealth = [],
    slowMovingStock = [],
    imbalances = [],
    branches = [],
    filters = {},
  } = useSelector((state) => state.StockInventory ?? {});

  const { branch, startDate, endDate } = filters;
  const lookbackDays = getLookbackDays(startDate, endDate);

  const isBranchView = Boolean(branch && branch !== "All Branches");
  const branchDisplayName = useMemo(() => {
    if (!isBranchView) return "All Branches";
    return (
      cleanBranchName(resolveBranchName(branch, branches) || `Branch ${branch}`) || "All Branches"
    );
  }, [branch, branches, isBranchView]);

  const expiryOptions = useMemo(
    () => ({ branchCode: branch, branches, asOfDate: endDate }),
    [branch, branches, endDate]
  );

  const kpis = useMemo(
    () => computeKPIs(batchExpiryNeo, stockHealth, imbalances, expiryOptions),
    [batchExpiryNeo, stockHealth, imbalances, expiryOptions]
  );

  // Stock figures are live: show when the valuation was taken
  const stockAsOf = useMemo(() => {
    const raw = totalStockValueByBranch?.[0]?.as_of_date;
    const date = raw ? new Date(raw) : null;
    return date && !isNaN(date.getTime()) ? date.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "";
  }, [totalStockValueByBranch]);

  const handleExportExcel = () => {
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const fileName = `InventoryStock_Analytics_${todayStr}`;

    const metadata = [
      { label: "Report", value: "Inventory & Stock Dashboard Report" },
      { label: "Generated Date", value: new Date().toLocaleString("en-GB") },
      { label: "Branch", value: isBranchView ? branchDisplayName : "All Branches" },
      { label: "Date Range Filter", value: `${startDate || ""} to ${endDate || ""}` },
    ];

    // 1. KPI Summary
    const kpiSummaryRows = getKPIMeta({ lookbackDays }).map((k) => ({
      Metric: k.label,
      Value: formatAmount(kpis[k.id] ?? 0, 0),
      Status: k.subtitle || "",
    }));

    // 2. Expiry Watch (separated into Expired and Write-Off Risk)
    const allExpiryRows = getExpiryRows(batchExpiryNeo, expiryOptions);
    const expiredRows = allExpiryRows
      .filter((row) => row.daysRemaining < 0)
      .map((row) => ({
        Product: row.product,
        Batch: row.batch || "-",
        Branch: row.branch,
        ExpiryDate: row.expiry.toLocaleDateString("en-GB"),
        DaysExpired: Math.abs(row.daysRemaining),
        QtyBalance: row.qty.toLocaleString(),
        CostValue: formatAmount(row.value),
        Action: row.action,
      }));

    const writeOffRiskRows = allExpiryRows
      .filter((row) => row.daysRemaining >= 0)
      .map((row) => ({
        Product: row.product,
        Batch: row.batch || "-",
        Branch: row.branch,
        ExpiryDate: row.expiry.toLocaleDateString("en-GB"),
        DaysRemaining: row.daysRemaining,
        QtyBalance: row.qty.toLocaleString(),
        CostValue: formatAmount(row.value),
        Action: row.action,
      }));

    // 3. Slow Moving Stock
    const slowMovingRows = (slowMovingStock || []).map((item) => ({
      ProductCode: item.item_code || "",
      ProductName: item.item_name || "",
      Category: item.item_group || "-",
      Branch: cleanBranchName(item.branch_name || ""),
      Status: item.movement_category || "",
      CurrentStock: Number(item.current_stock_qty || 0).toLocaleString(),
      UnitsSold: Number(item.units_sold_window || 0).toLocaleString(),
      TiedUpCapital: formatAmount(item.tied_up_capital),
    }));

    // 4. Branch Stock Breakdown
    const branchStockRows = (totalStockValueByBranch || []).map((item) => ({
      Branch: cleanBranchName(item.branchName || item.branch_name || `Branch ${item.branch_id || ""}`),
      StockValue: Number(item.total_stock_value || item.stock_value || 0).toLocaleString(
        undefined,
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      ),
    }));

    const sections = [
      {
        title: "Key Metrics Summary",
        headers: ["Metric", "Value", "Status"],
        data: kpiSummaryRows,
      },
    ];

    if (expiredRows.length > 0) {
      sections.push({
        title: "Expired Products",
        headers: ["Product", "Batch", "Branch", "ExpiryDate", "DaysExpired", "QtyBalance", "CostValue", "Action"],
        data: expiredRows,
      });
    }

    if (writeOffRiskRows.length > 0) {
      sections.push({
        title: "Write-Off Risk Products (0 - 90 Days)",
        headers: ["Product", "Batch", "Branch", "ExpiryDate", "DaysRemaining", "QtyBalance", "CostValue", "Action"],
        data: writeOffRiskRows,
      });
    }

    if (slowMovingRows.length > 0) {
      sections.push({
        title: `Slow Moving Stock (${lookbackDays}-Day Lookback)`,
        headers: ["ProductCode", "ProductName", "Category", "Branch", "Status", "CurrentStock", "UnitsSold", "TiedUpCapital"],
        data: slowMovingRows,
      });
    }

    if (branchStockRows.length > 0) {
      sections.push({
        title: "Stock Value by Branch",
        headers: ["Branch", "StockValue"],
        data: branchStockRows,
      });
    }

    exportDashboardReportToExcel(
      {
        title: "Inventory & Stock Analytics Report",
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
        {isBranchView && branchDisplayName && (
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
        {stockAsOf && (
          <>
            <span className="mx-1 text-muted">|</span>
            <span>Stock as at:</span>
            <strong className="text-dark">{stockAsOf}</strong>
          </>
        )}
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
