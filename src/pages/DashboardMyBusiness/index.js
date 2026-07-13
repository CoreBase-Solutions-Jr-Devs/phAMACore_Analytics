import React from 'react';
import { Container, Row, Col } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import Widgets from "./Widgets";
import RevenueExpenses from "./RevenueExpenses"
import StockPurchases from './StockPurchases';
// import CashFlowSummary from "./CashFlowSummary";
import ReceivablesAgeing from "./ReceivablesAgeing";
import StockMovements from './StockMovements';
import SalesCollection from './SalesCollection';
// import PayablesAgeing from "./PayablesAgeing";
// import ProfitabilitySummary from "./ProfitabilitySummary";


export default function DashboardMyBusiness() {
    document.title = "My Business | phAMACore Analytics";

    return (
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title="My Business" pageTitle="Business" />

                <Widgets />

                <Row>
                    <Col xl={6}>
                  <RevenueExpenses/>
                    </Col>

                    <Col xl={6}>
                      < StockPurchases />
                    </Col>
                </Row>

                 <Row>
                     <Col xl={6}>
                         <ReceivablesAgeing />
                     </Col>

                     <Col xl={6}>
                        <StockMovements />
                     </Col>
                </Row> 
                <Row>
                    <Col>
                    <SalesCollection />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
