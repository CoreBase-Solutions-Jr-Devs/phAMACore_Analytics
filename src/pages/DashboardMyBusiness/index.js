import React from 'react';
import { Container, Row, Col } from "reactstrap";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import Widgets from "./Widgets";
// import CashFlowSummary from "./CashFlowSummary";
// import ReceivablesAgeing from "./ReceivablesAgeing";
// import PayablesAgeing from "./PayablesAgeing";
// import ProfitabilitySummary from "./ProfitabilitySummary";


export default function DashboardMyBusiness() {
    document.title = "My Business | phAMACore Analytics";

    return (
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title="My Business" pageTitle="Business" />

                <Widgets />

                {/* <Row>
                    <Col xl={6}>
                        <CashFlowSummary />
                    </Col>

                    <Col xl={6}>
                        <ProfitabilitySummary />
                    </Col>
                </Row>

                <Row>
                    <Col xl={6}>
                        <ReceivablesAgeing />
                    </Col>

                    <Col xl={6}>
                        <PayablesAgeing />
                    </Col>
                </Row> */}
            </Container>
        </div>
    )
}
