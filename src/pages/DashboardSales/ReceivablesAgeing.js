import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const ReceivablesAgeing = ({
  kpiOverdueAccounts = [],
  topDebtors = [],
  formatAmount,
  currentReceivables,
  overdue1To30,
  overdue31To60,
  overdue61To90,
  overdue91To120,
  overdue120Plus,
}) => {

  const hasReceivablesData =
    Number(currentReceivables ?? 0) > 0 ||
    Number(overdue1To30 ?? 0) > 0 ||
    Number(overdue31To60 ?? 0) > 0 ||
    Number(overdue61To90 ?? 0) > 0 ||
    Number(overdue91To120 ?? 0) > 0 ||
    Number(overdue120Plus ?? 0) > 0;

  return (
    <React.Fragment>
      <Card className="card-height-100">
        <CardHeader className="align-items-center d-flex border-0">
          <h4 className="card-title mb-0 flex-grow-1">
            Receivables ageing (KES '000)
          </h4>
        </CardHeader>

        <CardBody>
          {!hasReceivablesData && topDebtors.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">
                No receivables data available
              </p>
            </div>
          ) : (
            <>
              <div className="row g-2 mb-1">
                <div className="col-6 col-md-4 col-sm-6">
                  <div className="rounded-3 text-center bg-success-subtle p-2">
                    <p className="text-success fw-semibold mb-1 small">
                      <small>Current</small>
                    </p>
                    <h6 className="mb-0 text-success fw-bold">
                      {formatAmount(currentReceivables)}
                    </h6>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-sm-6">
                  <div className="rounded-3 text-center bg-primary-subtle p-2">
                    <p className="text-primary fw-semibold mb-1 small">
                      <small>1–30 days</small>
                    </p>
                    <h6 className="mb-0 text-primary fw-bold">
                      {formatAmount(overdue1To30)}
                    </h6>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-sm-6">
                  <div className="rounded-3 text-center bg-warning-subtle p-2">
                    <p className="text-warning fw-semibold mb-1 small">
                      <small>31–60 days</small>
                    </p>
                    <h6 className="mb-0 text-warning fw-bold">
                      {formatAmount(overdue31To60)}
                    </h6>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-sm-6">
                  <div className="rounded-3 text-center bg-danger-subtle p-2">
                    <p className="text-danger fw-semibold mb-1 small">
                      <small>61–90 days</small>
                    </p>
                    <h6 className="mb-0 text-danger fw-bold">
                      {formatAmount(overdue61To90)}
                    </h6>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-sm-6">
                  <div className="rounded-3 text-center bg-info-subtle p-2">
                    <p className="text-info fw-semibold mb-1 small">
                      <small>91–120 days</small>
                    </p>
                    <h6 className="mb-0 text-info fw-bold">
                      {formatAmount(overdue91To120)}
                    </h6>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-sm-6">
                  <div className="rounded-3 text-center bg-info-subtle p-2">
                    <p className="text-info fw-semibold mb-1 small">
                      <small>120+ days</small>
                    </p>
                    <h6 className="mb-0 text-info fw-bold">
                      {formatAmount(overdue120Plus)}
                    </h6>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="fw-semibold mb-2">Top debtors</h5>

                {topDebtors.length === 0 ? (
                  <div className="text-center py-4">
                    <h6 className="text-muted mb-1">
                      No debtor data available
                    </h6>
                    <small className="text-muted">
                      There are no overdue customers for the selected period.
                    </small>
                  </div>
                ) : (
                  topDebtors.map((debtor, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-center p-2 border-bottom"
                    >
                      <span className="text-muted">
                        {debtor.name}
                      </span>

                      <span className="badge bg-danger-subtle text-danger">
                        {formatAmount(debtor.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default ReceivablesAgeing;