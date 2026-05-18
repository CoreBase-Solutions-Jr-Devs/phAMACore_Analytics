import React, { useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

// Components
import Widget from "./Widget";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import OrderPipeline from "./Order Pipeline";
import BranchPerformance from "./BranchPerfomance";
import TopProducts from "./TopProducts";
import SalesmanRevenue from "./SalesmanRevenue";
import ReceivablesAgeing from "./ReceivablesAgeing";
import TopCustomers from "./TopCustomers";
import ProgressiveSales from "./ProgressiveSales";
import MonthToDateSales from "./MonthToDateSales";
import BranchDropdown from "./BranchDropdown";
// API
import { getSalesTransactions } from "../../slices/dashboardSales/thunk";

const DashboardAnalytics = () => {
  document.title = "Analytics | Velzon - React Admin & Dashboard Template";

  const dispatch = useDispatch();

  const { sales = [], loading, error } = useSelector(
    (state) => state.powerbi
  );

  useEffect(() => {
    dispatch(
      getSalesTransactions({
        clientid: 1,
        startDate: "01/01/2026",
        endDate: "15/05/2026",
        // branchcode: 1,
      })
    );
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>

          <BreadCrumb title="Analytics" pageTitle="Dashboards" />

          {/* STATUS */}
          {loading && <p>Loading analytics...</p>}
          {error && <p className="text-danger">{error}</p>}
<Row>
  <BranchDropdown/>
</Row>
          {/* WIDGETS */}
          <Row>
            <Col xxl={5}>
              <Widget sales={sales} />
            </Col>
          </Row>

          {/* PIPELINE */}
          {/* <Row>
            <OrderPipeline sales={sales} />
          </Row> */}

          {/* SALES TREND */}
         

          {/* PERFORMANCE */}
          <Row>
            <Col xl={6}>
              <BranchPerformance sales={sales} />
            </Col>

            <Col xl={6}>
              <TopProducts sales={sales} />
            </Col>
          </Row>

          {/* FINANCIAL */}
          <Row>
            <Col xl={4}>
              <SalesmanRevenue sales={sales} />
            </Col>

            <Col xl={4}>
              <ReceivablesAgeing sales={sales} />
            </Col>

            <Col xl={4}> 
            <TopCustomers sales={sales} /> 
            </Col>
          </Row>

          {/* CUSTOMERS */}
          <Row>
           
          </Row>
 <Row>
  <Col xl={6}>
            <ProgressiveSales sales={sales} />
            </Col>
            <Col xl={6}>
            <MonthToDateSales sales={sales} />  
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardAnalytics;