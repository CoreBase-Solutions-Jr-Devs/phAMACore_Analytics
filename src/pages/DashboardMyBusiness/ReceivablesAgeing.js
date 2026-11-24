import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import { getAccountBalance } from "../../helpers/fakebackend_helper";
import { formatCompact, formatCurrency } from "../utils/formatHelper";
import { exportToExcel } from "../../helpers/export_helper";
import { cleanBranchName } from "../../helpers/branch_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import FloatingTooltip from "../../Components/Common/FloatingTooltip";
import { exportStamp, money } from "./TrendCardBody";
import { toList, pick, num } from "../utils/apiRow";
import useTableCellTooltip from "./useTableCellTooltip";

const AGE_BUCKETS = [
  { key: "over_120", status: "120+ Days", color: "danger", risk: "Critical", riskColor: "danger", rank: 5 },
  { key: "days_91_120", status: "91–120 Days", color: "danger", risk: "High", riskColor: "danger", rank: 4 },
  { key: "days_61_90", status: "61–90 Days", color: "warning", risk: "Medium", riskColor: "warning", rank: 3 },
  { key: "days_31_60", status: "31–60 Days", color: "info", risk: "Low", riskColor: "info", rank: 2 },
  { key: "current_0_30", status: "0–30 Days", color: "success", risk: "Current", riskColor: "success", rank: 1 },
];

const profileOf = (row) => {
  const hit = AGE_BUCKETS.find((b) => num(pick(row, b.key)) > 0);
  return hit || AGE_BUCKETS[AGE_BUCKETS.length - 1];
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("en-GB");
};

const estimateDueDate = (transDate, termDays = 30) => {
  if (!transDate) return "-";
  const d = new Date(transDate);
  if (Number.isNaN(d.getTime())) return "-";
  d.setDate(d.getDate() + termDays);
  return d.toLocaleDateString("en-GB");
};

const dateToTs = (value) => {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const COLUMNS = [
  { key: "customer", label: "Debtor / Insurer" },
  { key: "balance", label: "Outstanding (KES)", sortable: true },
  { key: "current_0_30", label: "0–30d", sortable: true },
  { key: "days_31_60", label: "31–60d", sortable: true },
  { key: "days_61_90", label: "61–90d", sortable: true },
  { key: "days_91_120", label: "91–120d", sortable: true },
  { key: "over_120", label: ">120d", sortable: true },
  { key: "lastPaymentTs", label: "Last Payment", sortable: true },
  { key: "rank", label: "Ageing Bucket", sortable: true },
];

const PAGE_SIZE = 50;

const ReceivablesAgeing = () => {
  const [sort, setSort] = useState({ key: "balance", desc: true });
  const [bucketFilter, setBucketFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { hoverInfo, setHoverInfo, getCellTooltipHandlers, clearTooltip } = useTableCellTooltip();

  // Expandable invoice & originating branch drill-down (PowerBIAccountBalance Mode = DETAIL)
  const [expandedCode, setExpandedCode] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [loadingDetailCode, setLoadingDetailCode] = useState(null);

  const {
    customerAging = [],
    loadingCustomerAging: loading,
    errorCustomerAging: error,
    appliedFilters = {},
  } = useSelector((state) => state.DashboardMyBusiness || state.MyBusiness || {});

  const receivables = useMemo(() => {
    return (customerAging || []).map((r) => {
      const code = String(pick(r, "cuscode") ?? "");
      const profile = profileOf(r);
      const lastPayRaw = pick(r, "last_payment_date");
      const lastInvRaw = pick(r, "last_invoice_date");
      return {
        code,
        customer: pick(r, "cusname") || code || "Unknown",
        balance: num(pick(r, "total_balance")),
        current_0_30: num(pick(r, "current_0_30")),
        days_31_60: num(pick(r, "days_31_60")),
        days_61_90: num(pick(r, "days_61_90")),
        days_91_120: num(pick(r, "days_91_120")),
        over_120: num(pick(r, "over_120")),
        lastPayment: formatDate(lastPayRaw),
        lastPaymentTs: dateToTs(lastPayRaw),
        lastInvoice: formatDate(lastInvRaw),
        insight: pick(r, "action_insight") || "",
        ...profile,
      };
    });
  }, [customerAging]);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = receivables.filter((r) => {
      if (bucketFilter !== "ALL" && r.key !== bucketFilter) return false;
      if (q && !r.customer.toLowerCase().includes(q) && !r.code.toLowerCase().includes(q)) return false;
      return true;
    });

    const direction = sort.desc ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const diff = (a[sort.key] ?? 0) - (b[sort.key] ?? 0);
      if (diff !== 0) return diff * direction;
      // Tie-breaker: largest balance first
      return b.balance - a.balance;
    });
  }, [receivables, sort, bucketFilter, search]);

  const totals = useMemo(
    () => ({
      balance: filteredAndSorted.reduce((s, r) => s + r.balance, 0),
      over90: filteredAndSorted.reduce((s, r) => s + r.days_91_120 + r.over_120, 0),
    }),
    [filteredAndSorted]
  );

  const toggleSort = (key) =>
    setSort((prev) => ({ key, desc: prev.key === key ? !prev.desc : true }));

  const handleRowExpand = async (item) => {
    if (expandedCode === item.code) {
      setExpandedCode(null);
      return;
    }
    setExpandedCode(item.code);
    const cacheKey = `${item.code}|${appliedFilters.branch ?? 0}|${appliedFilters.endDate || ""}`;
    if (detailCache[cacheKey]) return;

    setLoadingDetailCode(item.code);
    try {
      const res = await getAccountBalance({
        clientid: 1,
        Mode: "DETAIL",
        AccountType: "CUSTOMER",
        CusCode: item.code,
        branchcode: appliedFilters.branch ?? 0,
        DateTo: appliedFilters.endDate,
      });
      const rows = toList(res).filter(
        (d) => String(pick(d, "source_table") || "").toUpperCase() === "SALETRANS" || num(pick(d, "debit")) > 0
      );
      setDetailCache((prev) => ({ ...prev, [cacheKey]: rows.slice(-25).reverse() }));
    } catch {
      setDetailCache((prev) => ({ ...prev, [cacheKey]: [] }));
    } finally {
      setLoadingDetailCode(null);
    }
  };

  const handleExportExcel = () => {
    const rows = filteredAndSorted.map((r) => ({
      "Customer Code": r.code,
      "Debtor / Insurer": r.customer,
      "Outstanding Balance (KES)": money(r.balance),
      "Current 0-30 Days (KES)": money(r.current_0_30),
      "31-60 Days (KES)": money(r.days_31_60),
      "61-90 Days (KES)": money(r.days_61_90),
      "91-120 Days (KES)": money(r.days_91_120),
      "Over 120 Days (KES)": money(r.over_120),
      "Last Invoice Date": r.lastInvoice,
      "Last Payment Date": r.lastPayment,
      "Oldest Ageing Bucket": r.status,
      "Action Insight": r.insight,
    }));
    exportToExcel(rows, `Receivables_Ageing_${exportStamp()}`);
  };

  const visibleRows = showAll ? filteredAndSorted : filteredAndSorted.slice(0, PAGE_SIZE);

  const message = loading ? (
    <>
      <Spinner size="sm" color="primary" className="me-2" />
      <span className="text-muted">Loading all debtor records...</span>
    </>
  ) : error ? (
    <span className="text-danger">{error}</span>
  ) : !filteredAndSorted.length ? (
    <h6 className="text-muted mb-0">No matching open customer balances found</h6>
  ) : null;

  return (
    <Card className="card-height-100" id="receivables-ageing-card">
      <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
        <div>
          <h4 className="card-title mb-0">Receivables Ageing (All Debtors)</h4>
          <small className="text-muted">
            {filteredAndSorted.length.toLocaleString()} debtors · Outstanding{" "}
            <strong>{formatCurrency(totals.balance, "KES", 0)}</strong> · 90+ Days{" "}
            <strong className="text-danger">{formatCurrency(totals.over90, "KES", 0)}</strong>
          </small>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <input
            type="search"
            className="form-control form-control-sm"
            style={{ width: "180px" }}
            placeholder="Search debtor / insurer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="btn-group btn-group-sm" role="group" aria-label="Quick sort">
            <button
              type="button"
              className={`btn ${sort.key === "balance" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setSort({ key: "balance", desc: true })}
            >
              Largest
            </button>
            <button
              type="button"
              className={`btn ${sort.key === "rank" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setSort({ key: "rank", desc: true })}
            >
              Oldest
            </button>
          </div>
          <CardExportButtons
            onExport={handleExportExcel}
            targetId="receivables-ageing-card"
            title="Receivables Ageing"
          />
        </div>
      </CardHeader>

      <CardBody className="pt-2">
        {/* Bucket Filter Pills */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          <button
            type="button"
            className={`btn btn-sm py-0 px-2 ${bucketFilter === "ALL" ? "btn-dark" : "btn-light text-muted"}`}
            onClick={() => setBucketFilter("ALL")}
          >
            All ({receivables.length})
          </button>
          {[...AGE_BUCKETS].reverse().map((b) => (
            <button
              key={b.key}
              type="button"
              className={`btn btn-sm py-0 px-2 ${
                bucketFilter === b.key ? `btn-${b.color}` : "btn-light text-muted"
              }`}
              onClick={() => setBucketFilter(b.key)}
            >
              {b.status}
            </button>
          ))}
        </div>

        <div
          className="table-responsive table-card"
          style={{ maxHeight: "430px", overflowY: "auto" }}
          onMouseLeave={clearTooltip}
        >
          <table
            className="table table-borderless table-hover table-centered table-nowrap mb-0"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "11%" }} />
            </colgroup>
            <thead className="text-muted table-light sticky-top" style={{ zIndex: 2 }}>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    role={col.sortable ? "button" : undefined}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                    title={col.sortable ? "Click to sort" : undefined}
                    className={`text-truncate ${col.key !== "customer" && col.key !== "rank" ? "text-end" : ""}`}
                    {...getCellTooltipHandlers("Column", col.label)}
                  >
                    {col.label}
                    {col.sortable && (
                      <i
                        className={`ms-1 ${
                          sort.key !== col.key
                            ? "ri-arrow-up-down-line text-muted"
                            : sort.desc
                            ? "ri-arrow-down-line"
                            : "ri-arrow-up-line"
                        }`}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {message ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="text-center py-5">
                    {message}
                  </td>
                </tr>
              ) : (
                visibleRows.map((item, index) => {
                  const isExpanded = expandedCode === item.code;
                  const cacheKey = `${item.code}|${appliedFilters.branch ?? 0}|${appliedFilters.endDate || ""}`;
                  const detailRows = detailCache[cacheKey] || [];
                  const riskHex =
                    item.riskColor === "danger"
                      ? "#f06548"
                      : item.riskColor === "warning"
                      ? "#f7b84b"
                      : "#0ab39c";
                  const rowTooltipPayload = {
                    title: item.customer,
                    badgeColor: riskHex,
                    mainValue: `Outstanding: ${formatCurrency(item.balance, "KES", 2)}`,
                    mainColor: "#00e396",
                    subText: `Code: ${item.code} · Last Invoice: ${item.lastInvoice} · Last Payment: ${item.lastPayment}`,
                    extraText: item.insight || "Click row to inspect invoices & originating branch.",
                  };

                  return (
                    <React.Fragment key={`${item.code}-${index}`}>
                      <tr
                        role="button"
                        tabIndex={0}
                        onClick={() => handleRowExpand(item)}
                        onMouseEnter={(e) =>
                          setHoverInfo({
                            x: e.clientX,
                            y: e.clientY,
                            ...rowTooltipPayload,
                          })
                        }
                        onMouseMove={(e) =>
                          setHoverInfo((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
                        }
                        onMouseLeave={clearTooltip}
                        onFocus={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoverInfo({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            ...rowTooltipPayload,
                          });
                        }}
                        onBlur={clearTooltip}
                      >
                        <td className="fw-medium">
                          <div className="text-truncate">
                            <i
                              className={`me-1 text-muted ${
                                isExpanded ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"
                              }`}
                            />
                            <span>{item.customer}</span>
                          </div>
                          <div className="text-muted fs-11 ps-3 text-truncate">{item.code}</div>
                        </td>
                        <td className="text-end fw-semibold text-truncate">{formatCompact(item.balance)}</td>
                        <td className="text-end text-muted fs-12 text-truncate">{formatCompact(item.current_0_30)}</td>
                        <td className="text-end text-muted fs-12 text-truncate">{formatCompact(item.days_31_60)}</td>
                        <td className="text-end text-muted fs-12 text-truncate">{formatCompact(item.days_61_90)}</td>
                        <td className="text-end text-danger fs-12 text-truncate">{formatCompact(item.days_91_120)}</td>
                        <td className="text-end text-danger fw-medium fs-12 text-truncate">{formatCompact(item.over_120)}</td>
                        <td className="text-end text-muted fs-12 text-truncate">{item.lastPayment}</td>
                        <td className="text-truncate">
                          <span className={`badge bg-${item.color}-subtle text-${item.color}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-light-subtle">
                          <td colSpan={COLUMNS.length} className="p-3">
                            <div className="fs-12 fw-semibold mb-2">
                              Recent Invoices &amp; Originating Branch — {item.customer} ({item.code})
                            </div>
                            {loadingDetailCode === item.code ? (
                              <div className="py-2 text-muted">
                                <Spinner size="sm" color="primary" className="me-2" />
                                Loading invoice ledger...
                              </div>
                            ) : !detailRows.length ? (
                              <div className="text-muted fs-12">
                                No invoice ledger entries returned for this period.
                              </div>
                            ) : (
                              <div
                                className="table-responsive"
                                style={{ maxHeight: "220px", overflowY: "auto" }}
                                onMouseLeave={clearTooltip}
                              >
                                <table
                                  className="table table-sm table-bordered mb-0 fs-12 bg-white"
                                  style={{ tableLayout: "fixed", width: "100%" }}
                                >
                                  <colgroup>
                                    <col style={{ width: "14%" }} />
                                    <col style={{ width: "18%" }} />
                                    <col style={{ width: "11%" }} />
                                    <col style={{ width: "12%" }} />
                                    <col style={{ width: "12%" }} />
                                    <col style={{ width: "11%" }} />
                                    <col style={{ width: "11%" }} />
                                    <col style={{ width: "11%" }} />
                                  </colgroup>
                                  <thead className="table-light sticky-top" style={{ top: 0, zIndex: 1 }}>
                                    <tr>
                                      <th className="text-truncate" {...getCellTooltipHandlers("Column", "Invoice / Ref")}>
                                        Invoice / Ref
                                      </th>
                                      <th className="text-truncate" {...getCellTooltipHandlers("Column", "Originating Branch")}>
                                        Originating Branch
                                      </th>
                                      <th className="text-truncate" {...getCellTooltipHandlers("Column", "Invoice Date")}>
                                        Invoice Date
                                      </th>
                                      <th className="text-truncate" {...getCellTooltipHandlers("Column", "Est. Due Date (+30d)")}>
                                        Est. Due Date (+30d)
                                      </th>
                                      <th className="text-truncate" {...getCellTooltipHandlers("Column", "Type")}>
                                        Type
                                      </th>
                                      <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Debit")}>
                                        Debit
                                      </th>
                                      <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Credit")}>
                                        Credit
                                      </th>
                                      <th className="text-end text-truncate" {...getCellTooltipHandlers("Column", "Running Bal.")}>
                                        Running Bal.
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detailRows.map((d, dIdx) => {
                                      const docRef = pick(d, "doc_ref") || "-";
                                      const origBranch = cleanBranchName(pick(d, "branch_name") || "-");
                                      const invDate = formatDate(pick(d, "trans_date"));
                                      const dueDate = estimateDueDate(pick(d, "trans_date"), 30);
                                      const transType = pick(d, "trans_type") || "-";
                                      const debitText = formatCompact(num(pick(d, "debit")));
                                      const creditText = formatCompact(num(pick(d, "credit")));
                                      const runBalText = formatCompact(num(pick(d, "running_balance")));
                                      return (
                                        <tr key={`${docRef}-${dIdx}`}>
                                          <td
                                            className="fw-medium text-truncate"
                                            tabIndex={0}
                                            {...getCellTooltipHandlers("Invoice / Ref", docRef)}
                                          >
                                            {docRef}
                                          </td>
                                          <td
                                            className="text-truncate"
                                            tabIndex={0}
                                            {...getCellTooltipHandlers("Originating Branch", origBranch)}
                                          >
                                            {origBranch}
                                          </td>
                                          <td
                                            className="text-truncate"
                                            tabIndex={0}
                                            {...getCellTooltipHandlers("Invoice Date", invDate)}
                                          >
                                            {invDate}
                                          </td>
                                          <td
                                            className="text-truncate"
                                            tabIndex={0}
                                            {...getCellTooltipHandlers("Est. Due Date (+30d)", dueDate)}
                                          >
                                            {dueDate}
                                          </td>
                                          <td
                                            className="text-muted text-truncate"
                                            tabIndex={0}
                                            {...getCellTooltipHandlers("Type", transType)}
                                          >
                                            {transType}
                                          </td>
                                          <td
                                            className="text-end text-truncate"
                                            tabIndex={0}
                                            {...getCellTooltipHandlers("Debit", debitText)}
                                          >
                                            {debitText}
                                          </td>
                                          <td
                                            className="text-end text-success text-truncate"
                                            tabIndex={0}
                                            {...getCellTooltipHandlers("Credit", creditText)}
                                          >
                                            {creditText}
                                          </td>
                                          <td
                                            className="text-end fw-semibold text-truncate"
                                            tabIndex={0}
                                            {...getCellTooltipHandlers("Running Bal.", runBalText)}
                                          >
                                            {runBalText}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
          <small className="text-muted">
            Showing {visibleRows.length.toLocaleString()} of {filteredAndSorted.length.toLocaleString()} debtors
            (as at {appliedFilters.endDate}). Click any row to view invoices &amp; originating branch. Excel
            export includes all matching records.
          </small>
          {filteredAndSorted.length > PAGE_SIZE && (
            <button
              type="button"
              className="btn btn-soft-primary btn-sm"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? `Show Top ${PAGE_SIZE}` : `Show All ${filteredAndSorted.length.toLocaleString()} Debtors`}
            </button>
          )}
        </div>

        <FloatingTooltip hoverInfo={hoverInfo} />
      </CardBody>
    </Card>
  );
};

export default ReceivablesAgeing;
