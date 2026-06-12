import React from 'react';
import { Row, Col, Card, CardBody } from "reactstrap";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";

const kpis = [
    {
        title: "Receivables",
        value: 1250000,
        prefix: "KES ",
        suffix: "",
        icon: "credit-card",
        color: "success",
        subtitle: "Outstanding customer balances"
    },
    {
        title: "Payables",
        value: 840000,
        prefix: "KES ",
        suffix: "",
        icon: "shopping-bag",
        color: "danger",
        subtitle: "Outstanding supplier balances"
    },
    {
        title: "Sales",
        value: 5680000,
        prefix: "KES ",
        suffix: "",
        icon: "trending-up",
        color: "primary",
        subtitle: "Current month sales"
    },
    {
        title: "Stock Profits",
        value: 1320000,
        prefix: "KES ",
        suffix: "",
        icon: "package",
        color: "warning",
        subtitle: "Estimated gross stock profit"
    },
    {
        title: "Ageing",
        value: 187,
        prefix: "",
        suffix: "",
        icon: "clock",
        color: "info",
        subtitle: "Invoices over 90 days"
    },
    {
        title: "Cash Available",
        value: 2450000,
        prefix: "KES ",
        suffix: "",
        icon: "dollar-sign",
        color: "success",
        subtitle: "Available cash position"
    }
];

export default function Widgets() {
    return (
        <Row>
            {kpis.map((item, index) => (
                <Col xl={4} md={6} key={index}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="text-uppercase fw-medium text-muted mb-2">
                                        {item.title}
                                    </p>

                                    <h2 className={`fw-semibold text-${item.color}`}>
                                        {item.prefix}
                                        <CountUp
                                            end={item.value}
                                            separator=","
                                        />
                                        {item.suffix}
                                    </h2>
                                </div>

                                <div className="avatar-sm flex-shrink-0">
                                    <span
                                        className={`avatar-title rounded-circle fs-2 bg-${item.color}-subtle text-${item.color}`}
                                    >
                                        <FeatherIcon
                                            icon={item.icon}
                                            size={24}
                                        />
                                    </span>
                                </div>
                            </div>

                            <p className="text-muted mb-0 mt-3">
                                {item.subtitle}
                            </p>
                        </CardBody>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}
