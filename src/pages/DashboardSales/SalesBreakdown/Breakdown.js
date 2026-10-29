import React from "react";
import { Card, CardBody, CardHeader, Badge } from "reactstrap";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";

const Breakdown = ({
  CASH,
  INSURANCE,
  OTHER_ACCOUNT,
  RETURN,
  TOTAL,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  // Keep all five channels visible, even before API data loads.
  const channels = [
    { sales_channel: "TOTAL", ...(TOTAL ?? {}) },
    { sales_channel: "CASH", ...(CASH ?? {}) },
    { sales_channel: "INSURANCE", ...(INSURANCE ?? {}) },
    { sales_channel: "OTHER_ACCOUNT", ...(OTHER_ACCOUNT ?? {}) },
    { sales_channel: "RETURN", ...(RETURN ?? {}) },
  ];

  const formatAmount = (value) => Number(value ?? 0).toLocaleString("en-KE");

  const formatNumber = (value) => Number(value ?? 0).toLocaleString("en-KE");

  const getBadgeColor = (percentage) => {
    if (percentage == null || Number.isNaN(Number(percentage))) {
      return "bg-warning-subtle text-warning";
    }

    // if (percentage < 0) {
    //   return "bg-danger-subtle text-danger";
    // }

    if (percentage < 10) {
      return "bg-danger-subtle text-danger-emphasis";
    }

    if (percentage < 50) {
      return "bg-primary-subtle text-primary-emphasis";
    }
    return "bg-success-subtle text-success";
  };

  const getTotalCellStyle = (isTotal) => ({
    backgroundColor: isTotal ? "light" : undefined,
    fontWeight: isTotal ? 700 : undefined,
    whiteSpace: "nowrap",
  });

  const numericHeaders = [
    "Trans",
    "Line Items",
    "Unique Clients",
    "Units Sold",
    "Sales Excl. (KES)",
    "Tax (KES)",
    "Sales Incl. (KES)",
    "COGS (KES)",
    "GP (KES)",
    "GP Margin (%)",
    "Avg Order Value (KES)",
    "Sales Share (%)",
  ];

  // Export all five channels to Excel.
  const handleExportExcel = () => {
    const rows = channels.map((item) => ({
      "Sales Channel": item.sales_channel.replace(/_/g, " "),
      Trans: Number(item.transaction_count ?? 0),
      "Line Items": Number(item.total_line_items ?? 0),
      "Unique Clients": Number(item.unique_clients ?? 0),
      "Units Sold": Number(item.total_units_sold ?? 0),
      "Sales Excl. (KES)": Number(item.total_sales_excl ?? 0),
      "Tax (KES)": Number(item.total_tax ?? 0),
      "Sales Incl. (KES)": Number(item.total_sales_incl ?? 0),
      "COGS (KES)": Number(item.total_cogs ?? 0),
      "GP (KES)": Number(item.gross_profit ?? 0),
      "GP Margin (%)": Number(item.gross_margin_perc ?? 0),
      "Avg Order Value (KES)": Number(item.avg_order_value ?? 0),
      "Sales Share (%)": Number(item.sales_share_perc ?? 0),
    }));

    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const safeBranchName = (selectedBranchName || "All_Branches").replace(
      /[^a-z0-9_-]/gi,
      "_",
    );

    exportToExcel(
      rows,
      `Sales_Channel_Performance_${safeBranchName}_${todayStr}`,
    );
  };

  return (
    <Card className="card-height-100" id="sales-top-customers-card">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-2 gap-2">
        <div>
          <h4 className="card-title mb-1">Sales Channel Performance</h4>
          <p className="text-muted mb-0 fs-6">
            Overview of sales, profitability, and transaction activity across
            channels
          </p>
        </div>

        <CardExportButtons
          targetId="sales-channel-breakdown-card"
          title="Sales Channel Performance"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody>
        {error && (
          <div className="alert alert-danger" role="alert">
            {typeof error === "string"
              ? error
              : "Failed to load sales channel data."}
          </div>
        )}

        <div className="table-responsive table-card">
          <table className="table table-hover table-bordered align-middle table-nowrap mb-0">
            <thead className="table-light">
              <tr>
                <th
                  className="text-start"
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                    minWidth: "145px",
                    whiteSpace: "nowrap",
                    backgroundColor: "#f3f6f9",
                  }}
                >
                  Sales Channel
                </th>

                {numericHeaders.map((header) => (
                  <th
                    key={header}
                    className="text-end"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={numericHeaders.length + 1}
                    className="text-center py-4"
                  >
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                      aria-label="Loading"
                    />
                    Loading sales channel data...
                  </td>
                </tr>
              ) : (
                channels.map((item) => {
                  const isTotal = item.sales_channel === "TOTAL";
                  const totalStyle = getTotalCellStyle(isTotal);

                  return (
                    <tr
                      key={item.sales_channel}
                      className={isTotal ? "fw-bold bg-light" : ""}
                    >
                      <td
                         className={`text-start ${isTotal ? "bg-light" : "bg-white"}`}
                        style={{
                          ...totalStyle,
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                          minWidth: "145px",
                        }}
                      >
                        {item.sales_channel.replace(/_/g, " ")}
                      </td>

                      <td className="text-end" style={totalStyle}>
                        {formatNumber(item.transaction_count)}
                      </td>

                      <td className="text-end" style={totalStyle}>
                        {formatNumber(item.total_line_items)}
                      </td>

                      <td className="text-end" style={totalStyle}>
                        {formatNumber(item.unique_clients)}
                      </td>

                      <td className="text-end" style={totalStyle}>
                        {formatNumber(item.total_units_sold)}
                      </td>

                      <td className="text-end text-primary" style={totalStyle}>
                        {formatAmount(item.total_sales_excl)}
                      </td>

                      <td className="text-end" style={totalStyle}>
                        {formatAmount(item.total_tax)}
                      </td>

                      <td className="text-end text-caramel" style={totalStyle}>
                        {formatAmount(item.total_sales_incl)}
                      </td>

                      <td className="text-end" style={totalStyle}>
                        {formatAmount(item.total_cogs)}
                      </td>

                      <td className="text-end text-success" style={totalStyle}>
                        {formatAmount(item.gross_profit)}
                      </td>

                      <td className="text-end" style={totalStyle}>
                        <Badge
                          pill
                          className={getBadgeColor(
                            item.gross_margin_perc,
                          )}
                        >
                          {formatAmount(item.gross_margin_perc)}%
                        </Badge>
                      </td>

                      <td className="text-end" style={totalStyle}>
                        {formatAmount(item.avg_order_value)}
                      </td>

                      <td className="text-end" style={totalStyle}>
                        <Badge
                          pill
                          className={getBadgeColor(
                            item.sales_share_perc,
                          )}
                        >
                          {formatAmount(item.sales_share_perc)}%
                        </Badge>
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

export default Breakdown;
