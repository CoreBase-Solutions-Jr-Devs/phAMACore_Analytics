
import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";

const Category = ({
  categoryTotals,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { startDate, endDate } = useSelector(
    (state) => state.categorySpend.filters || {}
  );



  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Excel Export
  const handleExportExcel = () => {
    const todayStr = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

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
      fileName
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
              aria-label="Loading category metrics"
            ></div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger mb-0">{error}</p>
          </div>
        ) : (
          <Row
            className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4"
            id="category-performance-widgets"
          >
            {/* Gross Purchases */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">
                      Gross Purchases
                    </p>

                    <h3 className="mt-2 ff-secondary fw-semibold text-secondary">
                      KES {formatAmount(categoryTotals.grossPurchases)}
                    </h3>

                    <p className="mb-0 text-muted mt-auto">
                      Including Tax
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Purchase Returns */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">
                      Purchase Returns
                    </p>

                    <h3 className="mt-2 ff-secondary fw-semibold text-warning">
                      KES {formatAmount(categoryTotals.purchaseReturns)}
                    </h3>

                    <p className="mb-0 text-muted mt-auto">
                      Excluding Tax
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Net Purchases */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">
                      Net Purchases
                    </p>

                    <h3 className="mt-2 ff-secondary fw-semibold text-success">
                      KES {formatAmount(categoryTotals.netPurchasesIncl)}
                    </h3>

                    <p className="mb-0 text-muted mt-auto">
                      Including Tax
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Unique Items */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">
                      Unique Items
                    </p>

                    <h3 className="mt-2 ff-secondary fw-semibold text-danger">
                      {Number(categoryTotals.uniqueItems).toLocaleString("en-KE")}
                    </h3>

                    <p className="mb-0 text-muted mt-auto">
                      Distinct purchased items
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </React.Fragment>
    </div>
  );
};

export default Category;
