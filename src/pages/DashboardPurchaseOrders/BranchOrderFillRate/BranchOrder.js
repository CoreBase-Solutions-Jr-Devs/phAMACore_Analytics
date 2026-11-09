import React from "react";
import { Card, CardBody, Row, Col, UncontrolledTooltip } from "reactstrap";
import { useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";

const BranchOrder = ({
  BranchOrderFillRateSummaryData,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { startDate, endDate } = useSelector(
    (state) => state.branchOrderFillRate.filters || {},
  );

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formatPercent = (value) => `${Number(value ?? 0).toFixed(2)}%`;
  // Excel Export
  const renderCardTooltip = (id) => (
    <UncontrolledTooltip target={id} placement="top">
      {BranchOrderFillRateSummaryData?.action_insight || "No insight available"}
    </UncontrolledTooltip>
  );

  const handleExportExcel = () => {
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const fileName = `Category_Performance_Key_Metrics_${todayStr}`;

    const metadata = [
      {
        label: "Report",
        value: "Category Performance Key Metrics",
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
        Metric: "Gross Purchases (KES, Excl. Tax)",
        Value: categoryTotals.grossPurchases,
      },
      {
        Metric: "Purchase Returns (KES, Excl. Tax)",
        Value: categoryTotals.purchaseReturns,
      },
      {
        Metric: "Net Purchases (KES, Incl. Tax)",
        Value: categoryTotals.netPurchasesIncl,
      },
      {
        Metric: "Unique Items",
        Value: categoryTotals.uniqueItems,
      },
    ];

    const sections = [
      {
        title: "Category Performance Key Metrics",
        headers: ["Metric", "Value"],
        data: rows,
      },
    ];

    exportDashboardReportToExcel(
      {
        title: "Category Performance Key Metrics Report",
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

          <div className="d-flex align-items-center gap-2">
            <span>Filtered From:</span>
            <strong>{startDate}</strong> to <strong>{endDate}</strong>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span>Selected Branch:</span>
            <strong>{selectedBranchName || "All Branches"}</strong>
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
            </button>

            <button
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

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              aria-label="Loading category metrics"
            ></div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger mb-0">{error}</p>
          </div>
        ) : (
          <Row
            className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6"
            id="branch-order-fill-rate-widgets"
          >
            {/* Backorder Value */}
            <Col className="d-flex">
              <Card
                id="backorder-card"
                className="card-animate w-100 h-80"
                style={{ cursor: "help" }}
              >
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Ordered</p>
                  <h5 className="mt-1 ff-secondary fw-semibold text-success">
                    KES{" "}
                    {formatAmount(
                      BranchOrderFillRateSummaryData.total_ordered_value_cost ??
                        0,
                    )}
                  </h5>
                  <p className="mb-0 text-muted mt-auto">
                    <span className="fw-semibold pe-1">
                      {Number(
                        BranchOrderFillRateSummaryData.total_orders_count ?? 0,
                      )}
                    </span>
                    orders,{" "}
                    <span className="fw-semibold pe-1">
                      {Number(
                        BranchOrderFillRateSummaryData.total_ordered_lines ?? 0,
                      )}
                    </span>
                    lines,{" "}
                    <span className="fw-semibold pe-1">
                      {Number(
                        BranchOrderFillRateSummaryData.total_ordered_units ?? 0,
                      )}
                    </span>
                    units
                  </p>
                </CardBody>
              </Card>
              {renderCardTooltip("ordered-card")}
            </Col>
            <Col className="d-flex">
              <Card
                id="ordered-card"
                className="card-animate w-100 h-80"
                style={{ cursor: "help" }}
              >
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Backorder Value</p>
                  <h5 className="mt-1 ff-secondary fw-semibold text-danger">
                    KES{" "}
                    {formatAmount(
                      BranchOrderFillRateSummaryData.total_backorder_value_cost ||
                        0,
                    )}
                  </h5>
                  <p className="mb-0 text-muted mt-auto">
                    <span className="fw-semibold pe-1">
                      {Number(
                        BranchOrderFillRateSummaryData.total_backorder_units ||
                          0,
                      )}
                    </span>
                    unfulfilled units
                  </p>
                </CardBody>
              </Card>
              {renderCardTooltip("ordered-card")}
            </Col>

            {/* Order Fill Rate */}
            <Col className="d-flex">
              <Card
                id="ordered-card"
                className="card-animate w-100 h-80"
                style={{ cursor: "help" }}
              >
                <CardBody className="p-1">
                  <p className="font-medium mb-1">Fill Rate</p>

                  <Row className="g-1">
                    <Col className="d-flex align-items-center justify-content-between">
                      <span className="text-muted">Order</span>
                      <p className="mb-0 ff-secondary fw-semibold text-warning">
                        {formatPercent(
                          BranchOrderFillRateSummaryData.order_fill_rate_perc,
                        )}
                      </p>
                    </Col>

                    <Col
                      xs="12"
                      className="d-flex align-items-center justify-content-between"
                    >
                      <span className="text-muted">Line</span>
                      <p className="mb-0 ff-secondary fw-semibold text-info">
                        {formatPercent(
                          BranchOrderFillRateSummaryData.line_fill_rate_perc,
                        )}
                      </p>
                    </Col>

                    <Col
                      xs="12"
                      className="d-flex align-items-center justify-content-between"
                    >
                      <span className="text-muted">Quantity</span>
                      <p className="mb-0 ff-secondary fw-semibold text-danger">
                        {formatPercent(
                          BranchOrderFillRateSummaryData.quantity_fill_rate_perc,
                        )}
                      </p>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              {renderCardTooltip("ordered-card")}
            </Col>

            {/* Average Fulfillment Time */}
            <Col className="d-flex">
              <Card
                id="ordered-card"
                className="card-animate w-100 h-80"
                style={{ cursor: "help" }}
              >
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Avg Fulfillment Time</p>
                  <h5 className="mt-1 ff-secondary fw-semibold text-warning">
                    {Number(
                      BranchOrderFillRateSummaryData.avg_fulfillment_days ?? 0,
                    ).toFixed(1)}{" "}
                    days
                  </h5>
                  <p className="mb-0 text-muted mt-auto">
                    placement to fulfillment
                  </p>
                </CardBody>
              </Card>
              {renderCardTooltip("ordered-card")}
            </Col>

            {/* Ordered */}
            {/* <Col className="d-flex">
    <Card className="card-animate w-100 h-80">
      <CardBody className="p-1 d-flex flex-column">
        <p className="font-medium mb-0">Ordered</p>
        <h5 className="mt-1 ff-secondary fw-semibold text-success">
          KES {formatAmount(
            BranchOrderFillRateSummaryData.total_ordered_value_cost ?? 0
          )}
        </h5>
        <p className="mb-0 text-muted mt-auto">
          {Number(
            BranchOrderFillRateSummaryData.total_orders_count ?? 0
          )} orders,{" "}
          {Number(
            BranchOrderFillRateSummaryData.total_ordered_lines ?? 0
          )} lines,{" "}
          {Number(
            BranchOrderFillRateSummaryData.total_ordered_units ?? 0
          )} units
        </p>
      </CardBody>
    </Card>
  </Col> */}

            <Col className="d-flex">
              <Card
                id="ordered-card"
                className="card-animate w-100 h-80"
                style={{ cursor: "help" }}
              >
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Dispatched </p>
                  <h5 className="mt-1 ff-secondary fw-semibold text-primary">
                    KES{" "}
                    {formatAmount(
                      BranchOrderFillRateSummaryData.total_dispatched_value_cost ??
                        0,
                    )}
                  </h5>
                  <p className="mb-0 text-muted mt-auto">
                    <span className="fw-semibold pe-1">
                      {Number(
                        BranchOrderFillRateSummaryData.total_dispatched_units ??
                          0,
                      )}
                    </span>
                    units
                  </p>
                </CardBody>
              </Card>
              {renderCardTooltip("ordered-card")}
            </Col>

            <Col className="d-flex">
              <Card
                id="ordered-card"
                className="card-animate w-100 h-80"
                style={{ cursor: "help" }}
              >
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Received</p>
                  <h5 className="mt-1 ff-secondary fw-semibold text-info">
                    KES{" "}
                    {formatAmount(
                      BranchOrderFillRateSummaryData.total_received_value_cost ??
                        0,
                    )}
                  </h5>
                  <p className="mb-0 text-muted mt-auto">
                    <span className="fw-semibold pe-1">
                      {Number(
                        BranchOrderFillRateSummaryData.total_received_units ??
                          0,
                      )}
                    </span>
                    units
                  </p>
                </CardBody>
              </Card>
              {renderCardTooltip("ordered-card")}
            </Col>
          </Row>
        )}
      </React.Fragment>
    </div>
  );
};

export default BranchOrder;
