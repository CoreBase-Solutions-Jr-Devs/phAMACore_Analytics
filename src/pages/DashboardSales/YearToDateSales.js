import React from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { ProgressiveSalesChart } from "./DashboardAnalyticsCharts";

const YearToDateSales = ({ series, categories, formatAmount }) => {
  return (
    <Row>
      <Col xxl={12}>
        <Card>
          <CardBody className="p-0">
            <CardHeader className="border-0">
              <h4 className="card-title mb-0">
                Year To Date Sales Comparative Graph (YTD)
              </h4>
            </CardHeader>
<div className="d-flex justify-content-end align-items-center gap-3 px-3 pt-2">
  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "25px",
        borderTop: "3px solid var(--vz-primary)",
      }}
    />
    <span className="text-muted">2026</span>
  </div>

  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "25px",
        borderTop: "3px dashed var(--vz-primary)",
      }}
    />
    <span className="text-muted">2025</span>
  </div>
</div>
            <ProgressiveSalesChart
              series={series}
              categories={categories}
              formatAmount={formatAmount}
dataColors='["--vz-primary","--vz-success","--vz-gray-300"]'
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default YearToDateSales;
