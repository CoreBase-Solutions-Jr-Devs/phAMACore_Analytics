import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const BestPrices = ({
  bestPricePerSupplier = [],
}) => {
  return (
    <React.Fragment>
      <Card className="card-height-100">
        <CardHeader className="card-header align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">
            Best Price Per Supplier
          </h4>
        </CardHeader>

        <CardBody>
          {bestPricePerSupplier.length === 0 ? (
            <div className="text-center py-4">
              <h6 className="text-muted mb-1">
                No best price data available
              </h6>
            </div>
          ) : (
            <div className="table-responsive table-card">
              <table className="table table-borderless table-centered table-nowrap mb-0">
                <thead className="text-muted table-light">
                  <tr>
                    <th>Supplier</th>
                    <th>Spend(KES)</th>
                  </tr>
                </thead>

                <tbody>
                  {bestPricePerSupplier.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-medium">
                          {item.supplierName}
                        </div>
                      </td>

                      <td>
                      
                        {Number(
                          item.totalSpend || 0
                        ).toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default BestPrices;
