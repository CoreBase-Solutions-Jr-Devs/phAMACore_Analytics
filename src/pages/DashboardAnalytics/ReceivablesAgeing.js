import React from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

const ReceivablesAgeing = () => {
    return (
        <React.Fragment>

                
             <Card className="card-height-100 border-0 shadow-sm">

  <CardHeader className="align-items-center d-flex border-0">

    <h4 className="card-title mb-0 flex-grow-1">
      Receivables ageing (KES '000)
    </h4>

  </CardHeader>

  <CardBody>

                    {/* Summary Cards */}
                    <div className="row g-3 mb-2">

                        <div className="col-6 col-md-3 col-sm-6">
                            <div className="rounded-3 p-3 text-center bg-success-subtle">
                                <p className="text-success fw-semibold mb-1 small">
                                  <small>Current</small>
                                </p>

                                <h4 className="mb-0 text-success fw-bold">
                                    {/* 2,840 */}
                                </h4>
                            </div>
                        </div>

                        <div className="col-6 col-md-3 col-sm-6">
                            <div className="rounded-3 p-3 text-center bg-primary-subtle">
                                <p className="text-primary fw-semibold mb-1 small">
                                   <small>1–30 days</small>
                                </p>

                                <h4 className="mb-0 text-primary fw-bold">
                                    {/* 1,920 */}
                                </h4>
                            </div>
                        </div>

                        <div className="col-6 col-md-3 col-sm-6">
                            <div className="rounded-3 p-3 text-center bg-warning-subtle">
                                <p className="text-warning fw-semibold mb-1 small">
                                 <small>31–60 days</small> 
                                </p>

                                <h4 className="mb-0 text-warning fw-bold">
                                    {/* 2,110 */}
                                </h4>
                            </div>
                        </div>

                        <div className="col-6 col-md-3 col-sm-6">
                            <div className="rounded-3 p-3 text-center bg-danger-subtle">
                                <p className="text-danger fw-semibold mb-1 small">
                                 <small>60+ days</small>
                                </p>

                                <h4 className="mb-0 text-danger fw-bold">
                                    {/* 1,530 */}
                                </h4>
                            </div>
                        </div>

                    </div>

                    {/* Top Debtors */}
                    <div className="mt-4">

                        <h5 className="fw-semibold  mb-3">
                            Top debtors
                        </h5>

                        {/* <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <span className="text-muted">
                                Pharma Plus Nrb
                            </span>

                            <span className="badge bg-danger-subtle text-danger px-3 py-2">
                                KES 480K
                            </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <span className="text-muted">
                                MedCare Mombasa
                            </span>

                            <span className="badge bg-warning-subtle text-warning px-3 py-2">
                                KES 312K
                            </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center py-2">
                            <span className="text-muted">
                                Rift Valley Disp.
                            </span>

                            <span className="badge bg-primary-subtle text-primary px-3 py-2">
                                KES 267K
                            </span>
                        </div> */}

                    </div>

                </CardBody>
            </Card>

        </React.Fragment>
    );
};

export default ReceivablesAgeing;