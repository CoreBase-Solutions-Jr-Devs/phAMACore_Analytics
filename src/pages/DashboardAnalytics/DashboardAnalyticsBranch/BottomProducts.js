import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const BottomProducts = ({ data = [], }) => {
 
  const bottomProduct = data.length
    ? [...data].sort((a, b) => a.qty - b.qty)[0]
    : null;
   
  return (
    <Card className="card-height-100">
      <CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
        Bottom Products - Units Sold   
           </h4>

      </CardHeader>

      <CardBody>

        {data.length === 0 ? (
          <div className="text-center py-5">
            {/* <h6 className="text-muted mb-2">
              No product sales data available
            </h6> */}
          </div>
        ) : (
          <>
          <div className="text-center py-5">
            <h6 className="text-muted mb-2">
              No bottom product sales data available
            </h6>
          </div>
            {/* {data.map((product, index) => {
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
                    <span className="text-uppercase">
                      {product.name}
                    </span>
                    <span className="text-muted">
                      {product.qty}
                    </span>
                  </div>

                  <div className="progress mt-2" style={{ height: "20px" }}>
                    <div
                      className={`progress-bar progress-bar-striped ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                </div>
              );
            })} */}
      
            {/* <hr className="my-2" /> */}
{/* 
            {bottomProduct && (
               <div className="d-flex flex-row align-items-center justify-content-center mb-2 gap-3">
                <p>
                   Bottom Selling Product:
                   <strong className="text-uppercase"> {bottomProduct.name}</strong>
                </p>

                <p>
               Amount Sold:
                  <strong>
                    {bottomProduct.qty} units
                  </strong>
                </p>
              </div>
            )} */}

          </>
        )}

      </CardBody>
    </Card>
  );
};

export default BottomProducts;