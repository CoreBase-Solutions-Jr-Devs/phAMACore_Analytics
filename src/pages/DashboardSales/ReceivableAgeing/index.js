import React from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import ReceivablesAgeingTable from "./ReceivableTable";

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
  error,
  loading,
}) => {
  const hasReceivablesData =
    Number(currentReceivables ?? 0) > 0 ||
    Number(overdue1To30 ?? 0) > 0 ||
    Number(overdue31To60 ?? 0) > 0 ||
    Number(overdue61To90 ?? 0) > 0 ||
    Number(overdue91To120 ?? 0) > 0 ||
    Number(overdue120Plus ?? 0) > 0;

  const handleExportExcel = () => {
    const rows = [
      {
        Category: "Aging Summary",
        "Item / Customer": "Current (0–30 days)",
        "Amount (KES)": Number(currentReceivables ?? 0),
      },
      {
        Category: "Aging Summary",
        "Item / Customer": "31–60 days",
        "Amount (KES)": Number(overdue31To60 ?? 0),
      },
      {
        Category: "Aging Summary",
        "Item / Customer": "61–90 days",
        "Amount (KES)": Number(overdue61To90 ?? 0),
      },
      {
        Category: "Aging Summary",
        "Item / Customer": "91–120 days",
        "Amount (KES)": Number(overdue91To120 ?? 0),
      },
      {
        Category: "Aging Summary",
        "Item / Customer": "120+ days",
        "Amount (KES)": Number(overdue120Plus ?? 0),
      },
      ...(topDebtors ?? []).map((debtor) => ({
        Category: "Top Debtor",
        "Item / Customer": debtor.name || "",
        "Amount (KES)": Number(debtor.amount ?? 0),
      })),
    ];

    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    exportToExcel(rows, `Receivables_Ageing_Sales_${todayStr}`);
  };

  return (
    <React.Fragment>
      <Card className="card-height-100" id="sales-receivables-ageing-card">
        <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
          <h4 className="card-title mb-0 flex-grow-1">
            Receivables ageing (KES '000)
          </h4>
          <CardExportButtons
            targetId="sales-receivables-ageing-card"
            title="Receivables Ageing"
            onExport={handleExportExcel}
          />
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
              ></div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <h6 className="text-danger mb-2">{error} </h6>
            </div>
          ) : !hasReceivablesData && topDebtors.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">No receivables data available</p>
            </div>
          ) : (
            <>
              <Row
                className="g-2 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 mb-2"
                id="receivables-ageing-widgets"
              >
                <Col className="d-flex">
                  <Card className="card-animate w-100 mb-0 shadow-sm">
                    <CardBody className="p-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="ri-checkbox-circle-line text-success fs-5"></i>
                        <p className="font-medium text-muted mb-0 small">
                          Current
                        </p>
                      </div>
                      <h6 className="mb-0 fw-semibold text-success">
                        {" "}
                        {/* {Number(currentReceivables ?? 0).toLocaleString(
                          "en-KE",
                        )} */}
                        0
                      </h6>
                    </CardBody>
                  </Card>
                </Col>

                <Col className="d-flex">
                  <Card className="card-animate w-100 mb-0 shadow-sm">
                    <CardBody className="p-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="ri-time-line text-warning fs-5"></i>
                        <p className="font-medium text-muted mb-0 small">
                          31–60 Days
                        </p>
                      </div>
                      <h6 className="mb-0 fw-semibold text-warning">
                        {/* KES {Number(overdue31To60 ?? 0).toLocaleString("en-KE")} */}
                        0
                      </h6>
                    </CardBody>
                  </Card>
                </Col>

                <Col className="d-flex">
                  <Card className="card-animate w-100 mb-0 shadow-sm">
                    <CardBody className="p-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="ri-alert-line text-danger fs-5"></i>
                        <p className="font-medium text-muted mb-0 small">
                          61–90 Days
                        </p>
                      </div>
                      <h6 className="mb-0 fw-semibold text-danger">
                        0
                      </h6>
                    </CardBody>
                  </Card>
                </Col>

                <Col className="d-flex">
                  <Card className="card-animate w-100 mb-0 shadow-sm">
                    <CardBody className="p-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="ri-error-warning-line text-info fs-5"></i>
                        <p className="font-medium text-muted mb-0 small">
                          91–120 Days
                        </p>
                      </div>
                      <h6 className="mb-0 fw-semibold text-info">
                       {" "}
                        {/* {Number(overdue91To120 ?? 0).toLocaleString("en-KE")} */}
                        0
                      </h6>
                    </CardBody>
                  </Card>
                </Col>

                <Col className="d-flex">
                  <Card className="card-animate w-100 mb-0 shadow-sm">
                    <CardBody className="p-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="ri-alarm-warning-line text-danger fs-5"></i>
                        <p className="font-medium text-muted mb-0 small">
                          120+ Days
                        </p>
                      </div>
                      <h6 className="mb-0 fw-semibold text-danger">
                        {" "}
                        {/* {Number(overdue120Plus ?? 0).toLocaleString("en-KE")} */}
                        0
                      </h6>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <div>
                <ReceivablesAgeingTable
                  data={kpiOverdueAccounts}
                  loading={loading}
                  error={error}
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default ReceivablesAgeing;
