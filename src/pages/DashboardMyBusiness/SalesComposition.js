import React from "react";
import {
    SalesCompositionChart,
} from "./DashboardMyBusinessCharts";
import { Card, CardHeader, CardBody } from "reactstrap";

const SalesComposition = () => {
    // Temporary test data — replace with API values
    const chartSeries = [
        250000,
        180000,
        90000,
        45000,
    ];

    return (
        <Card
            className="card-height-100"
            id="sales-branch-performance-card"
        >
            <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
                <h4 className="card-title mb-0 flex-grow-1">
                    Sales Composition
                </h4>
            </CardHeader>

            <CardBody>
                <SalesCompositionChart
                    series={chartSeries}
                />
            </CardBody>
        </Card>
    );
};

export default SalesComposition;