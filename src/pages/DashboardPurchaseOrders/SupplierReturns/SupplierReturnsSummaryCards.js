import React from "react";
import { Card, CardBody, Row, Col, UncontrolledTooltip } from "reactstrap";
import { useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";

const SupplierReturnsSummaryCards = ({
  SupplierReturnsSummaryData,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { startDate, endDate } = useSelector(
    (state) => state.supplierReturns.filters || {},
  );

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formatPercent = (value) => `${Number(value ?? 0).toFixed(2)}%`;
  // Excel Export
const renderCardTooltip = (id, content) => (
  <UncontrolledTooltip
    target={id}
    placement="top"
    autohide={false}
  >
    <div
      // style={{
      //   width: "250px",
      // //  maxWidth: "300px",
      //  height: "100%",
      //   padding: "2px",
      //   // whiteSpace: "normal",
      //   // textAlign: "left",
      //   // lineHeight: "1.6",
      // }}
    >
      {content}
    </div>
  </UncontrolledTooltip>
);

const summary = SupplierReturnsSummaryData || {};

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
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
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
<Col className="d-flex">
    <Card
      id="return-value-card"
      className="card-animate w-100 h-80"
      
    >
      <CardBody className="p-1 d-flex flex-column">
        <p className="font-medium mb-0">Return Value(inc)</p>

        <h5 className="mt-1 ff-secondary fw-semibold text-danger">
          KES {formatAmount(summary.total_return_value_inc ?? 0)}
        </h5>

       <div className="mb-0 mt-auto">
  <p className="text-muted mb-0">
    Tax(excl): <span className="fw-semibold">{summary.total_return_value_exc ?? 0}</span>
  </p>
  </div>
      </CardBody>
    </Card>

    {/* {renderCardTooltip(
      "return-value-card",
      `Excluding Tax: KES ${formatAmount(
        summary.total_return_value_excl ?? 0
      )}`
    )} */}
  </Col>

  <Col className="d-flex">
    <Card className="card-animate w-100 h-80">
      <CardBody className="p-1 d-flex flex-column">
        <p className="font-medium mb-0">Gross Purchases</p>

        <h5 className="mt-1 ff-secondary fw-semibold text-success">
          KES {formatAmount(summary.period_gross_purchases_exc ?? 0)}
        </h5>

        <p className="mb-0 text-muted mt-auto">
          Excluding Tax
        </p>
      </CardBody>
    </Card>
  </Col>

  <Col className="d-flex">
    <Card
      id="debit-notes-card"
      className="card-animate w-100 h-80"
     
    >
      <CardBody className="p-1 d-flex flex-column">
        <p className="font-medium mb-0">Debit Notes</p>

        <h5 className="mt-1 ff-secondary fw-semibold text-primary">
          {summary.total_debit_notes_count ?? 0}
        </h5>

      <div className="mb-0 mt-auto">
  <p className="text-muted mb-0">
    Line items: <span className="fw-semibold">{summary.total_line_items_returned ?? 0}</span>
  </p>

  <p className="text-muted mb-0">
    Distinct SKUs:{" "}
    <span className="fw-semibold">
      {formatPercent(summary.distinct_skus_returned)}
    </span>
  </p>
</div>
      </CardBody>
    </Card>

    {/* {renderCardTooltip(
      "debit-notes-card",
      `${summary.total_line_items_returned ?? 0} line items | ${
        summary.distinct_skus_returned ?? 0
      } distinct SKUs`
    )} */}
  </Col>

  {/* 2. Suppliers Affected */}
  <Col className="d-flex">
    <Card className="card-animate w-100 h-80">
      <CardBody className="p-1 d-flex flex-column">
        <p className="font-medium mb-0">Suppliers Affected</p>

        <h5 className="mt-1 ff-secondary fw-semibold text-warning">
          {summary.active_suppliers_affected ?? 0}
        </h5>

        <p className="mb-0 text-muted mt-auto">
          Suppliers with Returns
        </p>
      </CardBody>
    </Card>
  </Col>

  {/* 3. Units Returned */}
  <Col className="d-flex">
    <Card className="card-animate w-100 h-80">
      <CardBody className="p-1 d-flex flex-column">
        <p className="font-medium mb-0">Units Returned</p>

        <h5 className="mt-1 ff-secondary fw-semibold text-info">
          {formatAmount(summary.total_units_returned ?? 0)}
        </h5>

        <p className="mb-0 text-muted mt-auto">
          Quantity Returned
        </p>
      </CardBody>
    </Card>
  </Col>

  <Col className="d-flex">
    <Card
      id="supplier-return-rate-card"
      className="card-animate w-100 h-80"
      
    >
      <CardBody className="p-1 d-flex flex-column">
        <p className="font-medium mb-0">Supplier Return Rate</p>

        <h5 className="mt-1 ff-secondary fw-semibold text-danger">
          {formatPercent(summary.supplier_return_rate_perc ?? 0)}
        </h5>

        <p className="mb-0 text-muted mt-auto">
         Supplier Performance
        </p>
      </CardBody>
    </Card>

    {/* {renderCardTooltip(
      "supplier-return-rate-card",
      summary.action_insight || "Supplier return rate is above the 3.0% benchmark."
    )} */}
  </Col>

</Row>

        )}
        {summary.action_insight && (
  <Row className="mt-1 g-0">
    <Col xs="12">
      <div className="alert alert-info mb-0 mt-0 py-1 w-100">
        {summary.action_insight}
      </div>
    </Col>
  </Row>
)}
      </React.Fragment>
    </div>
  );
};

export default SupplierReturnsSummaryCards;
