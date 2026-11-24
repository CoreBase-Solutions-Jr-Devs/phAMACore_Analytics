import React, { useState } from "react";
import { Card, CardBody, Row, Col, UncontrolledTooltip } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";
const Performance = ({
  performanceSummary,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.salesTarget.filters,
  );

  const actionInsight =
    performanceSummary?.action_insight || "No action insight available.";

  const handleExportExcel = () => {
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

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
        "Value (KES)": Number(performanceSummary?.actualSalesExcl ?? 0),
      },
      {
        Metric: "Target Sales",
        "Value (KES)": Number(performanceSummary?.targetSales ?? 0),
      },
      {
        Metric: "Achievement (%)",
        "Value (KES)": Number(performanceSummary?.achievementPct ?? 0),
      },
      {
        Metric: "Gross Profit",
        "Value (KES)": Number(performanceSummary?.grossProfit ?? 0),
      },
      {
        Metric: "Gross Margin (%)",
        "Value (KES)": Number(performanceSummary?.grossMarginPct ?? 0),
      },
      {
        Metric: "Average Basket Value",
        "Value (KES)": Number(performanceSummary?.avgBasketValue ?? 0),
      },
      {
        Metric: "Transactions",
        "Value (KES)": Number(performanceSummary?.totalTransactions ?? 0),
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
            className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-md-5 "
            id="margin-band-widgets"
          >
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80" id="netSalesInsight">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Net Sales</p>

                    <h5 className="mt-2 ff-secondary fw-semibold text-secondary">
                      KES{" "}
                      {Number(
                        performanceSummary?.actualSalesExcl ?? 0,
                      ).toLocaleString("en-KE")}
                    </h5>
                  </div>

                  <p className="mb-0 text-muted  ">
                    Target:
                    <span className="fw-semibold ms-1">
                      KES{" "}
                      {Number(
                        performanceSummary?.targetSales ?? 0,
                      ).toLocaleString("en-KE")}
                    </span>
                  </p>
                  <p className="mb-0 text-muted  ">
                    Achievement:
                    <span className="fw-semibold ms-1">
                      {Number(performanceSummary?.achievementPct ?? 0).toFixed(
                        1,
                      )}
                      %
                    </span>
                  </p>
                </CardBody>
              </Card>
              {/* <UncontrolledTooltip placement="top" target="netSalesInsight">
                {actionInsight}
              </UncontrolledTooltip> */}
            </Col>

            <Col className="d-flex">
              <Card className="card-animate w-100 h-80" id="netSalesInsight">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Gross Profit</p>

                    <h5 className="mt-2 ff-secondary fw-semibold text-warning">
                      KES{" "}
                      {Number(
                        performanceSummary?.grossProfit ?? 0,
                      ).toLocaleString("en-KE")}
                    </h5>
                  </div>

                  <div className="mb-0 mt-auto">
                    <p className="mb-0 text-muted">
                      Margin pct:
                      <span className="fw-semibold ms-1">
                        {Number(
                          performanceSummary?.grossMarginPct ?? 0,
                        ).toFixed(1)}
                        %
                      </span>
                    </p>
                    <p className="mb-0  text-muted">
                      COGS:
                      <span className="fw-semibold ms-1">
                        KES{" "}
                        {Number(
                          performanceSummary?.totalCOGS ?? 0,
                        ).toLocaleString("en-KE")}
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>
              {/* <UncontrolledTooltip placement="top" target="netSalesInsight">
                {actionInsight}
              </UncontrolledTooltip> */}
            </Col>
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80" id="netSalesInsight">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Avg Basket Value</p>

                    <h5 className="mt-2 ff-secondary fw-semibold text-success">
                      KES{" "}
                      {Number(
                        performanceSummary?.avgBasketValue ?? 0,
                      ).toLocaleString("en-KE")}
                    </h5>
                  </div>

                    <p className="mb-0 text-muted mt-auto">
                    Sales.incl:
                    <span className="fw-semibold ms-1">
                    KES{" "}
                      {Number(
                        performanceSummary?.actualSalesIncl ?? 0,
                      ).toLocaleString("en-KE")}
                    </span>
                  </p>
                </CardBody>
              </Card>
              {/* <UncontrolledTooltip placement="top" target="netSalesInsight">
                {actionInsight}
              </UncontrolledTooltip> */}
            </Col>
         
            {/* Target Performance */}
            <Col className="d-flex">
              <Card
                className="card-animate w-100 h-80"
                id="targetPerformanceCard"
              >
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Variance</p>

                    <h5 className="mt-2 ff-secondary fw-semibold text-success">
                      KES{" "}
                      {Number(performanceSummary?.variance ?? 0).toLocaleString(
                        "en-KE",
                      )}
                    </h5>
                  </div>

                  <p className="mb-0 text-muted mt-auto">
                    Gap to Target:
                    <span className="fw-semibold ms-1">
                      KES{" "}
                      {Number(
                        performanceSummary?.gapToTarget ?? 0,
                      ).toLocaleString("en-KE")}
                    </span>
                  </p>
                </CardBody>
              </Card>
            </Col>

   <Col className="d-flex">
              <Card className="card-animate w-100 h-80" id="netSalesInsight">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Transactions</p>

                    <h5 className="mt-2 ff-secondary fw-semibold text-danger">
                      {Number(performanceSummary?.totalTransactions ?? 0)}
                    </h5>
                  </div>

                  <p className="mb-0 text-muted mt-auto">
                   Branches:{" "}
                    <span className="fw-semibold mx-1">
                      {Number(
                        performanceSummary?.totalBranches ?? 0,
                      ).toLocaleString("en-KE")}
                    </span>
                   
                  </p>
                </CardBody>
              </Card>
              {/* <UncontrolledTooltip placement="top" target="netSalesInsight">
                {actionInsight}
              </UncontrolledTooltip> */}
            </Col>
            
            {/* Sales Including Tax */}
            {/* <Col className="d-flex">
              <Card className="card-animate w-100 h-80" id="salesInclCard">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Sales Incl. Tax</p>

                    <h5 className="mt-2 ff-secondary fw-semibold text-info">
                      KES{" "}
                      {Number(
                        performanceSummary?.actualSalesIncl ?? 0,
                      ).toLocaleString("en-KE")}
                    </h5>
                  </div>

                  <p className="mb-0 text-muted mt-auto">
                    Total sales including VAT
                  </p>
                </CardBody>
              </Card>
            </Col> */}
          </Row>
        )}
        {performanceSummary?.action_insight && (
          <Row className="mt-1 g-0">
            <Col xs="12">
              <div className="alert alert-info mb-0 mt-0 py-1 w-100">
                {performanceSummary.action_insight}
              </div>
            </Col>
          </Row>
        )}
      </React.Fragment>
    </div>
  );
};

export default Performance;
