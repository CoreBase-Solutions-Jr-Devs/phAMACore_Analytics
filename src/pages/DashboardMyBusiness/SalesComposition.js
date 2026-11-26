import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, Spinner } from "reactstrap";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import FloatingTooltip from "../../Components/Common/FloatingTooltip";
import useTableCellTooltip from "./useTableCellTooltip";
import { exportToExcel } from "../../helpers/export_helper";
import { exportStamp, money } from "./TrendCardBody";
import { formatCompact, formatCurrency } from "../utils/formatHelper";
import { pick, num, metric } from "../utils/apiRow";

const AGING_BUCKETS = [
  { key: "current_0_30", label: "Current (0–30d)", color: "success" },
  { key: "days_31_60", label: "31–60 Days", color: "info" },
  { key: "days_61_90", label: "61–90 Days", color: "warning" },
  { key: "days_91_120", label: "91–120 Days", color: "danger" },
  { key: "over_120", label: ">120 Days", color: "dark" },
];

const INSURER_KEYWORDS = [
  "INSURANCE", "ASSURANCE", "JUBILEE", "AAR", "BRITAM",
  "CIC", "MADISON", "APA", "GA ", "UAP",
  "OLD MUTUAL", "MINET", "SHA", "NHIF", "RESOLUTION",
  "FIRST ASSURANCE", "HERITAGE", "LION", "SANLAM", "PACIS",
  "MUA", "MTIBA", "BLISS", "LIAISON", "KCB INSURANCE", "EQUITY INSURANCE",
];

const isInsurerAccount = (name = "") => {
  const upper = String(name).toUpperCase();
  return INSURER_KEYWORDS.some((kw) => upper.includes(kw));
};

const SalesComposition = () => {
  const [activeTab, setActiveTab] = useState("composition");
  const [selectedBucket, setSelectedBucket] = useState(null);
  const { hoverInfo, getCellTooltipHandlers, clearTooltip } = useTableCellTooltip();

  const {
    salesByType = [],
    loadingSalesByType,
    errorSalesByType,
    cashbookSummary = [],
    cashbookSummaryMetrics = [],
    loadingCashbookSummary,
    customerAging = [],
    loadingCustomerAging,
    errorCustomerAging,
    appliedFilters = {},
  } = useSelector((state) => state.DashboardMyBusiness || state.MyBusiness || {});

  const composition = useMemo(() => {
    const byType = new Map();
    (salesByType || []).forEach((r) => {
      const t = String(pick(r, "transaction_type") || "").toUpperCase();
      if (t) byType.set(t, r);
    });

    const getVals = (type) => {
      const r = byType.get(type);
      return {
        incl: num(pick(r, "total_sales_incl")),
        excl: num(pick(r, "total_sales_excl")),
        count: num(pick(r, "transaction_count")),
      };
    };

    const cashSale = getVals("CASHSALE");
    const cashInv = getVals("CASHINVOICE");
    const salesInv = getVals("SALESINVOICE");
    const creditNote = getVals("CREDITNOTE");
    const totalRow = getVals("TOTAL");

    const cashTotal = {
      incl: cashSale.incl + cashInv.incl,
      excl: cashSale.excl + cashInv.excl,
      count: cashSale.count + cashInv.count,
    };

    // Estimate Insurance vs Other Account share from active customer accounts in PowerBIAccountBalance
    // while keeping the exact SALESINVOICE total transparent.
    const accountTotal = {
      incl: salesInv.incl,
      excl: salesInv.excl,
      count: salesInv.count,
    };

    const grossSalesIncl = cashTotal.incl + accountTotal.incl;
    const netTotalIncl = totalRow.incl || grossSalesIncl + creditNote.incl;
    const denom = grossSalesIncl > 0 ? grossSalesIncl : 1;

    return {
      cash: { ...cashTotal, pct: (cashTotal.incl / denom) * 100 },
      account: { ...accountTotal, pct: (accountTotal.incl / denom) * 100 },
      creditNotes: { ...creditNote },
      netTotalIncl,
      grossSalesIncl,
    };
  }, [salesByType]);

  const collections = useMemo(() => {
    const rows =
      Array.isArray(cashbookSummary) && cashbookSummary.length > 0
        ? cashbookSummary
        : cashbookSummaryMetrics || [];

    const total = metric(rows, "Total Collections") || metric(rows, "Total Cash Collections");
    const unallocated = metric(rows, "Unallocated Collections Amount") || metric(rows, "Unallocated");
    const allocated = total - unallocated;

    return {
      total,
      cash: metric(rows, "Total Cash Collections") || metric(rows, "Cash"),
      mpesa: metric(rows, "Total M-Pesa / Mobile Collections") || metric(rows, "Mpesa"),
      card: metric(rows, "Total Card / PDQ Collections") || metric(rows, "Card"),
      cheque: metric(rows, "Total Cheque Collections") || metric(rows, "Cheque"),
      bank: metric(rows, "Total Bank Wire / Transfer") || metric(rows, "Bank Transfer"),
      allocated,
      unallocated,
    };
  }, [cashbookSummary, cashbookSummaryMetrics]);

  const agingSummary = useMemo(() => {
    const accounts = (customerAging || []).map((r) => ({
      code: String(pick(r, "cuscode") || ""),
      name: pick(r, "cusname") || pick(r, "cuscode") || "Unknown",
      isInsurer: isInsurerAccount(pick(r, "cusname")),
      current_0_30: num(pick(r, "current_0_30")),
      days_31_60: num(pick(r, "days_31_60")),
      days_61_90: num(pick(r, "days_61_90")),
      days_91_120: num(pick(r, "days_91_120")),
      over_120: num(pick(r, "over_120")),
      total: num(pick(r, "total_balance")),
    }));

    const grandTotal = accounts.reduce((s, a) => s + a.total, 0);
    const insurerTotal = accounts.filter((a) => a.isInsurer).reduce((s, a) => s + a.total, 0);
    const otherAcctTotal = grandTotal - insurerTotal;

    const buckets = AGING_BUCKETS.map((b) => {
      const amount = accounts.reduce((s, a) => s + a[b.key], 0);
      const count = accounts.filter((a) => a[b.key] > 0).length;
      return {
        ...b,
        amount,
        count,
        pct: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
      };
    });

    const drilledDebtors = selectedBucket
      ? accounts
          .filter((a) => a[selectedBucket] > 0)
          .sort((a, b) => b[selectedBucket] - a[selectedBucket])
      : [];

    return { accounts, buckets, grandTotal, insurerTotal, otherAcctTotal, drilledDebtors };
  }, [customerAging, selectedBucket]);

  const handleExportExcel = () => {
    if (activeTab === "aging") {
      if (selectedBucket) {
        const bucketMeta = AGING_BUCKETS.find((b) => b.key === selectedBucket);
        const rows = agingSummary.drilledDebtors.map((d) => ({
          "Account Code": d.code,
          "Customer / Insurer": d.name,
          Segment: d.isInsurer ? "Insurance" : "Other Account",
          [bucketMeta?.label || selectedBucket]: money(d[selectedBucket]),
          "Total Balance (KES)": money(d.total),
        }));
        exportToExcel(rows, `Sales_Aging_Drilldown_${selectedBucket}_${exportStamp()}`);
        return;
      }
      const rows = agingSummary.buckets.map((b) => ({
        "Ageing Bucket": b.label,
        "Outstanding (KES)": money(b.amount),
        "Share %": b.pct.toFixed(2),
        "Debtor Count": b.count,
      }));
      exportToExcel(rows, `Receivables_Aging_Buckets_${exportStamp()}`);
      return;
    }

    const rows = [
      {
        Category: "Cash Sales (Counter + Cash Invoices)",
        "Sales Incl. VAT (KES)": money(composition.cash.incl),
        "Net Sales Excl. VAT (KES)": money(composition.cash.excl),
        Transactions: composition.cash.count,
        "Share %": composition.cash.pct.toFixed(2),
      },
      {
        Category: "Account Sales (Insurance & Other Accounts)",
        "Sales Incl. VAT (KES)": money(composition.account.incl),
        "Net Sales Excl. VAT (KES)": money(composition.account.excl),
        Transactions: composition.account.count,
        "Share %": composition.account.pct.toFixed(2),
      },
      {
        Category: "Credit Notes / Returns",
        "Sales Incl. VAT (KES)": money(composition.creditNotes.incl),
        "Net Sales Excl. VAT (KES)": money(composition.creditNotes.excl),
        Transactions: composition.creditNotes.count,
        "Share %": "-",
      },
      {
        Category: "Debt & Customer Collections (Separate — Not New Sales)",
        "Sales Incl. VAT (KES)": money(collections.total),
        "Net Sales Excl. VAT (KES)": "-",
        Transactions: "-",
        "Share %": "-",
      },
    ];
    exportToExcel(rows, `Sales_Composition_Collections_${exportStamp()}`);
  };

  return (
    <Card className="card-height-100" id="sales-composition-card">
      <CardHeader className="border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="card-title mb-0">Sales Composition &amp; Aging</h4>
          <small className="text-muted">
            Net sales (incl. VAT):{" "}
            <strong className="text-primary">{formatCurrency(composition.netTotalIncl, "KES", 0)}</strong> ·{" "}
            {appliedFilters.startDate} - {appliedFilters.endDate}
          </small>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Nav pills className="nav-pills-custom bg-light rounded p-1" style={{ fontSize: "12px" }}>
            <NavItem>
              <NavLink
                href="#"
                className={`py-1 px-2 ${activeTab === "composition" ? "active" : "text-muted"}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("composition");
                }}
              >
                Sales &amp; Collections
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={`py-1 px-2 ${activeTab === "aging" ? "active" : "text-muted"}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("aging");
                }}
              >
                Aging Drill-down
              </NavLink>
            </NavItem>
          </Nav>
          <CardExportButtons
            onExport={handleExportExcel}
            targetId="sales-composition-card"
            title="Sales Composition and Aging"
          />
        </div>
      </CardHeader>

      <CardBody className="pt-0 d-flex flex-column justify-content-between">
        {activeTab === "composition" ? (
          <div>
            {loadingSalesByType ? (
              <div className="text-center py-5">
                <Spinner size="sm" color="primary" className="me-2" />
                <span className="text-muted">Loading sales composition...</span>
              </div>
            ) : errorSalesByType ? (
              <div className="text-center py-5 text-danger">{errorSalesByType}</div>
            ) : (
              <>
                {/* Stacked Composition Bar */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between fs-12 mb-1">
                    <span className="text-success fw-medium">
                      Cash Sales ({composition.cash.pct.toFixed(1)}%)
                    </span>
                    <span className="text-primary fw-medium">
                      Insurance &amp; Account Sales ({composition.account.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${Math.min(100, Math.max(0, composition.cash.pct))}%` }}
                    />
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${Math.min(100, Math.max(0, composition.account.pct))}%` }}
                    />
                  </div>
                </div>

                {/* Sales Split Table */}
                <div className="table-responsive mb-3" onMouseLeave={clearTooltip}>
                  <table
                    className="table table-sm table-nowrap align-middle mb-0"
                    style={{ tableLayout: "fixed", width: "100%" }}
                  >
                    <colgroup>
                      <col style={{ width: "28%" }} />
                      <col style={{ width: "24%" }} />
                      <col style={{ width: "24%" }} />
                      <col style={{ width: "24%" }} />
                    </colgroup>
                    <thead className="table-light text-muted">
                      <tr>
                        <th className="text-truncate" {...getCellTooltipHandlers("Column", "Sales Channel")}>
                          Sales Channel
                        </th>
                        <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Txns")}>
                          Txns
                        </th>
                        <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Incl. VAT")}>
                          Incl. VAT
                        </th>
                        <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Share")}>
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          className="text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Sales Channel", "Cash — Cash Sales & Cash Invoices")}
                        >
                          <span className="badge bg-success-subtle text-success me-2">Cash</span>
                          Cash Sales &amp; Cash Invoices
                        </td>
                        <td
                          className="text-end text-muted text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Txns", composition.cash.count.toLocaleString())}
                        >
                          {composition.cash.count.toLocaleString()}
                        </td>
                        <td
                          className="text-end fw-semibold text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Incl. VAT", formatCompact(composition.cash.incl))}
                        >
                          {formatCompact(composition.cash.incl)}
                        </td>
                        <td
                          className="text-end text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Share", `${composition.cash.pct.toFixed(1)}%`)}
                        >
                          {composition.cash.pct.toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Sales Channel", "Account — Insurance & Other Account Sales")}
                        >
                          <span className="badge bg-primary-subtle text-primary me-2">Account</span>
                          Insurance &amp; Other Account Sales
                        </td>
                        <td
                          className="text-end text-muted text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Txns", composition.account.count.toLocaleString())}
                        >
                          {composition.account.count.toLocaleString()}
                        </td>
                        <td
                          className="text-end fw-semibold text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Incl. VAT", formatCompact(composition.account.incl))}
                        >
                          {formatCompact(composition.account.incl)}
                        </td>
                        <td
                          className="text-end text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Share", `${composition.account.pct.toFixed(1)}%`)}
                        >
                          {composition.account.pct.toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Sales Channel", "Returns — Credit Notes / Sales Returns")}
                        >
                          <span className="badge bg-danger-subtle text-danger me-2">Returns</span>
                          Credit Notes / Sales Returns
                        </td>
                        <td
                          className="text-end text-muted text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Txns", composition.creditNotes.count.toLocaleString())}
                        >
                          {composition.creditNotes.count.toLocaleString()}
                        </td>
                        <td
                          className="text-end text-danger fw-medium text-truncate"
                          tabIndex={0}
                          {...getCellTooltipHandlers("Incl. VAT", formatCompact(composition.creditNotes.incl))}
                        >
                          {formatCompact(composition.creditNotes.incl)}
                        </td>
                        <td className="text-end text-muted text-truncate">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Separate Debt Collections Box */}
            <div className="p-3 rounded border bg-light-subtle">
              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                <div>
                  <span className="fw-semibold fs-13">Debt &amp; Customer Collections</span>
                  <span className="badge bg-info-subtle text-info ms-2 fs-11">Separate from New Sales</span>
                </div>
                <strong className="text-info fs-15">
                  {loadingCashbookSummary ? "..." : formatCurrency(collections.total, "KES", 0)}
                </strong>
              </div>
              <div className="d-flex flex-wrap gap-3 fs-12 text-muted">
                <span>
                  Allocated: <strong className="text-body">{formatCompact(collections.allocated)}</strong>
                </span>
                <span>
                  Unallocated: <strong className="text-warning">{formatCompact(collections.unallocated)}</strong>
                </span>
                {agingSummary.grandTotal > 0 && (
                  <span>
                    Open Insurer Bal:{" "}
                    <strong className="text-primary">{formatCompact(agingSummary.insurerTotal)}</strong> · Other Accts:{" "}
                    <strong className="text-body">{formatCompact(agingSummary.otherAcctTotal)}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {loadingCustomerAging ? (
              <div className="text-center py-5">
                <Spinner size="sm" color="primary" className="me-2" />
                <span className="text-muted">Loading receivables aging...</span>
              </div>
            ) : errorCustomerAging ? (
              <div className="text-center py-5 text-danger">{errorCustomerAging}</div>
            ) : (
              <>
                {/* Clickable Aging Bucket Pills */}
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-5 g-2 mb-3">
                  {agingSummary.buckets.map((b) => {
                    const isSelected = selectedBucket === b.key;
                    return (
                      <div className="col" key={b.key}>
                        <div
                          role="button"
                          onClick={() => setSelectedBucket(isSelected ? null : b.key)}
                          className={`p-2 rounded border h-100 ${
                            isSelected ? `border-${b.color} bg-${b.color}-subtle` : "bg-light"
                          }`}
                          title="Click to drill down to debtors in this bucket"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`fs-11 fw-medium text-${b.color}`}>{b.label}</span>
                            <span className="badge bg-white text-muted fs-10">{b.count}</span>
                          </div>
                          <div className="fw-semibold fs-14 mt-1">{formatCompact(b.amount)}</div>
                          <div className="text-muted fs-11">{b.pct.toFixed(1)}% of open AR</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Drilled-down Debtors for Selected Bucket */}
                {selectedBucket ? (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="fw-semibold">
                        Debtors in {AGING_BUCKETS.find((b) => b.key === selectedBucket)?.label} (
                        {agingSummary.drilledDebtors.length})
                      </small>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 fs-12"
                        onClick={() => setSelectedBucket(null)}
                      >
                        Clear filter
                      </button>
                    </div>
                    <div
                      className="table-responsive"
                      style={{ maxHeight: "175px", overflowY: "auto" }}
                      onMouseLeave={clearTooltip}
                    >
                      <table
                        className="table table-sm table-nowrap align-middle mb-0"
                        style={{ tableLayout: "fixed", width: "100%" }}
                      >
                        <colgroup>
                          <col style={{ width: "34%" }} />
                          <col style={{ width: "22%" }} />
                          <col style={{ width: "22%" }} />
                          <col style={{ width: "22%" }} />
                        </colgroup>
                        <thead className="table-light text-muted sticky-top">
                          <tr>
                            <th className="text-truncate">Customer / Insurer</th>
                            <th className="text-truncate">Segment</th>
                            <th className="text-end text-truncate">Bucket Bal.</th>
                            <th className="text-end text-truncate">Total Bal.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {agingSummary.drilledDebtors.slice(0, 50).map((d) => {
                            const customerText = `${d.name} (${d.code})`;
                            const segmentText = d.isInsurer ? "Insurance" : "Other Account";
                            const bucketBalText = formatCompact(d[selectedBucket]);
                            const totalBalText = formatCompact(d.total);
                            return (
                              <tr key={d.code}>
                                <td
                                  className="fw-medium text-truncate"
                                  tabIndex={0}
                                  {...getCellTooltipHandlers("Customer / Insurer", customerText)}
                                >
                                  {d.name} <small className="text-muted">({d.code})</small>
                                </td>
                                <td
                                  className="text-truncate"
                                  tabIndex={0}
                                  {...getCellTooltipHandlers("Segment", segmentText)}
                                >
                                  <span
                                    className={`badge bg-${d.isInsurer ? "primary" : "secondary"}-subtle text-${
                                      d.isInsurer ? "primary" : "secondary"
                                    }`}
                                  >
                                    {segmentText}
                                  </span>
                                </td>
                                <td
                                  className="text-end fw-semibold text-truncate"
                                  tabIndex={0}
                                  {...getCellTooltipHandlers("Bucket Bal.", bucketBalText)}
                                >
                                  {bucketBalText}
                                </td>
                                <td
                                  className="text-end text-muted text-truncate"
                                  tabIndex={0}
                                  {...getCellTooltipHandlers("Total Bal.", totalBalText)}
                                >
                                  {totalBalText}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <small className="text-muted d-block">
                    Click any aging bucket above to drill down into the individual insurance and account debtors.
                  </small>
                )}
              </>
            )}
          </div>
        )}

        <div className="border-top px-0 pt-2 mt-3">
          <small className="text-muted">
            Collections of prior invoices are reported separately from new period sales. Aging sourced {""}
            {/* from{" "}
            <code>PowerBIAccountBalance</code>  */}
            as at {appliedFilters.endDate}.
          </small>
        </div>

        <FloatingTooltip hoverInfo={hoverInfo} />
      </CardBody>
    </Card>
  );
};

export default SalesComposition;
