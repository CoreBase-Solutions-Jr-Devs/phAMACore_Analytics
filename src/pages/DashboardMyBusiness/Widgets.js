import React from 'react';
import { Row, Col, Card, CardBody } from "reactstrap";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";

const kpis = [
    {
        title: "Receivables",
        value: 0,
        prefix: "KES ",
        suffix: "",
        icon: "credit-card",
        color: "success",
        subtitle: "Customer balances"
    },
    {
        title: "Payables",
        value: 0,
        prefix: "KES ",
        suffix: "",
        icon: "shopping-bag",
        color: "danger",
        subtitle: "Supplier balances"
    },
    {
        title: "Cash Available",
        value: 0,
        prefix: "KES ",
        suffix: "",
        icon: "dollar-sign",
        color: "success",
        subtitle: "Available cash position"
    },
    {
        title: "Sales",
        value: 0,
        prefix: "KES ",
        suffix: "",
        icon: "trending-up",
        color: "primary",
        subtitle: "Current period sales"
    },
    {
        title: "Stock Profit",
        value: 0,
        prefix: "KES ",
        suffix: "",
        icon: "package",
        color: "warning",
        subtitle: "Estimated stock profit"
    },
    {
        title: "Income Statement",
        value:0,
        prefix: "KES ",
        suffix: "",
        icon: "bar-chart-2",
        color: "secondary",
        subtitle: "Net profit after expenses"
    },
    {
        title: "Collections",
        value: 0,
        prefix: "KES ",
        suffix: "",
        icon: "archive",
        color: "success",
        subtitle: "Customer payments received"
    },
    {
        title: "Ageing",
        value: 0,
        prefix: "",
        suffix: "",
        icon: "clock",
        color: "info",
        subtitle: "Invoices over 90 days"
    }
];

export default function Widgets() {
    return (
               <React.Fragment>
             <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">

  <h4 className="card-title mb-0">
    KEY METRICS
    {/* {branchName !== "All Branches" && ` - ${branchName}`} */}
  </h4>
        </div>

  <Row className="g-2 mb-2">
    {kpis.map((item, index) => (
        <Col xl={3} lg={4} md={6} sm={12} key={index}>
            <Card className="card-animate h-100">
                <CardBody className="p-2">
                    <div className="d-flex justify-content-between align-items-center">

                        {/* Left content */}
                        <div>
                            <p className="font-medium mb-0">
                                {item.title}
                            </p>

                            <h2 className={`mt-4 ff-secondary fw-semibold text-${item.color}`}>
                                <span className="counter-value">
                                    {item.prefix}
                                    {Number(item.value || 0)}
                                    {item.suffix}
                                </span>
                            </h2>

                            <p className="mb-0 text-muted">
                                {item.subtitle}
                            </p>
                        </div>

                        {/* Right icon */}
                        <div className="avatar-sm flex-shrink-0">
                            <span className={`avatar-title bg-${item.color}-subtle rounded-circle fs-2`}>
                                <FeatherIcon
                                    icon={item.icon}
                                    className={`text-${item.color}`}
                                />
                            </span>
                        </div>

                    </div>
                </CardBody>
            </Card>
        </Col>
    ))}
</Row>
        </React.Fragment>
    );
}
