import React from 'react';
import CountUp from "react-countup";
import { Link } from 'react-router-dom';
import { Card, CardBody, Col } from 'reactstrap';
import { ecomWidgets } from "../../common/data";

const Widgets = () => {
    return (
    <React.Fragment>
  {ecomWidgets.map((item, key) => (
    <Col xl={2} lg={4} md={6} sm={6} key={key} className="d-flex">
      <Card className="card-animate w-100 h-80">
        <CardBody className="d-flex flex-column justify-content-between">

          <div className="flex-grow-1">
            <p className="text-uppercase fw-medium text-muted text-truncate mb-2">
              {item.label}
            </p>

            <h4 className="fs-22 fw-semibold ff-secondary mb-2">
              <span className="counter-value">
                <CountUp
                  start={0}
                  prefix={item.prefix}
                  suffix={item.suffix}
                  separator={item.separator}
                  end={item.counter}
                  decimals={item.decimals}
                  duration={4}
                />
              </span>
            </h4>

            <p className="text-muted mb-0 fs-12">
              {item.link}
            </p>
          </div>

        </CardBody>
      </Card>
    </Col>
  ))}
</React.Fragment>
    );
};

export default Widgets;