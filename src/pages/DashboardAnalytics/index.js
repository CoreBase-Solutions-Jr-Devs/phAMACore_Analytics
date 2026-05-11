import React from "react";
import { Col, Container, Row } from "reactstrap";

//import Components
import UpgradeAccountNotise from "./UpgradeAccountNotise";
import UsersByDevice from "./UsersByDevice";
import Widget from "./Widget";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import AudiencesMetrics from "./AudiencesMetrics";
import AudiencesSessions from "./AudiencesSessions";
import LiveUsers from "./LiveUsers";
import TopReferrals from "./TopReferrals";
import TopPages from "./TopPages";
import OrderPipeline from "./Order Pipeline";
import BranchPerformance from "./BranchPerfomance";
import TopProducts from "./TopProducts";
import SalesmanRevenue from "./SalesmanRevenue";
import ReceivablesAgeing from "./ReceivablesAgeing";
import TopCustomers from "./TopCustomers";
import ProgressiveSales from "./ProgressiveSales";

const DashboardAnalytics = () => {
  document.title = "Analytics | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Analytics" pageTitle="Dashboards" />
          <Row>
            <Col xxl={5}>
              {/* <UpgradeAccountNotise /> */}
              <Widget />
            </Col>
            {/* <LiveUsers /> */}
          </Row>
          <Row>
            <OrderPipeline />
          </Row>
          <Row>
            <ProgressiveSales />
          </Row>
          <Row>
            <Col xl={6}>
              <BranchPerformance />
            </Col>
            <Col xl={6}>
              <TopProducts />
            </Col>
          </Row>
          <Row>
              <Col xl={6}>
                <SalesmanRevenue />
              </Col>
          <Col xl={6}>
            <ReceivablesAgeing />
            </Col>
            {/* <AudiencesMetrics />
                        <AudiencesSessions /> */}
          </Row>
          <Row>
             <TopCustomers />
            {/* <UsersByDevice />
                        <TopReferrals />
                        <TopPages /> */}
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardAnalytics;
