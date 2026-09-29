import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import { getKPIStockHealth } from "../../helpers/fakebackend_helper";
import { formatNumber } from "../utils/formatHelper";

const formatDMY = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case "STOCKED_OUT":
      return { label: "Stocked Out", color: "danger" };
    case "CRITICAL":
      return { label: "Critical", color: "danger" };
    case "LOW_STOCK":
    case "UNDER_MINIMUM":
      return { label: "Low Stock", color: "warning" };
    case "OVERSTOCK":
      return { label: "Overstock", color: "info" };
    case "OPTIMAL":
    case "NORMAL":
      return { label: "Normal", color: "success" };
    default:
      return { label: status || "Unknown", color: "secondary" };
  }
};

const StockMovements = () => {
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStockAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        const todayFormatted = formatDMY(new Date());

        const response = await getKPIStockHealth({
          clientid: 1,
          AsOfDate: todayFormatted,
          GroupBy: "CRITICAL_STOCKOUTS",
          TopN: 30,
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

        if (isMounted) {
          setStockAlerts(rawList);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load stock alerts");
          setLoading(false);
        }
      }
    };

    fetchStockAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card className="card-height-100">
      <CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          Stock Alerts & Movement Tracking
        </h4>
        <span className="badge bg-danger-subtle text-danger">
          Top 30 Critical Stockouts
        </span>
      </CardHeader>

      <CardBody>
        <div
          className="table-responsive table-card"
          style={{ maxHeight: "380px", overflowY: "auto" }}
        >
          <table className="table table-borderless table-centered table-nowrap mb-0">
            <thead className="text-muted table-light sticky-top">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Min Reorder</th>
                <th>Monthly Demand</th>
                <th>Branch</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <Spinner size="sm" color="primary" className="me-2" />
                    <span className="text-muted">Loading stock alerts...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-danger">
                    {error}
                  </td>
                </tr>
              ) : stockAlerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <h6 className="text-muted mb-0">No stock alerts found</h6>
                  </td>
                </tr>
              ) : (
                stockAlerts.map((item, index) => {
                  const badge = getStatusBadge(item.stockout_risk_status);
                  return (
                    <tr key={`${item.item_code}-${item.branch_id}-${index}`}>
                      <td className="fw-medium">
                        <div title={item.item_name}>{item.item_name}</div>
                        <small className="text-muted">{item.item_code}</small>
                      </td>
                      <td className="text-muted">
                        {item.item_subgroup || item.item_group || "-"}
                      </td>
                      <td
                        className={
                          Number(item.current_stock_qty) <= 0
                            ? "text-danger fw-semibold"
                            : "fw-semibold"
                        }
                      >
                        {formatNumber(item.current_stock_qty)}
                      </td>
                      <td>
                        {formatNumber(
                          item.effective_min_qty ?? item.branch_min_qty
                        )}
                      </td>
                      <td>{formatNumber(item.monthly_demand)}</td>
                      <td>{item.branch_name || `Branch ${item.branch_id}`}</td>
                      <td>
                        <span
                          className={`badge bg-${badge.color}-subtle text-${badge.color}`}
                          title={item.action_insight}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default StockMovements;