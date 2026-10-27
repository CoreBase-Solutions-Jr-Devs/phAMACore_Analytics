import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import { getKPIStockHealth } from "../../helpers/fakebackend_helper";
import { formatNumber } from "../utils/formatHelper";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import FloatingTooltip from "../../Components/Common/FloatingTooltip";
import { cleanBranchName } from './../../helpers/branch_helper';

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
  const [hoverInfo, setHoverInfo] = useState(null);

  const handleCellHover = (e, info) => {
    setHoverInfo({
      ...info,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e) => {
    if (hoverInfo) {
      setHoverInfo((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
    }
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  const appliedFilters = useSelector(
    (state) => (state.DashboardMyBusiness || state.MyBusiness)?.appliedFilters || {}
  );

  useEffect(() => {
    let isMounted = true;

    const fetchStockAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        const todayFormatted = formatDMY(new Date());

        const response = await getKPIStockHealth({
          clientid: 1,
          AsOfDate: appliedFilters.endDate || todayFormatted,
          GroupBy: "CRITICAL_STOCKOUTS",
          TopN: 0,
          branchcode: appliedFilters.branch ?? null,
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
  }, [appliedFilters.branch, appliedFilters.endDate]);

  const handleExportExcel = () => {
    const rows = (stockAlerts || []).map((item) => ({
      Product: item.item_name || item.item_code || "",
      Category: item.item_group || "-",
      Stock: Number(item.current_stock_qty || 0).toLocaleString(),
      "Min Reorder": Number(item.branch_min_qty || 0).toLocaleString(),
      "Monthly Demand": Number(item.monthly_demand || 0).toLocaleString(),
      Branch: item.branch_name || "-",
      Status: item.stockout_risk_status || "Unknown",
    }));
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Stock_Alerts_Movements_${todayStr}`);
  };

  return (
    <Card className="card-height-100" id="stock-movements-card">
      <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
        <h4 className="card-title mb-0">
          Stock Alerts & Movement Tracking
        </h4>
        <div className="d-flex align-items-center gap-2">
          <CardExportButtons
            onExport={handleExportExcel}
            targetId="stock-movements-card"
            title="Stock Alerts & Movements"
          />
        </div>
      </CardHeader>

      <CardBody>
        <div
          className="table-responsive table-card"
          style={{ maxHeight: "380px", overflowY: "auto" }}
          onMouseLeave={handleMouseLeave}
        >
          <table className="table table-borderless table-centered table-nowrap mb-0">
            <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
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
                  const branchName = cleanBranchName(item.branch_name || `Branch ${item.branch_id}`);
                  const badgeHex =
                    badge.color === "danger"
                      ? "#f06548"
                      : badge.color === "warning"
                      ? "#f7b84b"
                      : badge.color === "info"
                      ? "#299cdb"
                      : "#0ab39c";
                  const minReorder = item.effective_min_qty ?? item.branch_min_qty;

                  return (
                    <tr
                      key={`${item.item_code}-${item.branch_id}-${index}`}
                      onMouseEnter={(e) =>
                        handleCellHover(e, {
                          title: item.item_name || item.item_code || "Product",
                          badgeColor: badgeHex,
                          mainValue: `${formatNumber(item.current_stock_qty)} in stock · ${badge.label}`,
                          mainColor: badgeHex,
                          subText: `Branch: ${branchName} · Min Reorder: ${formatNumber(minReorder)} · Monthly Demand: ${formatNumber(item.monthly_demand)}`,
                          extraText: item.action_insight || (item.item_code ? `SKU: ${item.item_code} · Category: ${item.item_subgroup || item.item_group || "-"}` : undefined),
                        })
                      }
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <td className="fw-medium">
                        <div>{item.item_name}</div>
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
                        {formatNumber(minReorder)}
                      </td>
                      <td>{formatNumber(item.monthly_demand)}</td>
                      <td>{branchName}</td>
                      <td>
                        <span
                          className={`badge bg-${badge.color}-subtle text-${badge.color}`}
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
        <FloatingTooltip hoverInfo={hoverInfo} />
      </CardBody>
    </Card>
  );
};

export default StockMovements;
