import React from "react";
import { Card, CardBody, Row, Col, UncontrolledTooltip } from "reactstrap";
import { useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";

const SupplierOrder = ({
  SupplierOrderFillRateSummaryData,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { startDate, endDate } = useSelector(
    (state) => state.supplierOrderFillRate.filters || {},
  );

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formatPercent = (value) => `${Number(value ?? 0).toFixed(2)}%`;
  // Excel Export
  const renderCardTooltip = (id, content) => (
    <UncontrolledTooltip target={id} placement="top">
      {content}
    </UncontrolledTooltip>
  );

  const summary = SupplierOrderFillRateSummaryData || {};

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
          <Row className="g-2 mb-0 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6">
            {/* 1. POs Issued */}
            <Col className="d-flex">
              <Card
                id="pos-issued-card"
                className="card-animate w-100 h-80"
              
              >
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">POs Issued</p>

                  <h5 className="mt-1 ff-secondary fw-semibold text-primary">
                    {summary.total_pos_issued ?? 0}
                  </h5>
                  <div className="mb-0 mt-auto">
                    <p className="text-muted mb-0">
                      Active supp:{" "}
                      <span className="fw-semibold">
                        {summary.active_suppliers_count ?? 0}
                      </span>
                    </p>
                    <p className="text-muted mb-0">
                      Outstanding:{" "}
                      <span className="fw-semibold">
                        {summary.outstanding_pos_count ?? 0}
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* {renderCardTooltip(
      "pos-issued-card",
      `${summary.active_suppliers_count ?? 0} active suppliers`
    )} */}
            </Col>

            {/* 2. Order Fill Rate */}
            <Col className="d-flex">
              <Card
                id="order-fill-rate-card"
                className="card-animate w-100 h-80"
                
              >
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Order Fill Rate</p>

                  <h5 className="mt-1 ff-secondary fw-semibold text-warning">
                    {formatPercent(summary.order_fill_rate_perc)}
                  </h5>

                  <div className="mb-0 mt-auto">
                    <p className="text-muted mb-0">
                      Fulfilled:{" "}
                      <span className="fw-semibold">
                        {summary.fulfilled_pos_count ?? 0}
                      </span>
                    </p>
                    <p className="text-muted mb-0">
                      Partial:{" "}
                      <span className="fw-semibold">
                        {summary.partial_pos_count ?? 0}
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* {renderCardTooltip(
      "order-fill-rate-card",
      `Fulfilled: ${summary.fulfilled_pos_count ?? 0} | Partial: ${summary.partial_pos_count ?? 0} | Outstanding: ${summary.outstanding_pos_count ?? 0}`
    )} */}
            </Col>

            {/* 3. Value Fill Rate */}
            <Col className="d-flex">
              <Card
                id="value-fill-rate-card"
                className="card-animate w-100 h-80"
              >
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Value Fill Rate</p>

                  <h5 className="mt-1 ff-secondary fw-semibold text-info">
                    {formatPercent(summary.value_fill_rate_perc)}
                  </h5>

                  <div className="mb-0 mt-auto">
                    <p className="text-muted mb-0">
                      Ordered:{" "}
                      <span className="fw-semibold">
                        KES {formatAmount(summary.total_ordered_value_kes)}
                      </span>
                    </p>
                    <p className="text-muted mb-0">
                      Received:{" "}
                      <span className="fw-semibold">
                        KES {formatAmount(summary.total_received_value_kes)}
                      </span>
                    </p>
                    {/* <p className="text-muted mb-0">
    Outstanding: <span className="fw-semibold">{summary.outstanding_pos_count ?? 0}</span>
  </p> */}
                  </div>
                </CardBody>
              </Card>

              {/* {renderCardTooltip(
      "value-fill-rate-card",
      `Ordered: KES ${formatAmount(summary.total_ordered_value_kes)} | Received: KES ${formatAmount(summary.total_received_value_kes)}`
    )} */}
            </Col>

            {/* 4. Backorder Value */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Backorder Value</p>

                  <h5 className="mt-1 ff-secondary fw-semibold text-danger">
                    KES {formatAmount(summary.total_backorder_value_kes)}
                  </h5>

                  <p className="mb-0 text-muted mt-auto">Pending value</p>
                </CardBody>
              </Card>
            </Col>

            {/* 5. Average Delivery Lead */}
            <Col className="d-flex">
              <Card id="delivery-lead-card" className="card-animate w-100 h-80">
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Avg Delivery Lead</p>

                  <h5 className="mt-1 ff-secondary fw-semibold text-success">
                    {Number(summary.avg_delivery_lead_days ?? 0).toFixed(1)}{" "}
                    days
                  </h5>

                  <div className="mb-0 mt-auto">
                    <p className="text-muted mb-0">
                      Min Days:{" "}
                      <span className="fw-semibold">
                        KES {formatAmount(summary.min_delivery_lead_days)}
                      </span>
                    </p>
                    <p className="text-muted mb-0">
                      Max Days:{" "}
                      <span className="fw-semibold">
                        KES {formatAmount(summary.max_delivery_lead_days)}
                      </span>
                    </p>
                    {/* <p className="text-muted mb-0">
On_Time Del:  <span className="fw-semibold">KES {formatPercent(summary.on_time_delivery_rate_perc)}</span>
 </p> */}
                    {/* <p className="text-muted mb-0">
    Outstanding: <span className="fw-semibold">{summary.outstanding_pos_count ?? 0}</span>
  </p> */}
                  </div>
                </CardBody>
              </Card>

              {/* {renderCardTooltip(
      "delivery-lead-card",
      `Minimum: ${summary.min_delivery_lead_days ?? 0} days | Maximum: ${summary.max_delivery_lead_days ?? 0} days | On-time delivery: ${formatPercent(summary.on_time_delivery_rate_perc)}`
    )} */}
            </Col>

            {/* 6. Average Outstanding */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-1 d-flex flex-column">
                  <p className="font-medium mb-0">Avg Outstanding</p>

                  <h5 className="mt-1 ff-secondary fw-semibold text-danger">
                    {Number(summary.avg_outstanding_days ?? 0).toFixed(1)} days
                  </h5>

                  <div className="mb-0 mt-auto">
                    <p className="text-muted mb-0">
                      On_Time Del:{" "}
                      <span className="fw-semibold">
                        KES {formatPercent(summary.on_time_delivery_rate_perc)}
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
        {summary.action_insight && (
          <Row className="mt-1">
            <Col xs="12">
              <div className="alert alert-info mb-0 py-1 w-100">
                {summary.action_insight}
              </div>
            </Col>
          </Row>
        )}
      </React.Fragment>
    </div>
  );
};

export default SupplierOrder;
