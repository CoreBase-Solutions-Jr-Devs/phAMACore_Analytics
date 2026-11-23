import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, Spinner } from "reactstrap";
import { RevenueExpensesChart } from "./DashboardMyBusinessCharts";
import { formatCompact, formatCurrency } from "../utils/formatHelper";
import { exportToExcel } from "../../helpers/export_helper";
import { cleanBranchName, saveActiveBranch } from "../../helpers/branch_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import TrendCardBody, { exportStamp, money } from "./TrendCardBody";
import { pick, num } from "../utils/apiRow";

const RevenueExpenses = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("branch");

  const {
    monthlyTrend = [],
    loadingMonthlyTrend,
    errorMonthlyTrend,
    branchProfitability = [],
    loadingBranchProfitability,
    errorBranchProfitability,
    appliedFilters = {},
  } = useSelector((state) => state.DashboardMyBusiness || state.MyBusiness || {});

  const trend = useMemo(() => {
    const round = (value) => Number((value || 0).toFixed(2));
    const total = (field) => monthlyTrend.reduce((sum, m) => sum + (m[field] || 0), 0);
    const salesIncl = total("salesIncl");
    const revenue = total("revenue");
    const cost = total("cost");
    const grossProfit = total("grossProfit");

    return {
      categories: monthlyTrend.map((m) => m.label),
      series: [
        { name: "Sales (incl. VAT)", data: monthlyTrend.map((m) => round(m.salesIncl || m.revenue)) },
        { name: "Cost of Sales", data: monthlyTrend.map((m) => round(m.cost)) },
        { name: "Gross Profit", data: monthlyTrend.map((m) => round(m.grossProfit)) },
      ],
      salesIncl,
      revenue,
      cost,
      grossProfit,
      margin: revenue ? (grossProfit / revenue) * 100 : 0,
    };
  }, [monthlyTrend]);

  const branchRows = useMemo(() => {
    const rows = (branchProfitability || [])
      .map((r) => {
        const branchCode = pick(r, "BranchCode", "branch_id", "bcode");
        const rawName = pick(r, "BranchName", "branch_name") || (branchCode != null ? `Branch ${branchCode}` : "Unknown");
        const salesExcl = num(pick(r, "SalesValueExcl"));
        const taxAmount = num(pick(r, "TaxAmount"));
        const salesIncl = num(pick(r, "SalesValueIncl")) || salesExcl + taxAmount;
        const cost = num(pick(r, "CostValue"));
        const grossProfit = num(pick(r, "GrossProfit")) || salesExcl - cost;
        const marginPct =
          pick(r, "GrossMarginPct") !== undefined
            ? num(pick(r, "GrossMarginPct"))
            : salesExcl > 0
            ? (grossProfit / salesExcl) * 100
            : 0;

        return {
          branchCode,
          branchName: cleanBranchName(rawName),
          salesIncl,
          salesExcl,
          taxAmount,
          cost,
          grossProfit,
          marginPct,
          transactions: num(pick(r, "TransactionCount")),
        };
      })
      .sort((a, b) => b.salesIncl - a.salesIncl);

    const groupTotals = rows.reduce(
      (acc, r) => ({
        salesIncl: acc.salesIncl + r.salesIncl,
        salesExcl: acc.salesExcl + r.salesExcl,
        taxAmount: acc.taxAmount + r.taxAmount,
        cost: acc.cost + r.cost,
        grossProfit: acc.grossProfit + r.grossProfit,
      }),
      { salesIncl: 0, salesExcl: 0, taxAmount: 0, cost: 0, grossProfit: 0 }
    );
    groupTotals.marginPct =
      groupTotals.salesExcl > 0 ? (groupTotals.grossProfit / groupTotals.salesExcl) * 100 : 0;

    return { rows, groupTotals };
  }, [branchProfitability]);

  const summarySalesIncl = branchRows.rows.length ? branchRows.groupTotals.salesIncl : trend.salesIncl;
  const summaryGrossProfit = branchRows.rows.length ? branchRows.groupTotals.grossProfit : trend.grossProfit;
  const summaryMargin = branchRows.rows.length ? branchRows.groupTotals.marginPct : trend.margin;

  const handleBranchClick = (branchCode) => {
    if (branchCode == null) return;
    saveActiveBranch("mybusiness", branchCode);
    navigate(`/dashboard/branch/${branchCode}`);
  };

  const handleExportExcel = () => {
    if (activeTab === "branch") {
      const rows = branchRows.rows.map((r) => ({
        Branch: r.branchName,
        "Sales Incl. VAT (KES)": money(r.salesIncl),
        "Net Sales Excl. VAT (KES)": money(r.salesExcl),
        "Output VAT (KES)": money(r.taxAmount),
        "Cost of Sales (KES)": money(r.cost),
        "Gross Profit (KES)": money(r.grossProfit),
        "Gross Margin %": r.marginPct.toFixed(2),
        "Operating Expenses (KES)": "Pending input",
        "Operating Profit / Loss (KES)": "Pending expenses",
      }));
      rows.push({
        Branch: "GROUP TOTAL",
        "Sales Incl. VAT (KES)": money(branchRows.groupTotals.salesIncl),
        "Net Sales Excl. VAT (KES)": money(branchRows.groupTotals.salesExcl),
        "Output VAT (KES)": money(branchRows.groupTotals.taxAmount),
        "Cost of Sales (KES)": money(branchRows.groupTotals.cost),
        "Gross Profit (KES)": money(branchRows.groupTotals.grossProfit),
        "Gross Margin %": branchRows.groupTotals.marginPct.toFixed(2),
        "Operating Expenses (KES)": "Pending input",
        "Operating Profit / Loss (KES)": "Pending expenses",
      });
      exportToExcel(rows, `Group_Branch_Profitability_${exportStamp()}`);
      return;
    }

    const rows = monthlyTrend.map((m) => ({
      Month: m.label,
      From: m.startDate,
      To: m.endDate,
      "Sales Incl. VAT (KES)": money(m.salesIncl || m.revenue),
      "Net Sales Excl. VAT (KES)": money(m.revenue),
      "Cost of Sales (KES)": money(m.cost),
      "Gross Profit (KES)": money(m.grossProfit),
      "Gross Margin %": m.revenue ? ((m.grossProfit / m.revenue) * 100).toFixed(2) : "0.00",
    }));
    exportToExcel(rows, `Monthly_Profitability_Trend_${exportStamp()}`);
  };

  return (
    <Card className="card-height-100" id="revenue-expenses-card">
      <CardHeader className="border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="card-title mb-0">Group &amp; Branch Profitability</h4>
          <small className="text-muted">
            Sales (incl. VAT):{" "}
            <strong className="text-primary me-2">{formatCurrency(summarySalesIncl, "KES", 0)}</strong>
            GP:{" "}
            <strong className="text-success">
              {formatCurrency(summaryGrossProfit, "KES", 0)} ({summaryMargin.toFixed(1)}%)
            </strong>
          </small>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Nav pills className="nav-pills-custom bg-light rounded p-1" style={{ fontSize: "12px" }}>
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
          </Nav>
          <CardExportButtons
            onExport={handleExportExcel}
            targetId="revenue-expenses-card"
            title="Group and Branch Profitability"
          />
        </div>
      </CardHeader>

      <CardBody className="p-0 pb-2 d-flex flex-column justify-content-between">
        {activeTab === "monthly" ? (
          <TrendCardBody loading={loadingMonthlyTrend} error={errorMonthlyTrend} empty={!monthlyTrend.length}>
            <RevenueExpensesChart
              series={trend.series}
              categories={trend.categories}
              dataColors='["--vz-primary","--vz-danger","--vz-success"]'
            />
          </TrendCardBody>
        ) : (
          <div className="table-responsive" style={{ maxHeight: "340px", overflowY: "auto" }}>
            <table className="table table-sm table-hover table-nowrap align-middle mb-0">
              <thead className="table-light text-muted sticky-top" style={{ zIndex: 1 }}>
                <tr>
                  <th className="ps-3">Branch</th>
                  <th className="text-end">Sales (incl. VAT)</th>
                  <th className="text-end">GP (KES)</th>
                  <th className="text-end">GP %</th>
                  <th className="text-end">Op. Expenses</th>
                  <th className="text-end pe-3">Op. Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {loadingBranchProfitability ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Spinner size="sm" color="primary" className="me-2" />
                      <span className="text-muted">Loading branch profitability...</span>
                    </td>
                  </tr>
                ) : errorBranchProfitability ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-danger">
                      {errorBranchProfitability}
                    </td>
                  </tr>
                ) : !branchRows.rows.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No branch profitability records for {appliedFilters.startDate} - {appliedFilters.endDate}.
                    </td>
                  </tr>
                ) : (
                  <>
                    {branchRows.rows.map((row) => (
                      <tr
                        key={row.branchCode ?? row.branchName}
                        role="button"
                        onClick={() => handleBranchClick(row.branchCode)}
                        title="Click to filter dashboard by this branch"
                      >
                        <td className="ps-3 fw-medium text-primary">{row.branchName}</td>
                        <td className="text-end fw-semibold">{formatCompact(row.salesIncl)}</td>
                        <td className="text-end text-success fw-medium">{formatCompact(row.grossProfit)}</td>
                        <td className="text-end">
                          <span
                            className={`badge bg-${
                              row.marginPct >= 30 ? "success" : row.marginPct >= 20 ? "warning" : "danger"
                            }-subtle text-${
                              row.marginPct >= 30 ? "success" : row.marginPct >= 20 ? "warning" : "danger"
                            }`}
                          >
                            {row.marginPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-end text-muted fs-12">—</td>
                        <td className="text-end pe-3 text-muted fs-12">—</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              {branchRows.rows.length > 0 && (
                <tfoot className="table-light fw-semibold">
                  <tr>
                    <td className="ps-3">Group Total</td>
                    <td className="text-end">{formatCompact(branchRows.groupTotals.salesIncl)}</td>
                    <td className="text-end text-success">{formatCompact(branchRows.groupTotals.grossProfit)}</td>
                    <td className="text-end">{branchRows.groupTotals.marginPct.toFixed(1)}%</td>
                    <td className="text-end text-muted fs-12">Pending</td>
                    <td className="text-end pe-3 text-muted fs-12">Pending</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        <div className="border-top px-3 pt-2 mt-2">
          <small className="text-muted">
            Actual figures only (no assumed expense or profit percentages). Operating expenses and operating
            profit/loss will populate once <strong>Expense &amp; Target Inputs</strong> is finalized.
          </small>
        </div>
      </CardBody>
    </Card>
  );
};

export default RevenueExpenses;
