import React from "react";
import { RevenueExpensesChart } from "./DashboardMyBusinessCharts";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";

const RevenueExpenses = () => {
  const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const series = [
    {
      name: "Revenue",
      data: [120000, 150000, 180000, 140000, 200000, 220000],
    },
    {
      name: "Expenses",
      data: [80000, 90000, 100000, 95000, 110000, 130000],
    },
  ];

  return (
   <Row>
      <Col xxl={12}>
        <Card>
          <CardBody className="p-0">
            <CardHeader className="border-0">
              <h4 className="card-title mb-0">
                Revenue vs Expense Monthly Trend
              </h4>
            </CardHeader>
      <RevenueExpensesChart
        series={series}
        categories={categories}
        dataColors='["--vz-primary","--vz-danger"]'
      />
          </CardBody>
          </Card>
        </Col>
      </Row>
  );
};

export default RevenueExpenses;