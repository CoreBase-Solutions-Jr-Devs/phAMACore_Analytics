import React from "react";
import { Card, CardHeader, CardBody } from "reactstrap";
import { StoreVisitsCharts } from "./DashboardEcommerceCharts";

const StoreVisits = ({ data = {}, formatAmount }) => {
  const categories = data?.categories || [];
  const series = data?.series || [];
  const amounts = data?.amounts || [];

const topBranch =
  data?.categories?.length && data?.amounts?.length
    ? data.categories.reduce((top, category, index) => {
        const amount = Number(data.amounts[index] || 0);

        if (!top || amount > top.amount) {
          return {
            name: category,
            amount,
          };
        }

        return top;
      }, null)
    : null;

  return (
    <React.Fragment>
      <Card className="card-height-100"   >
        <CardHeader className="align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">
            Branch Performance - Spend by Branch
          </h4>
        </CardHeader>

        <CardBody >
          {series.length === 0 ? (
            <div className="text-center py-5">
              <h6 className="text-muted mb-2">
                No branch spend data available
              </h6>
            </div>
          ) : (
            <>
            <StoreVisitsCharts
              dataColors='[
                "--vz-primary",
                "--vz-success",
                "--vz-warning",
                "--vz-danger",
                "--vz-info",
                "--vz-secondary",
                "--vz-dark",
                "--vz-light",
                "--vz-purple",
                "--vz-pink"
              ]'
              categories={categories}
              series={series}
              amounts={amounts}
              formatAmount={formatAmount}
            />
              <hr className="my-2" />

        {topBranch && (
          <div className="d-flex flex-row align-items-center justify-content-center mb-2 gap-3">
            <p>
              Top performing branch:
              <strong> {topBranch.name}</strong>
            </p>

            <p >
              Spend:
              <strong> KES {formatAmount(Number(topBranch.amount))}</strong>
            </p>
          </div>
        )}
            </>
          )}
        
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default StoreVisits;