import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { exportDashboardReportToExcel, triggerPrint } from "../../helpers/export_helper";
import { computeKPIs, getKPIMeta, getExpiryRows, getLookbackDays } from "../utils/StockInventoryUtils";
import { resolveBranchName, cleanBranchName } from "../../helpers/branch_helper";
import { formatAmount } from "../../helpers/format_helper";
import DashboardSectionHeader from "../../Components/Common/DashboardSectionHeader";

const Section = ({ rightClickBtn, onExportExcel, title = "KEY METRICS" }) => {
  const {
    batchExpiryNeo = [],
    totalStockValueByBranch = [],
    stockVsMovement = [],
    stockHealth = [],
    criticalStockouts = [],
    slowMovingStock = [],
    imbalances = [],
    branches = [],
    filters = {},
    appliedFilters,
  } = useSelector((state) => state.StockInventory ?? {});

  const { branch, startDate, endDate } = appliedFilters || filters;
  const lookbackDays = getLookbackDays(startDate, endDate);

  const isBranchView = Boolean(branch && branch !== "All Branches" && Number(branch) > 0);
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
    () => computeKPIs(batchExpiryNeo, stockHealth, imbalances, expiryOptions, slowMovingStock, criticalStockouts),
    [batchExpiryNeo, stockHealth, imbalances, expiryOptions, slowMovingStock, criticalStockouts]
  );

  // Stock figures are live: show when the valuation was taken
  const stockAsOf = useMemo(() => {
    const raw = totalStockValueByBranch?.[0]?.as_of_date;
    if (!raw) return null;
    const date = new Date(raw);
    date.setDate(date.getDate() - 1);
    return date.toLocaleDateString("en-GB");
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

    // 5. Stock VS Cost of Sales - Branch Coverage
    const branchCoverageRows = (stockVsMovement || []).map((item) => ({
      Branch: cleanBranchName(item.branch_name || item.branchName || `Branch ${item.branch_id || ""}`),
      StockedSKUs: Number(item.stocked_skus || 0).toLocaleString(),
      TotalPieces: Number(item.total_stock_pieces || 0).toLocaleString(),
      StockAtCost: formatAmount(item.stock_at_cost),
      MonthlyCOGS: formatAmount(item.monthly_cost_of_sales),
      DailyCOGS: formatAmount(Number(item.monthly_cost_of_sales || 0) / 30),
      CoverDays: Number(item.stock_cover_days || 0) >= 999 ? "999+ days" : `${Number(item.stock_cover_days || 0)} days`,
      HealthStatus: item.stock_health_status || "HEALTHY",
    }));

    const sections = [
      {
        title: "Key Metrics Summary",
        headers: ["Metric", "Value", "Status"],
        data: kpiSummaryRows,
      },
    ];

    if (branchCoverageRows.length > 0) {
      sections.push({
        title: "Stock VS Cost of Sales - Branch Coverage",
        headers: ["Branch", "StockedSKUs", "TotalPieces", "StockAtCost", "MonthlyCOGS", "DailyCOGS", "CoverDays", "HealthStatus"],
        data: branchCoverageRows,
      });
    }

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

  return (
    <DashboardSectionHeader
      title={title}
      isBranchView={isBranchView}
      branchDisplayName={branchDisplayName}
      startDate={startDate}
      endDate={endDate}
      stockAsOf={stockAsOf}
      onExportExcel={onExportExcel || handleExportExcel}
      onPrint={handlePrint}
      onFilterClick={rightClickBtn}
    />
  );
};

export default Section;
