import React, { useState } from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

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
   const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.powerbi.filters,
);

  // Keep all five channels visible, even before API data loads.
  const channels = [
    { sales_channel: "CASH", ...CASH },
    { sales_channel: "INSURANCE", ...INSURANCE },
    { sales_channel: "OTHER_ACCOUNT", ...OTHER_ACCOUNT },
    { sales_channel: "RETURN", ...RETURN },
    { sales_channel: "TOTAL", ...TOTAL },
  ];
    const formatAmount = (value) =>
    Number(value ?? 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatNumber = (value) =>
    Number(value ?? 0).toLocaleString("en-KE");
  return (
       <React.Fragment>
              {/* <div className="mb-3">
    <h4 className="card-title mb-1">Sales Performance Overview</h4>
  
  </div> */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
    <h4 className="card-title mb-0">
      {/* Sales Performance Overview */}
      </h4>

          <div className="d-flex align-items-center gap-2 ">
            <span>Filtered From:</span>
            <strong>{startDate}</strong> to <strong>{endDate}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 ">
            <span>Selected Branch:</span>
            <strong>{selectedBranchName}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 no-print">
            {/* <button
                  type="button"
                  className="btn btn-soft-success btn-export-excel d-flex align-items-center gap-1"
                  onClick={handleExportExcel}
                  title="Export Key Metrics to Excel"
                >
                  <i className="ri-file-excel-2-line align-bottom"></i>
                  <span>Export Excel</span>
                </button> */}

            {/* <button
                  type="button"
                  className="btn btn-soft-info btn-export-print d-flex align-items-center gap-1"
                  onClick={handlePrint}
                  title="Print Dashboard"
                >
                  <i className="ri-printer-line align-bottom"></i>
                  <span>Print</span>
                </button> */}

            <button
              type="button"
              className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
              onClick={rightClickBtn}
            >
              <i className="ri-filter-fill"></i>
              Filter
            </button>
          </div>
        </div>
        <div>
 
                <Card className="card-height-100" id="sales-top-customers-card">
        <CardBody>
       

      <div className="table-responsive table-card">
        <table className="table align-middle table-nowrap mb-0">
          <thead className="table-light">
            <tr >
              <th>Sales</th>
              <th>Trans</th>
              <th>Line Items</th>
              <th>Unique Clients</th>
              <th>Units Sold</th>
              <th>Sales Excl. (KES)</th>
              <th>Tax(KES)</th>
              <th>Sales Incl.(KES)</th>
              <th>COGS(KES)</th>
              <th>GP(KES)</th>
              <th>GP Margin(%)</th>
              <th>Avg Order Value (KES)</th>
              <th>Sales Share(%)</th>
         
            </tr>
          </thead>
{loading && (
         <div
                className="spinner-border text-primary"
                role="status"
              />
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {typeof error === "string"
            ? error
            : "Failed to load sales channel data."}
        </div>
      )}
          <tbody>
            {channels.map((item) => (
              <tr
                key={item.sales_channel}
            
              >
                <td className="fw-medium">
                  {item.sales_channel.replace("_", " ")}
                </td>

                <td>{formatNumber(item.transaction_count)}</td>
                <td>{formatNumber(item.total_line_items)}</td>
                <td>{formatNumber(item.unique_clients)}</td>
                <td>{formatNumber(item.total_units_sold)}</td>
                <td>{formatAmount(item.total_sales_excl)}</td>
                <td>{formatAmount(item.total_tax)}</td>
                <td>{formatAmount(item.total_sales_incl)}</td>
                <td>{formatAmount(item.total_cogs)}</td>
                <td>{formatAmount(item.gross_profit)}</td>
                <td>{formatAmount(item.gross_margin_perc)}%</td>
                <td>{formatAmount(item.avg_order_value)}</td>
                <td>{formatAmount(item.sales_share_perc)}%</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </CardBody>
      </Card>
      </div>
      </React.Fragment>
  );
};

export default Breakdown;

