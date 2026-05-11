import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import CountUp from "react-countup";

//Import Icons
import FeatherIcon from "feather-icons-react";

const Widget = () => {
    return (
       <React.Fragment>
  <div className="mb-3">
        <h4 className="card-title mb-0 text-start ">
            KEY METRICS - TODAY
        </h4>
    </div>
    <Row>
        <Col xl={3} md={6}>
            <Card className="card-animate">

      
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="fw-medium text-muted mb-0">Total Revenue</p>
                            <h2 className="mt-4 ff-secondary fw-semibold text-success">
                                <span className="counter-value">
                                    <CountUp
                                        start={0}
                                        end={4.2}
                                        decimals={1}
                                        duration={3}
                                    />
                                </span>M
                            </h2>
                            <p className="mb-0 text-success">
                                <i className="ri-arrow-up-line align-middle"></i> 11% vs yesterday
                            </p>
                        </div>

                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-success-subtle rounded-circle fs-2">
                                <FeatherIcon icon="dollar-sign" className="text-success" />
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>

        <Col xl={3} md={6}>
            <Card className="card-animate">
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="fw-medium text-muted mb-0">Cash Sales</p>
                            <h2 className="mt-4 ff-secondary fw-semibold text-success">
                                <span className="counter-value">
                                    <CountUp
                                        start={0}
                                        end={2.6}
                                        decimals={1}
                                        duration={3}
                                    />
                                </span>M
                            </h2>
                            <p className="mb-0 text-muted">62% of total</p>
                        </div>

                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-success-subtle rounded-circle fs-2">
                                <FeatherIcon icon="shopping-cart" className="text-success" />
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>

        <Col xl={3} md={6}>
            <Card className="card-animate">
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="fw-medium text-muted mb-0">Credit Sales</p>
                            <h2 className="mt-4 ff-secondary fw-semibold text-info">
                                <span className="counter-value">
                                    <CountUp
                                        start={0}
                                        end={1.6}
                                        decimals={1}
                                        duration={3}
                                    />
                                </span>M
                            </h2>
                            <p className="mb-0 text-muted">38% of total</p>
                        </div>

                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                <FeatherIcon icon="credit-card" className="text-info" />
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>

        <Col xl={3} md={6}>
            <Card className="card-animate">
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="fw-medium text-muted mb-0">Collections</p>
                            <h2 className="mt-4 ff-secondary fw-semibold text-warning">
                                <span className="counter-value">
                                    <CountUp
                                        start={0}
                                        end={1.1}
                                        decimals={1}
                                        duration={3}
                                    />
                                </span>M
                            </h2>
                            <p className="mb-0 text-warning">68% collection rate</p>
                        </div>

                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-warning-subtle rounded-circle fs-2">
                                <FeatherIcon icon="briefcase" className="text-warning" />
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>
    </Row>

    {/* Bottom Row */}
    <Row>
        <Col xl={3} md={6}>
            <Card className="card-animate">
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="fw-medium text-muted mb-0">Outstanding</p>
                            <h2 className="mt-4 ff-secondary fw-semibold text-danger">
                                <span className="counter-value">
                                    <CountUp
                                        start={0}
                                        end={8.4}
                                        decimals={1}
                                        duration={3}
                                    />
                                </span>M
                            </h2>
                            <p className="mb-0 text-muted">Total receivables</p>
                        </div>

                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-danger-subtle rounded-circle fs-2">
                                <FeatherIcon icon="alert-circle" className="text-danger" />
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>

        <Col xl={3} md={6}>
            <Card className="card-animate">
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="fw-medium text-muted mb-0">Active Customers</p>
                            <h2 className="mt-4 ff-secondary fw-semibold text-primary">
                                <span className="counter-value">
                                    <CountUp
                                        start={0}
                                        end={214}
                                        duration={3}
                                    />
                                </span>
                            </h2>
                            <p className="mb-0 text-muted">Served today</p>
                        </div>

                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-primary-subtle rounded-circle fs-2">
                                <FeatherIcon icon="users" className="text-primary" />
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>

        <Col xl={3} md={6}>
            <Card className="card-animate">
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="fw-medium text-muted mb-0">Orders Placed</p>
                            <h2 className="mt-4 ff-secondary fw-semibold text-success">
                                <span className="counter-value">
                                    <CountUp
                                        start={0}
                                        end={318}
                                        duration={3}
                                    />
                                </span>
                            </h2>
                            <p className="mb-0 text-success">
                                <i className="ri-arrow-up-line align-middle"></i> +24 vs avg
                            </p>
                        </div>

                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-success-subtle rounded-circle fs-2">
                                <FeatherIcon icon="package" className="text-success" />
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>

        <Col xl={3} md={6}>
            <Card className="card-animate">
                <CardBody>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="fw-medium text-muted mb-0">Overdue Accounts</p>
                            <h2 className="mt-4 ff-secondary fw-semibold text-danger">
                                <span className="counter-value">
                                    <CountUp
                                        start={0}
                                        end={37}
                                        duration={3}
                                    />
                                </span>
                            </h2>
                            <p className="mb-0 text-muted">90+ days</p>
                        </div>

                        <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-danger-subtle rounded-circle fs-2">
                                <FeatherIcon icon="clock" className="text-danger" />
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>
    </Row>
</React.Fragment>
    );
};

export default Widget;