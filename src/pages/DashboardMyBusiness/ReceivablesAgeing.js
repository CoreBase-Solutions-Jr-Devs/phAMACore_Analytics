import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import { getAccountBalance, getKPIOverdueDebtors } from "../../helpers/fakebackend_helper";
import { formatCompact, formatCurrency } from "../utils/formatHelper";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import { toList, pick, num } from "../utils/apiRow";
import { exportStamp, money } from "./TrendCardBody";

const MAX_ROWS = 200;

// Oldest bucket that still holds a balance decides the status and risk
const BUCKETS = [
  { fields: ["Overdue_120_Plus", "over_120"], status: "120+ Days", color: "danger", risk: "Critical", riskColor: "danger" },
  { fields: ["Overdue_91_120", "days_91_120"], status: "91-120 Days", color: "danger", risk: "High", riskColor: "danger" },
  { fields: ["Overdue_61_90", "days_61_90"], status: "61-90 Days", color: "warning", risk: "High", riskColor: "danger" },
  { fields: ["Overdue_31_60", "days_31_60"], status: "31-60 Days", color: "info", risk: "Medium", riskColor: "warning" },
];

const profileOf = (row, overdueMode) => {
  const bucket = BUCKETS.find((b) => num(pick(row, ...b.fields)) > 0);
  if (bucket) return bucket;
  if (!overdueMode) return { status: "0-30 Days", color: "success", risk: "Low", riskColor: "success" };
  return num(pick(row, "Overdue_1_30")) > 0
    ? { status: "1-30 Days", color: "success", risk: "Low", riskColor: "success" }
    : { status: "Within terms", color: "success", risk: "Low", riskColor: "success" };
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-GB");
};

const COLUMNS = [
  { key: "customer", label: "Customer" },
  { key: "category", label: "Category" },
  { key: "balance", label: "Balance (KES)", sortable: true },
  { key: "overdue", label: "Overdue (KES)", sortable: true },
  { key: "maxDays", label: "Days Overdue", sortable: true },
  { key: "lastPayment", label: "Last Payment" },
  { key: "status", label: "Ageing" },
  { key: "risk", label: "Risk" },
];

const ReceivablesAgeing = () => {
  const [receivables, setReceivables] = useState([]);
  const [byTerms, setByTerms] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ key: "balance", desc: true });

  const { filters = {} } = useSelector(
    (state) => state.DashboardMyBusiness || state.MyBusiness || {}
  );

  useEffect(() => {
    let isMounted = true;

    const fetchReceivables = async () => {
      setLoading(true);
      setError(null);

      // Ageing against payment terms (preferred) + balance-age grid for last payment dates.
      // If the overdue endpoint is unavailable the balance-age grid is shown on its own.
      const [overdueRes, agingRes] = await Promise.allSettled([
        getKPIOverdueDebtors({
          clientid: 1,
          AsOfDate: filters.endDate,
          branchcode: filters.branch ?? 0,
          OverdueOnly: false,
          GroupBy: "CUSTOMER",
        }),
        getAccountBalance({
          clientid: 1,
          Mode: "AGING",
          AccountType: "CUSTOMER",
          IncludeZeroBal: false,
          DateTo: filters.endDate,
          branchcode: filters.branch ?? 0,
        }),
      ]);
      if (!isMounted) return;

      const aging = agingRes.status === "fulfilled" ? toList(agingRes.value) : [];
      const overdue = (overdueRes.status === "fulfilled" ? toList(overdueRes.value) : []).filter((r) =>
        pick(r, "CUS_CODE")
      );
      const agingByCode = new Map(aging.map((r) => [String(pick(r, "cuscode")), r]));
      const overdueMode = overdue.length > 0;

      const rows = overdueMode
        ? overdue.map((r) => {
            const code = String(pick(r, "CUS_CODE"));
            return {
              code,
              customer: pick(r, "CUS_DESC") || code,
              category: pick(r, "CustCategory") || "-",
              terms: pick(r, "Payterms") || "",
              balance: num(pick(r, "TotalBalance")),
              overdue: num(pick(r, "OverdueAmount")),
              maxDays: num(pick(r, "MaxDaysOverdue")),
              overLimit: num(pick(r, "ExcessOverCreditLimit")),
              lastPayment: formatDate(pick(agingByCode.get(code), "last_payment_date")),
              ...profileOf(r, true),
            };
          })
        : aging.map((r) => ({
            code: String(pick(r, "cuscode") ?? ""),
            customer: pick(r, "cusname") || pick(r, "cuscode") || "Unknown",
            category: "-",
            terms: "",
            balance: num(pick(r, "total_balance")),
            overdue: null,
            maxDays: null,
            overLimit: 0,
            lastPayment: formatDate(pick(r, "last_payment_date")),
            insight: pick(r, "action_insight") || "",
            ...profileOf(r, false),
          }));

      setReceivables(rows);
      setByTerms(overdueMode);
      if (!rows.length && overdueRes.status === "rejected" && agingRes.status === "rejected") {
        setError(agingRes.reason?.message || "Failed to load receivables ageing");
      }
      setLoading(false);
    };

    fetchReceivables();

    return () => {
      isMounted = false;
    };
  }, [filters.branch, filters.endDate]);

  const sorted = useMemo(() => {
    const direction = sort.desc ? -1 : 1;
    return [...receivables].sort((a, b) => ((a[sort.key] ?? 0) - (b[sort.key] ?? 0)) * direction);
  }, [receivables, sort]);

  const totals = useMemo(
    () => ({
      balance: receivables.reduce((sum, r) => sum + r.balance, 0),
      overdue: receivables.reduce((sum, r) => sum + (r.overdue || 0), 0),
    }),
    [receivables]
  );

  const toggleSort = (key) =>
    setSort((prev) => ({ key, desc: prev.key === key ? !prev.desc : true }));

  const handleExportExcel = () => {
    const rows = sorted.map((r) => ({
      "Customer Code": r.code,
      Customer: r.customer,
      Category: r.category,
      "Payment Terms": r.terms || "-",
      "Balance (KES)": money(r.balance),
      "Overdue (KES)": r.overdue == null ? "-" : money(r.overdue),
      "Max Days Overdue": r.maxDays ?? "-",
      "Over Credit Limit (KES)": money(r.overLimit),
      "Last Payment": r.lastPayment,
      Ageing: r.status,
      Risk: r.risk,
    }));
    exportToExcel(rows, `Receivables_Ageing_${exportStamp()}`);
  };

  const message = loading ? (
    <>
      <Spinner size="sm" color="primary" className="me-2" />
      <span className="text-muted">Loading debtor records...</span>
    </>
  ) : error ? (
    <span className="text-danger">{error}</span>
  ) : !receivables.length ? (
    <h6 className="text-muted mb-0">No open customer balances found</h6>
  ) : null;

  return (
    <Card className="card-height-100" id="receivables-ageing-card">
      <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
        <div>
          <h4 className="card-title mb-0">Receivables / Debtors (Cash Risk Table)</h4>
          <small className="text-muted">
            {receivables.length.toLocaleString()} debtors · Balance{" "}
            <strong>{formatCurrency(totals.balance, "KES", 0)}</strong>
            {byTerms && (
              <>
                {" "}· Overdue <strong className="text-danger">{formatCurrency(totals.overdue, "KES", 0)}</strong>
              </>
            )}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-muted">
            {byTerms ? "Aged against payment terms" : "Aged by balance age"} · as at {filters.endDate}
          </span>
          <CardExportButtons
            onExport={handleExportExcel}
            targetId="receivables-ageing-card"
            title="Receivables Ageing"
          />
        </div>
      </CardHeader>

      <CardBody>
        <div className="table-responsive table-card" style={{ maxHeight: "380px", overflowY: "auto" }}>
          <table className="table table-borderless table-centered table-nowrap mb-0">
            <thead className="text-muted table-light sticky-top">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    role={col.sortable ? "button" : undefined}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                    title={col.sortable ? "Click to sort" : undefined}
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
                sorted.slice(0, MAX_ROWS).map((item, index) => (
                  <tr key={`${item.code}-${index}`}>
                    <td className="fw-medium">
                      <div>{item.customer}</div>
                      <small className="text-muted">
                        {item.code}
                        {item.terms ? ` · ${item.terms}` : ""}
                      </small>
                    </td>
                    <td className="text-muted fs-12">{item.category}</td>
                    <td className="fw-semibold" title={formatCurrency(item.balance, "KES", 2)}>
                      {formatCompact(item.balance)}
                      {item.overLimit > 0 && (
                        <i
                          className="ri-error-warning-line text-danger ms-1"
                          title={`Over credit limit by ${formatCurrency(item.overLimit, "KES", 0)}`}
                        />
                      )}
                    </td>
                    <td className={item.overdue > 0 ? "text-danger fw-medium" : "text-muted"}>
                      {item.overdue == null ? "-" : formatCompact(item.overdue)}
                    </td>
                    <td>{item.maxDays == null ? "-" : item.maxDays}</td>
                    <td className="text-muted fs-12">{item.lastPayment}</td>
                    <td>
                      <span className={`badge bg-${item.color}-subtle text-${item.color}`}>{item.status}</span>
                    </td>
                    <td>
                      <span
                        className={`badge bg-${item.riskColor}-subtle text-${item.riskColor}`}
                        title={item.insight}
                      >
                        {item.risk}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sorted.length > MAX_ROWS && (
          <small className="text-muted d-block mt-3">
            Showing the first {MAX_ROWS} of {sorted.length.toLocaleString()} debtors in the current sort
            order. The Excel export contains all of them.
          </small>
        )}
      </CardBody>
    </Card>
  );
};

export default ReceivablesAgeing;
