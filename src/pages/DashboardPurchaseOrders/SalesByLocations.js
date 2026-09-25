import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const getColor = (percent) => {
  if (percent >= 75) return "bg-success";
  if (percent >= 50) return "bg-primary";
  if (percent >= 30) return "bg-warning";
  return "bg-danger";
};

const SalesByLocations = ({
  data = [],
  totalSpend,
  formatAmount,
}) => {
  const categoryTotal = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const topCategory = data.length
    ? [...data].sort((a, b) => b.value - a.value)[0]
    : null;

  console.log("Category data:", data);
  console.log("Category total:", categoryTotal);

  return (
     <React.Fragment>
        <Card className="card-height-100">
      <CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          Spend by Category
        </h4>
      </CardHeader>

       <CardBody >        {data.length === 0 ? (
          <div className="text-center py-5">
            <h6 className="text-muted mb-2">
              No category data available
            </h6>
          </div>
        ) : (
          <>
            {data.map((item) => {
              const percent = categoryTotal
                ? (Number(item.value) / categoryTotal) * 100
                : 0;

              const color = getColor(percent);

              console.log(
                item.name,
                "value:",
                item.value,
                "percent:",
                percent,
                "color:",
                color
              );

              return (
                <div key={item.name} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-uppercase">
                      {item.name}
                    </span>

                    <span className="text-muted">
                      {formatAmount(item.value)}
                    </span>
                  </div>

                  <div
                    className="progress mt-2"
                    style={{ height: "20px" }}
                  >
                    <div
                      className={`progress-bar progress-bar-striped ${color}`}
                      role="progressbar"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <hr className="my-2" />

            {topCategory && (
              <div className="d-flex flex-row align-items-center justify-content-center mb-2 gap-3">
                <p>
                  Top spending category:
                  <strong> {topCategory.name}</strong>
                </p>

                <p>
                  Spend:
                  <strong>
                    KES {formatAmount(Number(topCategory.value))}
                  </strong>
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

export default SalesByLocations;