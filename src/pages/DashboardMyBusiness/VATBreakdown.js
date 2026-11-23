import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, Spinner } from "reactstrap";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import TrendCardBody, { exportStamp, money } from "./TrendCardBody";
import { exportToExcel } from "../../helpers/export_helper";
import { cleanBranchName } from "../../helpers/branch_helper";
import { getOutputVATAnalysis } from "../../helpers/fakebackend_helper";
import { formatAmount, formatCompact, formatCurrency } from "../utils/formatHelper";
import { toList, pick, num } from "../utils/apiRow";

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleDateString("en-GB");
};

const VATBreakdown = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [drilldownRows, setDrilldownRows] = useState([]);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);
  const [errorDrilldown, setErrorDrilldown] = useState(null);

  const {
    vatBreakdown = { summary: [], monthly: [], byTaxCode: [], byBranch: [] },
    loadingVATBreakdown,
    errorVATBreakdown,
    appliedFilters = {},
  } = useSelector((state) => state.DashboardMyBusiness || state.MyBusiness || {});

  // Load document-level drill-down on demand when the user selects the Documents tab
  useEffect(() => {
    if (activeTab !== "drilldown") return;
    let mounted = true;
    const loadDrilldown = async () => {
      setLoadingDrilldown(true);
      setErrorDrilldown(null);
      try {
        const params = {
          clientid: 1,
          StartDate: appliedFilters.startDate,
          EndDate: appliedFilters.endDate,
          GroupBy: "DRILLDOWN",
          TopN: 100,
        };
        if (appliedFilters.branch) params.branchcode = appliedFilters.branch;
        const rows = toList(await getOutputVATAnalysis(params));
        if (mounted) setDrilldownRows(rows);
      } catch (err) {
        if (mounted) setErrorDrilldown(err?.message || "Failed to load VAT documents");
      } finally {
        if (mounted) setLoadingDrilldown(false);
      }
    };
    loadDrilldown();
    return () => {
      mounted = false;
    };
  }, [activeTab, appliedFilters.startDate, appliedFilters.endDate, appliedFilters.branch]);

  const summary = useMemo(() => {
    const row = Array.isArray(vatBreakdown?.summary) ? vatBreakdown.summary[0] : null;
    if (!row) {
      return {
        vatLabel: "Sales / Output VAT",
        disclaimer:
          "Sales / Output VAT only — represents VAT charged on sales and is not by itself the final VAT payable (input VAT on purchases is not deducted).",
        salesIncl: 0,
        outputVat: 0,
        salesExcl: 0,
        vatableExcl: 0,
        zeroExemptExcl: 0,
        effectiveRate: 0,
      };
    }
    const salesExcl = num(pick(row, "net_sales_excl_vat"));
    const outputVat = num(pick(row, "net_output_vat"));
    const salesIncl = num(pick(row, "net_sales_incl_vat")) || salesExcl + outputVat;
    return {
      vatLabel: pick(row, "vat_label") || "Sales / Output VAT",
      disclaimer:
        pick(row, "vat_scope_disclaimer") ||
        "Sales / Output VAT only — not final VAT payable (input VAT on purchases is not deducted).",
      salesIncl,
      outputVat,
      salesExcl,
      vatableExcl: num(pick(row, "vatable_sales_excl_vat")),
      zeroExemptExcl: num(pick(row, "zero_rated_exempt_sales_excl_vat")),
      effectiveRate:
        pick(row, "effective_output_vat_rate_perc") !== undefined
          ? num(pick(row, "effective_output_vat_rate_perc"))
          : salesExcl > 0
          ? (outputVat / salesExcl) * 100
          : 0,
    };
  }, [vatBreakdown]);

  const monthlySeries = useMemo(() => {
    const rows = Array.isArray(vatBreakdown?.monthly) ? vatBreakdown.monthly : [];
    return {
      rows,
      categories: rows.map((r) => pick(r, "month_label", "month_key") || "-"),
      series: [
        {
          name: "Net Sales (Excl. VAT)",
          data: rows.map((r) => Math.round(num(pick(r, "net_sales_excl_vat")))),
        },
        {
          name: "Sales / Output VAT",
          data: rows.map((r) => Math.round(num(pick(r, "net_output_vat")))),
        },
      ],
    };
  }, [vatBreakdown]);

  const chartColors = getChartColorsArray('["--vz-primary", "--vz-warning"]');
  const chartOptions = useMemo(
    () => ({
      chart: { type: "bar", stacked: true, height: 260, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: "42%", borderRadius: 4 } },
      dataLabels: { enabled: false },
      colors: chartColors,
      xaxis: {
        categories: monthlySeries.categories,
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: { style: { fontSize: "11px", colors: "#878a99" } },
      },
      yaxis: {
        labels: {
          formatter: (val) => {
            if (val == null || isNaN(val)) return "KES 0";
            if (Math.abs(val) >= 1_000_000) return `KES ${(val / 1_000_000).toFixed(1)}M`;
            if (Math.abs(val) >= 1_000) return `KES ${(val / 1_000).toFixed(0)}K`;
            return `KES ${formatAmount(val, 0)}`;
          },
          style: { colors: ["#878a99"] },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (val) => `KES ${formatAmount(val || 0, 2)}` },
      },
      legend: { position: "top", horizontalAlign: "right" },
      grid: { borderColor: "#f1f1f1" },
    }),
    [chartColors, monthlySeries.categories]
  );

  const handleExportExcel = () => {
    if (activeTab === "tax") {
      const rows = (vatBreakdown?.byTaxCode || []).map((r) => ({
        "Tax Code": pick(r, "tax_code") || "-",
        Description: pick(r, "tax_description") || "-",
        "Statutory Rate %": num(pick(r, "statutory_rate_perc")).toFixed(2),
        "Sales Incl. VAT (KES)": money(num(pick(r, "net_sales_incl_vat"))),
        "Sales / Output VAT (KES)": money(num(pick(r, "net_output_vat"))),
        "Net Sales Excl. VAT (KES)": money(num(pick(r, "net_sales_excl_vat"))),
        "Effective Rate %": num(pick(r, "effective_output_vat_rate_perc")).toFixed(2),
      }));
      exportToExcel(rows, `Output_VAT_By_TaxCode_${exportStamp()}`);
      return;
    }
    if (activeTab === "branch") {
      const rows = (vatBreakdown?.byBranch || []).map((r) => ({
        Branch: cleanBranchName(pick(r, "branch_name") || String(pick(r, "branch_code") || "-")),
        "Sales Incl. VAT (KES)": money(num(pick(r, "net_sales_incl_vat"))),
        "Sales / Output VAT (KES)": money(num(pick(r, "net_output_vat"))),
        "Net Sales Excl. VAT (KES)": money(num(pick(r, "net_sales_excl_vat"))),
        "Effective Rate %": num(pick(r, "effective_output_vat_rate_perc")).toFixed(2),
      }));
      exportToExcel(rows, `Output_VAT_By_Branch_${exportStamp()}`);
      return;
    }
    if (activeTab === "drilldown") {
      const rows = drilldownRows.map((r) => ({
        Document: pick(r, "document_number") || "-",
        Date: formatDate(pick(r, "sale_date")),
        Type: pick(r, "transaction_type") || "-",
        Branch: cleanBranchName(pick(r, "branch_name") || "-"),
        "Sales Incl. VAT (KES)": money(num(pick(r, "net_sales_incl_vat"))),
        "Sales / Output VAT (KES)": money(num(pick(r, "net_output_vat"))),
        "Net Sales Excl. VAT (KES)": money(num(pick(r, "net_sales_excl_vat"))),
      }));
      exportToExcel(rows, `Output_VAT_Documents_${exportStamp()}`);
      return;
    }

    const rows = monthlySeries.rows.map((r) => ({
      Month: pick(r, "month_label", "month_key") || "-",
      "Sales Incl. VAT (KES)": money(num(pick(r, "net_sales_incl_vat"))),
      "Sales / Output VAT (KES)": money(num(pick(r, "net_output_vat"))),
      "Net Sales Excl. VAT (KES)": money(num(pick(r, "net_sales_excl_vat"))),
      "VATable Sales Excl. (KES)": money(num(pick(r, "vatable_sales_excl_vat"))),
      "Zero/Exempt Sales Excl. (KES)": money(num(pick(r, "zero_rated_exempt_sales_excl_vat"))),
      "Effective VAT %": num(pick(r, "effective_output_vat_rate_perc")).toFixed(2),
    }));
    exportToExcel(rows, `Sales_Output_VAT_Monthly_${exportStamp()}`);
  };

  return (
    <Card className="card-height-100" id="vat-breakdown-card">
      <CardHeader className="border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="card-title mb-0">
            VAT Breakdown <span className="badge bg-warning-subtle text-warning ms-1 fs-11">{summary.vatLabel}</span>
          </h4>
          <small className="text-muted">
            Effective output VAT rate: <strong>{summary.effectiveRate.toFixed(2)}%</strong> · {appliedFilters.startDate}{" "}
            - {appliedFilters.endDate}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Nav pills className="nav-pills-custom bg-light rounded p-1" style={{ fontSize: "12px" }}>
            {[
              { id: "monthly", label: "Monthly" },
              { id: "tax", label: "Tax Code" },
              { id: "branch", label: "Branch" },
              { id: "drilldown", label: "Docs" },
            ].map((t) => (
              <NavItem key={t.id}>
                <NavLink
                  href="#"
                  className={`py-1 px-2 ${activeTab === t.id ? "active" : "text-muted"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(t.id);
                  }}
                >
                  {t.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          <CardExportButtons onExport={handleExportExcel} targetId="vat-breakdown-card" title="Sales Output VAT Breakdown" />
        </div>
      </CardHeader>

      <CardBody className="pt-0 d-flex flex-column justify-content-between">
        <div>
          {/* 3-Metric Summary Strip */}
          <div className="row g-2 mb-3">
            <div className="col-sm-4">
              <div className="p-2 rounded bg-light border">
                <div className="text-muted fs-11">Sales (Incl. VAT)</div>
                <div className="fw-semibold fs-15 text-primary">{formatCurrency(summary.salesIncl, "KES", 0)}</div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="p-2 rounded bg-warning-subtle border border-warning-subtle">
                <div className="text-warning fs-11 fw-medium">{summary.vatLabel}</div>
                <div className="fw-semibold fs-15 text-warning">{formatCurrency(summary.outputVat, "KES", 0)}</div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="p-2 rounded bg-light border">
                <div className="text-muted fs-11">Net Sales (Excl. VAT)</div>
                <div className="fw-semibold fs-15 text-success">{formatCurrency(summary.salesExcl, "KES", 0)}</div>
              </div>
            </div>
          </div>

          {activeTab === "monthly" && (
            <TrendCardBody
              loading={loadingVATBreakdown}
              error={errorVATBreakdown}
              empty={!monthlySeries.rows.length}
              height={260}
            >
              <ReactApexChart
                dir="ltr"
                options={chartOptions}
                series={monthlySeries.series}
                type="bar"
                height={260}
                className="apex-charts"
              />
            </TrendCardBody>
          )}

          {activeTab === "tax" && (
            <div className="table-responsive" style={{ maxHeight: "260px", overflowY: "auto" }}>
              <table className="table table-sm table-nowrap align-middle mb-0">
                <thead className="table-light text-muted sticky-top">
                  <tr>
                    <th>Tax Code</th>
                    <th className="text-end">Rate %</th>
                    <th className="text-end">Sales Incl.</th>
                    <th className="text-end">Output VAT</th>
                    <th className="text-end">Net Excl.</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingVATBreakdown ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <Spinner size="sm" color="primary" />
                      </td>
                    </tr>
                  ) : !(vatBreakdown?.byTaxCode || []).length ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No tax code breakdown available.
                      </td>
                    </tr>
                  ) : (
                    vatBreakdown.byTaxCode.map((r, idx) => (
                      <tr key={pick(r, "tax_code") || idx}>
                        <td>
                          <span className="fw-medium">{pick(r, "tax_description") || pick(r, "tax_code") || "-"}</span>
                          <small className="text-muted ms-1">({pick(r, "tax_code") || "-"})</small>
                        </td>
                        <td className="text-end">{num(pick(r, "statutory_rate_perc")).toFixed(1)}%</td>
                        <td className="text-end">{formatCompact(num(pick(r, "net_sales_incl_vat")))}</td>
                        <td className="text-end text-warning fw-medium">
                          {formatCompact(num(pick(r, "net_output_vat")))}
                        </td>
                        <td className="text-end">{formatCompact(num(pick(r, "net_sales_excl_vat")))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "branch" && (
            <div className="table-responsive" style={{ maxHeight: "260px", overflowY: "auto" }}>
              <table className="table table-sm table-nowrap align-middle mb-0">
                <thead className="table-light text-muted sticky-top">
                  <tr>
                    <th>Branch</th>
                    <th className="text-end">Sales Incl.</th>
                    <th className="text-end">Output VAT</th>
                    <th className="text-end">Net Excl.</th>
                    <th className="text-end">Eff. %</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingVATBreakdown ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <Spinner size="sm" color="primary" />
                      </td>
                    </tr>
                  ) : !(vatBreakdown?.byBranch || []).length ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No branch VAT breakdown available.
                      </td>
                    </tr>
                  ) : (
                    vatBreakdown.byBranch.map((r, idx) => (
                      <tr key={pick(r, "branch_id", "branch_code") || idx}>
                        <td className="fw-medium">
                          {cleanBranchName(pick(r, "branch_name") || String(pick(r, "branch_code") || "-"))}
                        </td>
                        <td className="text-end">{formatCompact(num(pick(r, "net_sales_incl_vat")))}</td>
                        <td className="text-end text-warning fw-medium">
                          {formatCompact(num(pick(r, "net_output_vat")))}
                        </td>
                        <td className="text-end">{formatCompact(num(pick(r, "net_sales_excl_vat")))}</td>
                        <td className="text-end">{num(pick(r, "effective_output_vat_rate_perc")).toFixed(1)}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "drilldown" && (
            <div className="table-responsive" style={{ maxHeight: "260px", overflowY: "auto" }}>
              <table className="table table-sm table-nowrap align-middle mb-0">
                <thead className="table-light text-muted sticky-top">
                  <tr>
                    <th>Document</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th className="text-end">Sales Incl.</th>
                    <th className="text-end">Output VAT</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDrilldown ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <Spinner size="sm" color="primary" className="me-2" />
                        <span className="text-muted">Loading documents...</span>
                      </td>
                    </tr>
                  ) : errorDrilldown ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-danger">
                        {errorDrilldown}
                      </td>
                    </tr>
                  ) : !drilldownRows.length ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No VAT documents found.
                      </td>
                    </tr>
                  ) : (
                    drilldownRows.map((r, idx) => (
                      <tr key={`${pick(r, "document_number")}-${idx}`}>
                        <td className="fw-medium">{pick(r, "document_number") || "-"}</td>
                        <td className="text-muted fs-12">{formatDate(pick(r, "sale_date"))}</td>
                        <td className="fs-12">{pick(r, "transaction_type") || "-"}</td>
                        <td className="text-end">{formatCompact(num(pick(r, "net_sales_incl_vat")))}</td>
                        <td className="text-end text-warning fw-medium">
                          {formatCompact(num(pick(r, "net_output_vat")))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mandatory Sales/Output VAT Disclaimer */}
        <div className="alert alert-warning py-2 px-3 mb-0 mt-3 fs-12 d-flex align-items-start gap-2" role="alert">
          <i className="ri-information-line fs-15 flex-shrink-0 mt-1" />
          <div>
            <strong>{summary.vatLabel} only:</strong> {summary.disclaimer}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default VATBreakdown;
