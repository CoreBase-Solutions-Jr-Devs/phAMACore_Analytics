import React from "react";
import { SalesCollectionCharts } from "./DashboardMyBusinessCharts";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

const SalesCollection = () => {
  const categories = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const series = [
    {
      name: "Sales Volume",
      type: "column",
      data: [1200, 1900, 3000, 2500, 3200, 4000, 3800, 4200, 3900, 4500, 4800, 5000],
    },
    {
      name: "Collections",
      type: "column",
      data: [1000, 1500, 2500, 2000, 2800, 3600, 3400, 3900, 3700, 4200, 4600, 4700],
    },
    {
      name: "Revenue",
      type: "line",
      data: [800, 1400, 2200, 2100, 2600, 3200, 3100, 3500, 3400, 3900, 4200, 4400],
    },
  ];

  return (
       <React.Fragment>
      <Card>
        <CardHeader className="border-0 align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">Sales vs Collections Performance Trend(YTD) </h4>
 </CardHeader>
        <CardBody className="p-0 pb-2">
          <div className="w-100">
            <div dir="ltr">
      <SalesCollectionCharts
        categories={categories}
        series={series}
        dataColors='["--vz-primary", "--vz-success", "--vz-warning"]'
      />
        </div>
          </div>
   </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default SalesCollection;