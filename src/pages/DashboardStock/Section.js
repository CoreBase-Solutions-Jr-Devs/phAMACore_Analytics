import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { exportDashboardReportToExcel, triggerPrint } from "../../helpers/export_helper";
import { computeKPIs } from "../utils/StockInventoryUtils";
import { useImbalanceEngine } from "./components/ImbalanceAlerts/useImbalanceEngine";
import { resolveBranchName, cleanBranchName } from "../../helpers/branch_helper";
import { formatAmount } from "../../helpers/format_helper";

const Section = ({ rightClickBtn }) => {
  const {
    dailyClosingStock = [],
    stockMovements = [],
    batchExpiryNeo = [],
    totalStockValueByBranch = [],
    stockHealth = [],
    slowMovingStock = [],
    branches = [],
    filters = {},
  } = useSelector((state) => state.StockInventory ?? {});

  const { branch, startDate, endDate } = filters;

  const isBranchView = Boolean(branch && branch !== "All Branches");
  const branchDisplayName = useMemo(() => {
    if (!isBranchView) return "All Branches";
    return (
      cleanBranchName(
        resolveBranchName(branch, branches, stockMovements) || `Branch ${branch}`
      ) || "All Branches"
    );
  }, [branch, branches, stockMovements, isBranchView]);

  const alerts = useMemo(
    () => useImbalanceEngine(dailyClosingStock, stockMovements, batchExpiryNeo),
    [dailyClosingStock, stockMovements, batchExpiryNeo]
  );

  const kpis = useMemo(
    () =>
      computeKPIs(
        dailyClosingStock,
        stockMovements,
        batchExpiryNeo,
        totalStockValueByBranch,
        stockHealth,
        slowMovingStock,
        alerts
      ),
    [
      dailyClosingStock,
      stockMovements,
      batchExpiryNeo,
      totalStockValueByBranch,
      stockHealth,
      slowMovingStock,
      alerts,
    ]
  );

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
    const kpiSummaryRows = (kpis || []).map((k) => ({
      Metric: k.title,
      Value: typeof k.value === "number" ? formatAmount(k.value) : k.value || 0,
      Status: k.subtitle || "",
    }));

    // 2. Expiry Watch Items (Near Expiry 90 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 90);

    const expiryRows = (batchExpiryNeo || [])
      .filter((item) => {
        if (!item.expirydate) return false;
        const exp = new Date(item.expirydate);
        return !isNaN(exp.getTime()) && exp >= today && exp <= cutoff;
      })
      .map((item) => {
        const qty = Number(item.qtyBal || 0);
        const val = Number(item.costValue || 0);
        return {
          Product: item.invName || item.itemName || "",
          Branch: cleanBranchName(item.branchName || item.branch_name || ""),
          ExpiryDate: new Date(item.expirydate).toLocaleDateString("en-GB"),
          QtyBalance: qty.toLocaleString(),
          CostValue: val.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        };
      });

    // 3. Slow Moving Stock
    const slowMovingRows = (slowMovingStock || []).slice(0, 30).map((item) => ({
      ProductCode: item.itemcode || item.itemCode || "",
      ProductName: item.itemname || item.itemName || "",
      Branch: cleanBranchName(item.branchname || item.branchName || ""),
      StockValue: Number(item.stock_value || item.stockValue || 0).toLocaleString(
        undefined,
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      ),
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

    if (expiryRows.length > 0) {
      sections.push({
        title: "Expiry Watch (90-Day Write-Off Risk)",
        headers: ["Product", "Branch", "ExpiryDate", "QtyBalance", "CostValue"],
        data: expiryRows,
      });
    }

    if (slowMovingRows.length > 0) {
      sections.push({
        title: "Slow Moving Stock (30-Day Lookback)",
        headers: ["ProductCode", "ProductName", "Branch", "StockValue"],
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
      </div>

      {/* Right - Action Buttons */}
      <div className="d-flex align-items-center gap-2 no-print">
        <button
          type="button"
          className="btn btn-soft-success d-flex align-items-center gap-1"
          onClick={handleExportExcel}
          title="Export to Excel"
        >
          <i className="ri-file-excel-2-line align-bottom"></i>
          <span>Export Excel</span>
        </button>

        <button
          type="button"
          className="btn btn-soft-info d-flex align-items-center gap-1"
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
