import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

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
console.log("Current filters:", {
  branch,
  dateRange,
  startDate,
  endDate,
});
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
                    {Number(performanceSummary?.actualSalesExcl ?? 0).toLocaleString(
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
                 {Number(performanceSummary?.achievementPct ?? 0).toFixed(1)}% of
                total sales
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
                    {Number(performanceSummary?.grossProfit ?? 0).toLocaleString(
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
                    {Number(performanceSummary?.averageBasketValue ?? 0).toLocaleString(
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
                    {Number(performanceSummary?.transactionCount ?? 0)}
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
      </React.Fragment>
    </div>
  );
};

export default Performance;
