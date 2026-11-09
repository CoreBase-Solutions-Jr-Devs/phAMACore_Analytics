import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";

const SummaryCards = ({
  totalSalesIncl,
  netSales,
  totalTax,
  clientsServed,
  averageMargin,
  averageBasket,
  bestMonthName,
  bestMonthSales,

  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.salesSummary.filters,
  );

  const handleExportExcel = () => {
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const fileName = `Sales_Channel_Performance_${todayStr}`;

    const metadata = [
      {
        label: "Report",
        value: "Sales Channel Performance",
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

    const channels = [
      { name: "Total", data: TOTAL },
      { name: "Insurance", data: INSURANCE },
      { name: "Other Account", data: OTHER_ACCOUNT },
      { name: "Return", data: RETURN },
      { name: "Cash", data: CASH },
    ];

    const rows = channels.map(({ name, data }) => ({
      "Sales Channel": name,
      "Sales Incl. (KES)": Number(data?.total_sales_incl ?? 0),
      "Avg Basket (KES)": Number(data?.avg_order_value ?? 0),
    }));

    const sections = [
      {
        title: "Sales Channel Performance",
        headers: ["Sales Channel", "Sales Incl. (KES)", "Avg Basket (KES)"],
        data: rows,
      },
    ];

    exportDashboardReportToExcel(
      {
        title: "Sales Channel Performance Report",
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
              aria-label="Loading performance metrics"
            ></div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger mb-0">{error}</p>
          </div>
        ) : (
          <Row
            className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6"
            id="sales-summary-widgets"
          >
            {/* 1. Total Sales */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <p className="text-medium mb-0">Total Sales</p>
                  <h5 className="mt-2 ff-secondary fw-semibold text-secondary">
                    KES {Number(totalSalesIncl || 0).toLocaleString("en-KE")}
                  </h5>
                  <p className="mb-0 text-muted mt-auto">
Tax Inclusive                  </p>
                </CardBody>
              </Card>
            </Col>

            {/* 2. Net Sales */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <p className="text-medium mb-0">Net Sales</p>
                  <h5 className="mt-2 ff-secondary fw-semibold text-success">
                    KES {Number(netSales || 0).toLocaleString("en-KE")}
                  </h5>
                  <p className="mb-0 text-muted mt-auto">
                    After VAT of KES{" "}
                    {Number(totalTax || 0).toLocaleString("en-KE")}
                  </p>
                </CardBody>
              </Card>
            </Col>

            {/* 3. Clients Served */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <p className="text-medium mb-0">Customer Count </p>
                  <h5 className="mt-2 ff-secondary fw-semibold text-info">
                    {Number(clientsServed || 0).toLocaleString("en-KE")}
                  </h5>
                  <p className="mb-0 text-muted mt-auto">Clients Served</p>
                </CardBody>
              </Card>
            </Col>

            {/* 4. Average Margin */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <p className="text-medium mb-0">Gross Margin</p>
                  <h5 className="mt-2 ff-secondary fw-semibold text-warning">
                    {Number(averageMargin || 0).toFixed(2)}%
                  </h5>
                  <p className="mb-0 text-muted mt-auto">Profitability rate</p>
                </CardBody>
              </Card>
            </Col>

            {/* 5. Average Basket */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <p className="text-medium mb-0">Average Basket</p>
                  <h5 className="mt-2 ff-secondary fw-semibold text-primary">
                    KES{" "}
                    {Number(averageBasket || 0).toLocaleString("en-KE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h5>
                  <p className="mb-0 text-muted mt-auto">Per client served</p>
                </CardBody>
              </Card>
            </Col>

            {/* 6. Best Month */}
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                    <div>

                    </div>
                  <p className="text-medium mb-0">Best Month</p>
                  <h5 className="mt-2 ff-secondary fw-semibold text-success">
                    {bestMonthName}
                  </h5>
     <p className="mb-0 text-muted mt-auto">
                            KES {Number(bestMonthSales || 0).toLocaleString("en-KE")}{" "}
                    VAT inclusive
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

export default SummaryCards;
