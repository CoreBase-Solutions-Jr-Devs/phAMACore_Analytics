import React from "react";
import { Card, CardBody, Row, Col, CardHeader, } from "reactstrap";

const AgeingCards = ({
  // overdueSupplierAccounts = [],
  currentReceivables = 0,
  overdue31To60 = 0,
  overdue61To90 = 0,
  overdue91To120 = 0,
  overdue120Plus = 0,
  loading,
  error,
}) => {
   
 const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <React.Fragment>
      
     
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
          )  : (
            <>
       <Row
  className="g-2 mb-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5"
  id="receivables-ageing-widgets"
>
  {/* Current */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">Current</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-success">
            KES {formatAmount(currentReceivables)}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">0–30 days</p>
      </CardBody>
    </Card>
  </Col>

  {/* 31–60 Days */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">31–60 Days</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-warning">
           KES {formatAmount(overdue31To60)}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">Overdue invoices</p>
      </CardBody>
    </Card>
  </Col>

  {/* 61–90 Days */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">61–90 Days</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-danger">
            KES {formatAmount(overdue61To90)}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">Overdue invoices</p>
      </CardBody>
    </Card>
  </Col>

  {/* 91–120 Days */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">91–120 Days</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-info">
             KES {formatAmount(overdue91To120)}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">Overdue invoices</p>
      </CardBody>
    </Card>
  </Col>

  {/* 120+ Days */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">120+ Days</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-danger">
             KES {formatAmount(overdue120Plus)}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">Long overdue invoices</p>
      </CardBody>
    </Card>
  </Col>
</Row>
         
                   
                     </>
                   )}
       
    </React.Fragment>
  );
};

export default AgeingCards;
