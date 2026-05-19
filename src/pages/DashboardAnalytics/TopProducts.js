import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const TopProducts = ({ data = [] }) => {
  return (
    <Card className="card-height-100">
      <CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          Top Products - Units Sold
        </h4>
      </CardHeader>

      <CardBody>
        {data.length === 0 ? (
    <div className="text-center py-5">
              <h6 className="text-muted mb-2">
                No product sales data available
              </h6>
            
            </div>
              
                        ) : (
          data.map((product, index) => {
            const max = data[0]?.qty || 1;
            const percentage = (product.qty / max) * 100;
 const barColor =
      percentage >= 80
        ? "bg-primary"
        : percentage >= 60
        ? "bg-success"
        : percentage >= 40
        ? "bg-warning"
        : "bg-danger";
            return (
              <div key={index} className="mb-3">

                <div className="d-flex justify-content-between">
                  <strong>{product.name}</strong>
                  <span>{product.qty}</span>
                </div>

                <div className="progress mt-2" style={{ height: "20px" }}>
                  <div
                    className={`progress-bar ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );
};

export default TopProducts;