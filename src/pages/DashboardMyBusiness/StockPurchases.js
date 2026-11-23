import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, Spinner } from "reactstrap";
import { StockPurchasesCharts } from "./DashboardMyBusinessCharts";
import { exportToExcel } from "../../helpers/export_helper";
import { cleanBranchName, getCachedBranchName } from "../../helpers/branch_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import FloatingTooltip from "../../Components/Common/FloatingTooltip";
import TrendCardBody, { exportStamp, money } from "./TrendCardBody";
import useTableCellTooltip from "./useTableCellTooltip";
import { fetchStockConversionTrend } from "../../slices/dashboardMyBusiness/thunk";
import { formatCompact, formatCurrency } from "../utils/formatHelper";
import { pick, num } from "../utils/apiRow";

const StockPurchases = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("monthly");
  const [drillBranch, setDrillBranch] = useState(null); // { code, name } for inline branch drill-down
  const { hoverInfo, getCellTooltipHandlers, clearTooltip } = useTableCellTooltip();

  const {
    stockConversionTrend = [],
    loadingStockConversionTrend,
    errorStockConversionTrend,
    stockConversionByBranch = [],
    loadingStockConversionByBranch,
    errorStockConversionByBranch,
    appliedFilters = {},
  } = useSelector((state) => state.DashboardMyBusiness || state.MyBusiness || {});

  // Clear inline drill-down if the global branch filter changes
  useEffect(() => {
    setDrillBranch(null);
  }, [appliedFilters.branch, appliedFilters.startDate, appliedFilters.endDate]);

  // Refetch monthly trend when inline branch drill-down changes
  useEffect(() => {
    if (drillBranch === null && appliedFilters.branch == null) return;
    const effectiveBranch = drillBranch?.code ?? appliedFilters.branch ?? null;
    dispatch(
      fetchStockConversionTrend({
        StartDate: appliedFilters.startDate,
        EndDate: appliedFilters.endDate,
        branchcode: effectiveBranch,
        GroupBy: "MONTHLY",
        whichcost: 1,
        IncludeBlocked: true,
      })
    );
  }, [dispatch, drillBranch, appliedFilters.startDate, appliedFilters.endDate, appliedFilters.branch]);

  const isBranchDrill = Boolean(drillBranch?.code || appliedFilters.branch);
  const activeBranchLabel = drillBranch?.name
    ? drillBranch.name
    : appliedFilters.branch
    ? cleanBranchName(getCachedBranchName(appliedFilters.branch) || `Branch ${appliedFilters.branch}`)
    : null;

  const monthlyData = useMemo(() => {
    const sorted = [...(stockConversionTrend || [])].sort(
      (a, b) => num(pick(a, "month_seq")) - num(pick(b, "month_seq"))
    );
    const bar1Label =
      pick(sorted[0], "bar1_inflow_label") ||
      (isBranchDrill ? "Transfers Received (In)" : "Purchases Received (Net)");

    const categories = sorted.map((r) => pick(r, "month_label", "month_key") || "-");
    const series = [
      { name: bar1Label, data: sorted.map((r) => Math.round(num(pick(r, "bar1_inflow_value")))) },
      { name: "Cost of Sales", data: sorted.map((r) => Math.round(num(pick(r, "cost_of_sales")))) },
      { name: "Closing Stock Value", data: sorted.map((r) => Math.round(num(pick(r, "closing_stock_value")))) },
    ];

    const totalInflow = sorted.reduce((s, r) => s + num(pick(r, "bar1_inflow_value")), 0);
    const totalCogs = sorted.reduce((s, r) => s + num(pick(r, "cost_of_sales")), 0);
    const latestClosing = sorted.length ? num(pick(sorted[sorted.length - 1], "closing_stock_value")) : 0;
    const netAccum = totalInflow - totalCogs;
    const conversionPct = totalInflow > 0 ? (totalCogs / totalInflow) * 100 : 0;
    const avgMonthlyCogs = sorted.length ? totalCogs / sorted.length : 0;
    const stockCover = avgMonthlyCogs > 0 ? latestClosing / avgMonthlyCogs : 0;

    return {
      rows: sorted,
      bar1Label,
      categories,
      series,
      totalInflow,
      totalCogs,
      latestClosing,
      netAccum,
      conversionPct,
      stockCover,
    };
  }, [stockConversionTrend, isBranchDrill]);

  const branchRows = useMemo(() => {
    return (stockConversionByBranch || [])
      .map((r) => {
        const branchId = pick(r, "branch_id", "branch_code");
        const branchName = cleanBranchName(
          pick(r, "branch_name") || (branchId != null ? `Branch ${branchId}` : "Unknown")
        );
        const inflow = num(pick(r, "bar1_inflow_value", "transfers_in_value", "purchases_received_excl"));
        const cogs = num(pick(r, "cost_of_sales"));
        const closing = num(pick(r, "closing_stock_value"));
        const netAccum =
          pick(r, "net_stock_accumulation_value") !== undefined
            ? num(pick(r, "net_stock_accumulation_value"))
            : inflow - cogs;
        const conversionPct =
          pick(r, "inflow_to_cogs_conversion_perc") !== undefined
            ? num(pick(r, "inflow_to_cogs_conversion_perc"))
            : inflow > 0
            ? (cogs / inflow) * 100
            : 0;
        const coverMonths = num(pick(r, "stock_cover_months"));
        const inflowLabel = pick(r, "bar1_inflow_label") || "Transfers In";
        return {
          branchId,
          branchName,
          inflowLabel,
          inflow,
          purchases: num(pick(r, "purchases_received_excl")),
          transfersIn: num(pick(r, "transfers_in_value")),
          cogs,
          closing,
          netAccum,
          conversionPct,
          coverMonths,
        };
      })
      .sort((a, b) => b.closing - a.closing);
  }, [stockConversionByBranch]);

  const handleDrillIntoBranch = (row) => {
    if (row.branchId == null) return;
    setDrillBranch({ code: row.branchId, name: row.branchName });
    setActiveTab("monthly");
  };

  const handleResetDrill = () => {
    setDrillBranch(null);
    dispatch(
      fetchStockConversionTrend({
        StartDate: appliedFilters.startDate,
        EndDate: appliedFilters.endDate,
        branchcode: appliedFilters.branch ?? null,
        GroupBy: "MONTHLY",
        whichcost: 1,
        IncludeBlocked: true,
      })
    );
  };

  const handleExportExcel = () => {
    if (activeTab === "branch") {
      const rows = branchRows.map((r) => ({
        Branch: r.branchName,
        "Inflow Basis": r.inflowLabel,
        "Inflow Value (KES)": money(r.inflow),
        "Purchases Received Excl. (KES)": money(r.purchases),
        "Transfers In (KES)": money(r.transfersIn),
        "Cost of Sales (KES)": money(r.cogs),
        "Closing Stock Value (KES)": money(r.closing),
        "Net Stock Accumulation (KES)": money(r.netAccum),
        "Conversion %": r.conversionPct.toFixed(2),
        "Stock Cover (Months)": r.coverMonths.toFixed(2),
      }));
      exportToExcel(rows, `Stock_Conversion_By_Branch_${exportStamp()}`);
      return;
    }

    const rows = monthlyData.rows.map((r) => ({
      Month: pick(r, "month_label", "month_key") || "-",
      "As Of Date": pick(r, "closing_stock_as_of_date") || "-",
      [monthlyData.bar1Label]: money(num(pick(r, "bar1_inflow_value"))),
      "Purchases Received Excl. (KES)": money(num(pick(r, "purchases_received_excl"))),
      "Transfers In (KES)": money(num(pick(r, "transfers_in_value"))),
      "Cost of Sales (KES)": money(num(pick(r, "cost_of_sales"))),
      "Closing Stock Value (KES)": money(num(pick(r, "closing_stock_value"))),
      "Net Stock Accumulation (KES)": money(num(pick(r, "net_stock_accumulation_value"))),
      "Inflow to COGS Conversion %": num(pick(r, "inflow_to_cogs_conversion_perc")).toFixed(2),
      "Stock Cover (Months)": num(pick(r, "stock_cover_months")).toFixed(2),
    }));
    exportToExcel(
      rows,
      `${isBranchDrill ? "Transfers" : "Purchases"}_vs_COGS_vs_Stock_${exportStamp()}`
    );
  };

  return (
    <Card className="card-height-100" id="stock-purchases-card">
      <CardHeader className="border-0 align-items-center d-flex justify-content-between flex-wrap gap-2">
        <div>
          <h4 className="card-title mb-0">
            {isBranchDrill ? "Transfers In, Cost of Sales & Stock" : "Purchases, Cost of Sales & Stock"}
          </h4>
          <small className="text-muted">
            Conversion:{" "}
            <strong className={monthlyData.conversionPct >= 95 ? "text-success" : "text-warning"}>
              {monthlyData.conversionPct.toFixed(1)}%
            </strong>
            {" · "}
            {monthlyData.netAccum >= 0 ? "Accumulating " : "Drawing down "}
            <strong className={monthlyData.netAccum > 0 ? "text-danger" : "text-success"}>
              {formatCurrency(Math.abs(monthlyData.netAccum), "KES", 0)}
            </strong>
            {" · "}Cover: <strong>{monthlyData.stockCover.toFixed(1)} mo</strong>
          </small>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {drillBranch && (
            <button
              type="button"
              className="btn btn-soft-info btn-sm py-1 px-2"
              onClick={handleResetDrill}
              title="Return to group view"
            >
              <i className="ri-arrow-left-line me-1" />
              {drillBranch.name}
            </button>
          )}
          <Nav pills className="nav-pills-custom bg-light rounded p-1" style={{ fontSize: "12px" }}>
            <NavItem>
              <NavLink
                href="#"
                className={`py-1 px-2 ${activeTab === "monthly" ? "active" : "text-muted"}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("monthly");
                }}
              >
                Monthly Trend
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={`py-1 px-2 ${activeTab === "branch" ? "active" : "text-muted"}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("branch");
                }}
              >
                By Branch
              </NavLink>
            </NavItem>
          </Nav>
          <CardExportButtons
            onExport={handleExportExcel}
            targetId="stock-purchases-card"
            title="Purchasing and Stock Conversion Trend"
          />
        </div>
      </CardHeader>

      <CardBody className="p-0 pb-2 d-flex flex-column justify-content-between">
        {activeTab === "monthly" ? (
          <div dir="ltr" className="w-100">
            <TrendCardBody
              loading={loadingStockConversionTrend}
              error={errorStockConversionTrend}
              empty={!monthlyData.rows.length}
              height={340}
            >
              <StockPurchasesCharts
                categories={monthlyData.categories}
                series={monthlyData.series}
                dataColors='["--vz-success", "--vz-danger", "--vz-primary"]'
              />
            </TrendCardBody>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: "340px", overflowY: "auto" }} onMouseLeave={clearTooltip}>
            <table
              className="table table-sm table-hover table-nowrap align-middle mb-0"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <colgroup>
                <col style={{ width: "24%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead className="table-light text-muted sticky-top" style={{ zIndex: 1 }}>
                <tr>
                  <th className="ps-3 text-truncate" {...getCellTooltipHandlers("Column", "Branch (click to drill)")}>
                    Branch (click to drill)
                  </th>
                  <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Transfers / Inflow")}>
                    Transfers / Inflow
                  </th>
                  <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Cost of Sales")}>
                    Cost of Sales
                  </th>
                  <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Closing Stock")}>
                    Closing Stock
                  </th>
                  <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Conv. %")}>
                    Conv. %
                  </th>
                  <th className="text-end pe-3 text-truncate" {...getCellTooltipHandlers("Column", "Cover (mo)")}>
                    Cover (mo)
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingStockConversionByBranch ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Spinner size="sm" color="primary" className="me-2" />
                      <span className="text-muted">Loading branch conversion data...</span>
                    </td>
                  </tr>
                ) : errorStockConversionByBranch ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-danger">
                      {errorStockConversionByBranch}
                    </td>
                  </tr>
                ) : !branchRows.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No branch stock conversion records available.
                    </td>
                  </tr>
                ) : (
                  branchRows.map((row) => {
                    const inflowText = formatCompact(row.inflow);
                    const cogsText = formatCompact(row.cogs);
                    const closingText = formatCompact(row.closing);
                    const convText = `${row.conversionPct.toFixed(1)}%`;
                    const coverText = row.coverMonths.toFixed(1);
                    return (
                      <tr
                        key={row.branchId ?? row.branchName}
                        role="button"
                        onClick={() => handleDrillIntoBranch(row)}
                        title="Click to view monthly Transfers In vs COGS vs Closing Stock for this branch"
                      >
                        <td
                          className="ps-3 fw-medium text-primary text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Branch", row.branchName)}
                        >
                          {row.branchName}
                        </td>
                        <td
                          className="text-end text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Transfers / Inflow", inflowText)}
                        >
                          {inflowText}
                        </td>
                        <td
                          className="text-end text-danger text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Cost of Sales", cogsText)}
                        >
                          {cogsText}
                        </td>
                        <td
                          className="text-end fw-semibold text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Closing Stock", closingText)}
                        >
                          {closingText}
                        </td>
                        <td
                          className="text-end text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Conv. %", convText)}
                        >
                          <span
                            className={`badge bg-${
                              row.conversionPct >= 95 ? "success" : row.conversionPct >= 75 ? "warning" : "danger"
                            }-subtle text-${
                              row.conversionPct >= 95 ? "success" : row.conversionPct >= 75 ? "warning" : "danger"
                            }`}
                          >
                            {convText}
                          </span>
                        </td>
                        <td
                          className="text-end pe-3 text-muted text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Cover (mo)", coverText)}
                        >
                          {coverText}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-top px-3 pt-2 mt-2">
          <small className="text-muted">
            {isBranchDrill
              ? `Branch view (${activeBranchLabel}): Bar 1 shows inter-branch Transfers Received (In) against Cost of Sales and Closing Stock Value.`
              : "Group view: Bar 1 shows net Supplier Purchases Received. Switch to 'By Branch' and click any branch to view Transfers Received (In)."}
          </small>
        </div>

        <FloatingTooltip hoverInfo={hoverInfo} />
      </CardBody>
    </Card>
  );
};

export default StockPurchases;
