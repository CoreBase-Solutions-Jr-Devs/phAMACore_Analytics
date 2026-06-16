import React from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import CountUp from "react-countup";

const OrderPipeline = () => {
    return (
        <React.Fragment>

            {/* SECTION TITLE */}
            <div className="mb-2">
                <h4 className="card-title mb-0 text-uppercase  text-start">
                    Order Pipeline — Today
                </h4>
            </div>

            {/* PIPELINE CARDS */}
            <Row >

                {/* RECEIVED */}
                <Col xl={3} md={6}>
                    <Card className="card-animate border-0  rounded-4">
                        <CardBody className="py-2 text-center">

                            <h2 className="mb-1 ff-secondary fw-semibold text-primary">
                                <span className="counter-value">
                                <CountUp
                                    start={0}
                                    end={318}
                                    duration={3}
                                />
                                </span>
                            </h2>

                            <p className="mb-0 text-muted fw-medium">
                                Received
                            </p>

                        </CardBody>
                    </Card>
                </Col>

                {/* PENDING DISPATCH */}
                <Col xl={3} md={6}>
                    <Card className="card-animate border-0  rounded-4">
                        <CardBody className="py-2 text-center">

                      <h2 className="mb-1 ff-secondary fw-semibold text-warning">
                                <span className="counter-value">
                                <CountUp
                                    start={0}
                                    end={84}
                                    duration={3}
                                />
                                </span>
                            </h2>

                            <p className="mb-0 text-muted fw-medium">
                                Pending Dispatch
                            </p>

                        </CardBody>
                    </Card>
                </Col>

                {/* DELIVERED */}
                <Col xl={3} md={6}>
                    <Card className="card-animate border-0  rounded-4">
                        <CardBody className="py-2 text-center">

                           <h2 className="mb-1 ff-secondary fw-semibold text-success">
                                <span className="counter-value">
                                <CountUp
                                    start={0}
                                    end={212}
                                    duration={3}
                                />
                                </span>
                            </h2>
                      

                            <p className="mb-0 text-muted fw-medium">
                                Delivered
                            </p>

                        </CardBody>
                    </Card>
                </Col>

                {/* CANCELLED */}
                <Col xl={3} md={6}>
                    <Card className="card-animate border-0  rounded-4">
                        <CardBody className="py-2 text-center">
                           <h2 className="mb-1 ff-secondary fw-semibold text-danger">
                                <span className="counter-value">
                                <CountUp
                                    start={0}
                                    end={22}
                                    duration={3}
                                />
                                </span>
                            </h2>
                            <p className="mb-0 text-muted fw-medium">
                                Cancelled / Returns
                            </p>

                        </CardBody>
                    </Card>
                </Col>

            </Row>

        </React.Fragment>
    );
};

export default OrderPipeline;