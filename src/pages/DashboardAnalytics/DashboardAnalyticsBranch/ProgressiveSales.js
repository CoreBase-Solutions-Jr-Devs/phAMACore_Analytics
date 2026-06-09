import React from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { ProgressiveSalesChart } from "./DashboardAnalyticsCharts";

const ProgressiveSales = ({ series, categories, formatAmount }) => {
  return (
    <Row>
      <Col xxl={12}>
        <Card>
          <CardBody className="p-0">
            <CardHeader className="border-0">
              <h4 className="card-title mb-0">
                Year To Date Sales Performance Trend(YTD)
              </h4>
            </CardHeader>

            <ProgressiveSalesChart
              series={series}
              categories={categories}
              formatAmount={formatAmount}
              dataColors='["--vz-primary","--vz-success"]'
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ProgressiveSales;
