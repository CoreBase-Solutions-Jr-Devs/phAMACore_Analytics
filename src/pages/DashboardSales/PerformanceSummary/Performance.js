import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";
const Performance = ({
//   netSales,
//   targetSales,
//   achievementPct,
//   grossProfit,
//   grossMarginPct,
//   averageBasketValue,
//   transactionCount,
//   totalBranches,
//   targetVariance,
//   targetActionInsight,
performanceSummary,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.salesTarget.filters,
  );
const handleExportExcel = () => {
    const todayStr = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    const fileName = `Performance_Key_Metrics_${todayStr}`;

    const metadata = [
      {
        label: "Report",
        value: "Performance Key Metrics",
      },
      {
        label: "Generated Date",
        value: new Date().toLocaleString("en-GB"),
      },
      {
        label: "Selected Branch",
        value: selectedBranchName || "All Branches",
      },
      {
        label: "Date Range Filter",
        value: `${startDate || ""} to ${endDate || ""}`,
      },
    ];

    const rows = [
      {
        Metric: "Net Sales",
        "Value (KES)": Number(
          performanceSummary?.actualSalesExcl ?? 0,
        ),
      },
      {
        Metric: "Target Sales",
        "Value (KES)": Number(
          performanceSummary?.targetSales ?? 0,
        ),
      },
      {
        Metric: "Achievement (%)",
        "Value (KES)": Number(
          performanceSummary?.achievementPct ?? 0,
        ),
      },
      {
        Metric: "Gross Profit",
        "Value (KES)": Number(
          performanceSummary?.grossProfit ?? 0,
        ),
      },
      {
        Metric: "Gross Margin (%)",
        "Value (KES)": Number(
          performanceSummary?.grossMarginPct ?? 0,
        ),
      },
      {
        Metric: "Average Basket Value",
        "Value (KES)": Number(
          performanceSummary?.avgBasketValue ?? 0,
        ),
      },
      {
        Metric: "Transactions",
        "Value (KES)": Number(
          performanceSummary?.totalTransactions ?? 0,
        ),
      },
    ];

    const sections = [
      {
        title: "Performance Key Metrics",
        headers: ["Metric", "Value (KES)"],
        data: rows,
      },
    ];

    exportDashboardReportToExcel(
      {
        title: "Performance Key Metrics Report",
        metadata,
        sections,
      },
      fileName,
    );
  };

  const handlePrint = () => {
    triggerPrint();
  };
  return (
    <div>
      <React.Fragment>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <h4 className="card-title mb-0">KEY METRICS</h4>

          <div className="d-flex align-items-center gap-2 ">
            <span>Filtered From:</span>
            <strong>{startDate}</strong> to <strong>{endDate}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 ">
            <span>Selected Branch:</span>
            <strong>{selectedBranchName}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 no-print">
            <button
                  type="button"
                  className="btn btn-soft-success btn-export-excel d-flex align-items-center gap-1"
                  onClick={handleExportExcel}
                  title="Export Key Metrics to Excel"
                >
                  <i className="ri-file-excel-2-line align-bottom"></i>
                  <span>Export Excel</span>
                </button>

            <button
                  type="button"
                  className="btn btn-soft-info btn-export-print d-flex align-items-center gap-1"
                  onClick={handlePrint}
                  title="Print Dashboard"
                >
                  <i className="ri-printer-line align-bottom"></i>
                  <span>Print</span>
                </button>

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
        {loading ? (
  <div className="text-center py-5">
    <div
      className="spinner-border text-primary"
      role="status"
      aria-label="Loading performance metrics"
    >
     
    </div>

   
  </div>
) : error ? (
  <div className="text-center py-5">
    <p className="text-danger mb-0">
      {error}
    </p>
  </div>
) : (
        <Row
          className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-md-4"
          id="margin-band-widgets"
        >
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Net Sales</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-secondary">
                    KES {Number(performanceSummary?.actualSalesExcl ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </h3>
                </div>

                <p className="mb-0 text-muted mt-auto ">
                  Target:
                  <span className="fw-semibold ms-1">
                    KES{" "}
                    {Number(performanceSummary?.targetSales ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </span>
                </p>
                  <p className="mb-0 text-muted mt-auto ">
                  Achievement:
                  <span className="fw-semibold ms-1">
                 {Number(performanceSummary?.achievementPct ?? 0).toFixed(1)}% 
                  </span>
                </p>
              </CardBody>
            </Card>
          </Col>

          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Gross Profit</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-warning">
                   KES {Number(performanceSummary?.grossProfit ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </h3>
                </div>

                <p className="mb-0 text-muted mt-auto">
                 {Number(performanceSummary?.grossMarginPct ?? 0).toFixed(1)}% of
                total sales
                  
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Avg Basket Value</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-danger">
                    KES {Number(performanceSummary?.avgBasketValue ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </h3>
                </div>

                <p className="mb-0 text-muted mt-auto">
                 
                </p>
              </CardBody>
            </Card>
          </Col>
            <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Transactions</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-danger">
                    {Number(performanceSummary?.totalTransactions ?? 0)}
                  </h3>
                </div>

                <p className="mb-0 text-muted mt-auto">
            
                  <span className="fw-semibold ms-1">
                  
                  </span>
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
        )}
      </React.Fragment>
    </div>
  );
};

export default Performance;
