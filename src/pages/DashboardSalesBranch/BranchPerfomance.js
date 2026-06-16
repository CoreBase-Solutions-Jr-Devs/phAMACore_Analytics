import React from "react";
import { Card, CardHeader,CardSubtitle, CardBody } from "reactstrap";
import { BranchPerformanceChart } from "./DashboardAnalyticsCharts";

const BranchPerformance = ({
branchData = [],
    chartSeries = [],
  categories = [],
  formatAmount,
}) => {

  const topBranch = branchData.length
    ? [...branchData].sort((a, b) => b.amount - a.amount)[0]
    : null;

  return (
    <Card className="card-height-100">
<CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          Branch Performance-Revenue by Branch
        </h4>
</CardHeader>
      <CardBody >
 {chartSeries.length === 0 ? (
        <div className="text-center py-5">
          <h6 className="text-muted mb-2">
            No branch performance sales data available
          </h6>
        </div>
      ) : (
        <>
        <BranchPerformanceChart
        series={chartSeries}
  categories={categories}
  formatAmount={formatAmount}
          dataColors='[
            "--vz-success",
            "--vz-primary",
            "--vz-warning",
            "--vz-info",
            "--vz-danger"
          ]'
        />

        <hr className="my-2" />

        {topBranch && (
          <div className="d-flex flex-row align-items-center justify-content-center mb-2 gap-3">
            <p>
              Top performing branch:
              <strong> {topBranch.name}</strong>
            </p>

            <p >
              Revenue:
              <strong> KES {formatAmount(Number(topBranch.amount))}</strong>
            </p>
          </div>
        )}
 </>
      )}
      </CardBody>
    </Card>
  );
};

export default BranchPerformance;