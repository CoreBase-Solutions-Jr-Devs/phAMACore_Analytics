import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import { getAccountBalance } from "../../helpers/fakebackend_helper";
import { formatCompact, formatCurrency } from "../utils/formatHelper";

// Helper to format Date objects to DD/MM/YYYY
const formatDMY = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const determineAgingProfile = (item) => {
  const over120 = Number(item.over_120 || 0);
  const d91_120 = Number(item.days_91_120 || 0);
  const d61_90 = Number(item.days_61_90 || 0);
  const d31_60 = Number(item.days_31_60 || 0);

  if (over120 > 0) {
    return {
      days: "> 120",
      status: "120+ Days",
      statusColor: "danger",
      risk: "Critical",
      riskColor: "danger",
    };
  }
  if (d91_120 > 0) {
    return {
      days: "91-120",
      status: "91-120 Days",
      statusColor: "danger",
      risk: "High",
      riskColor: "danger",
    };
  }
  if (d61_90 > 0) {
    return {
      days: "61-90",
      status: "60-90 Days",
      statusColor: "warning",
      risk: "High",
      riskColor: "danger",
    };
  }
  if (d31_60 > 0) {
    return {
      days: "31-60",
      status: "30-60 Days",
      statusColor: "info",
      risk: "Medium",
      riskColor: "warning",
    };
  }
  return {
    days: "0-30",
    status: "0-30 Days",
    statusColor: "success",
    risk: "Low",
    riskColor: "success",
  };
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : formatDMY(date);
};

const ReceivablesAgeing = () => {
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReceivablesAging = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate DD/MM/YYYY date strings (e.g., 01/01/2026 and 29/09/2026)
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const dateFrom = formatDMY(startOfYear);
        const dateTo = formatDMY(today);

        const response = await getAccountBalance({
          clientid: 1,
          Mode: "AGING",
          AccountType: "CUSTOMER",
          IncludeZeroBal: "false",
          DateFrom: dateFrom,
          DateTo: dateTo,
        });

        let data = response?.data ?? response;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            data = [];
          }
        }

        const rawList = Array.isArray(data)
          ? data
          : data?.result
          ? Array.isArray(data.result)
            ? data.result
            : [data.result]
          : [];

        const mapped = rawList.map((item) => {
          const profile = determineAgingProfile(item);
          return {
            customerCode: item.cuscode,
            customer: item.cusname || item.cuscode || "Unknown",
            lastInvoiceDate: formatDate(item.last_invoice_date),
            lastPaymentDate: formatDate(item.last_payment_date),
            days: profile.days,
            balance: item.total_balance || 0,
            status: profile.status,
            statusColor: profile.statusColor,
            risk: profile.risk,
            riskColor: profile.riskColor,
            insight: item.action_insight || "",
          };
        });

        if (isMounted) {
          setReceivables(mapped);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load receivables aging");
          setLoading(false);
        }
      }
    };

    fetchReceivablesAging();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card className="card-height-100">
      <CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          Receivables / Debtors (Cash Risk Table)
        </h4>
        <span className="badge bg-light text-muted">YTD Aging</span>
      </CardHeader>

      <CardBody>
        <div
          className="table-responsive table-card"
          style={{ maxHeight: "380px", overflowY: "auto" }}
        >
          <table className="table table-borderless table-centered table-nowrap mb-0">
            <thead className="text-muted table-light sticky-top">
              <tr>
                <th>Customer</th>
                <th>Last Invoiced</th>
                <th>Last Payment</th>
                <th>Days Bracket</th>
                <th>Bal (KES)</th>
                <th>Aging Status</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <Spinner size="sm" color="primary" className="me-2" />
                    <span className="text-muted">Loading debtor records...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-danger">
                    {error}
                  </td>
                </tr>
              ) : receivables.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <h6 className="text-muted mb-0">No open customer balances found</h6>
                  </td>
                </tr>
              ) : (
                receivables.map((item, index) => (
                  <tr key={item.customerCode || index}>
                    <td className="fw-medium">
                      <div>{item.customer}</div>
                      <small className="text-muted">{item.customerCode}</small>
                    </td>

                    <td className="text-muted fs-12">{item.lastInvoiceDate}</td>

                    <td className="text-muted fs-12">{item.lastPaymentDate}</td>

                    <td>{item.days}</td>

                    <td
                      className="fw-semibold"
                      title={formatCurrency(item.balance, "KES", 2)}
                    >
                      {formatCompact(item.balance)}
                    </td>

                    <td>
                      <span
                        className={`badge bg-${item.statusColor}-subtle text-${item.statusColor}`}
                      >
                        {item.status}
                      </span>
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
      </CardBody>
    </Card>
  );
};

export default ReceivablesAgeing;