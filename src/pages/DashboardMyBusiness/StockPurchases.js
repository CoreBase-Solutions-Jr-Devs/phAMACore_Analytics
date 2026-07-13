import React from 'react'
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { StockPurchasesCharts } from "./DashboardMyBusinessCharts"
const StockPurchases = () => {
    const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const series = [
  {
    name: "Stock",
    data: [50000, 70000, 60000, 80000, 75000, 90000],
  },
  {
    name: "Purchases",
    data: [40000, 65000, 55000, 70000, 68000, 85000],
  },
];
  return (
        <React.Fragment>
      <Card>
        <CardHeader className="border-0 align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">Stock vs Purchases Monthly Trend </h4>
 </CardHeader>
        <CardBody className="p-0 pb-2">
          <div className="w-100">
            <div dir="ltr">
                    <StockPurchasesCharts categories={categories} series={series}  dataColors='["--vz-primary", "--vz-success", "--vz-danger"]' />
        </div>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  )
}

export default StockPurchases
