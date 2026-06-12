import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const getColor = (percent) => {
  if (percent >= 90) return "bg-success";
  if (percent >= 75) return "bg-caramel";
  if (percent >= 60) return "bg-info";
  if (percent >= 45) return "bg-primary";
  if (percent >= 30) return "bg-warning";
  // if (percent >= 10) return "bg-secondary";
  if (percent >= 1) return "bg-secondary";  
  if (percent <= 0) return "bg-danger";
 
};


const SalesByLocations = ({ data = [], totalSpend=0, formatAmount }) => {
const topBranch = data.length
    ? [...data].sort((a, b) => b.value - a.value)[0]
    : null;
  return (
    <Card className="card-height-100">
      <CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          Spend by branch 
        </h4>

        {/* <div className="flex-shrink-0">
          <button type="button" className="btn btn-soft-primary btn-sm">
            Export Report
          </button>
        </div> */}
      </CardHeader>

      <CardBody>
        {data.length === 0 ? (
          <div className="text-center py-5">
            <h6 className="text-muted mb-2">
            No branch data available
            </h6>
          </div>
        ) : (
          <>
            {data.map((item) => {

const percent = totalSpend
  ? (item.value / totalSpend) * 100

  : 0;
              const color = getColor(percent);

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

                <div className="progress mt-2" style={{ height: "20px" }}>
                  <div
                    className={`progress-bar progress-bar-striped ${color}`}
                    role="progressbar"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
              <hr className="my-2" />

 {topBranch && (
          <div className="d-flex flex-row align-items-center justify-content-center mb-2 gap-3">
            <p>
              Top performing branch:
              <strong> {topBranch.name}</strong>
            </p>

            <p >
              Revenue:
              <strong> KES {formatAmount(Number(topBranch.value))}</strong>
            </p>
          </div>
        )}
        </>
        )}

    
       
      </CardBody>
    </Card>
  );
};

export default SalesByLocations;