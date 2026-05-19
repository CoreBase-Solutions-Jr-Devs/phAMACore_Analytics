import React from 'react';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
// import Vector from './VectorMap';
import { VectorMap } from '@south-paw/react-vector-maps'
import world from '../../common/world.svg.json';

const BranchPerformance = ({
  sales = [],
  totalRevenue = 0,
  branchData = []
}) => {   
  const hasData = Array.isArray(branchData) && branchData.length > 0;
     return (
        <React.Fragment>
          
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Branch Performance vs target</h4>
                        {/* <div className="flex-shrink-0">
                            <button type="button" className="btn btn-soft-primary btn-sm">
                                Export Report
                            </button>
                        </div> */}
                    </CardHeader>

                    <CardBody>
{!hasData ? (

        
            <div className="text-center py-5">
              <h5 className="text-muted mb-2">
                No branch performance data available
              </h5>

              <p className="text-muted mb-0 small">
                Try changing the  date range.
              </p>
            </div>

          ) : (

            <>
              <div className="px-2 mt-1">
                {branchData.map((branch, index) => {

                  const percentage =
                    totalRevenue > 0
                      ? (branch.amount / totalRevenue) * 100
                      : 0;

                  const barColor =
                    percentage >= 80
                      ? "bg-success"
                      : percentage >= 60
                      ? "bg-primary"
                      : percentage >= 40
                      ? "bg-warning"
                      : "bg-danger";

                  return (
                    <div key={index} className="mb-3">

                      <p className="mb-1">
                        {branch.name}

                        <span className="float-end fw-semibold">
                          {percentage.toFixed(1)}%
                        </span>
                      </p>

                      <div
                        className="progress mt-2 position-relative"
                        style={{ height: "20px" }}
                      >

                        <div
                          className="position-absolute top-0 bottom-0 border-start border-2 border-light"
                          style={{ left: "80%", zIndex: 2 }}
                        ></div>

                        <div
                          className={`progress-bar progress-bar-striped ${barColor}`}
                          role="progressbar"
                          style={{ width: `${percentage}%` }}
                        >
                          {Number(branch.amount || 0).toLocaleString()}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

              {/* <hr className="my-3" />

              <div className="d-flex justify-content-between align-items-center">
                <p className="mb-0 text-muted small">
                  Vertical line = 80% target threshold
                </p>
              </div> */}
            </>

          )}
                    </CardBody>
                </Card>
        
        </React.Fragment>
    );
};

export default BranchPerformance;