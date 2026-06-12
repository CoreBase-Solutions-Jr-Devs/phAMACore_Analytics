import React, { useEffect } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import WidgetsOne from './WidgetsOne';
import WidgetsTwo from './WidgetsTwo';
// import BarChartOne from './Charts/Custom/BarChartOne';
import BarChartTwo from './Charts/Custom/BarChartTwo';
import BarChartThree from './Charts/Custom/BarChartThree';
import CustomTableOne from './Tables/Custom/CustomTableOne';
import { fetchBatchExpiryNeo, fetchDailyClosingStock } from '../../slices/dashboardCRM/thunk';
import CriticalStockChart from './components/CriticalStockChart';
import SlowMovingStock from "./components/SlowMovingStock";
import ImbalanceAlertsContainer from './components/ImbalanceAlerts/ImbalanceAlertsContainer';
import ImbalanceAlerts from './components/ImbalanceAlerts';

const DashboardCrm = () => {
    document.title = "Inventory/Stock Dashboard | phAMACore Analytics";

    const dispatch = useDispatch();
    const { stockMovements = [] } = useSelector((state) => state.StockInventory);

    useEffect(() => {
        dispatch(fetchBatchExpiryNeo({
            clientid: 1,
            branchcode: 0,
        }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchDailyClosingStock({
            clientid: 1,
            startDate: "",
            endDate: "",
            branchcode: 0,
            itemcode: "",
        }));
    }, [dispatch]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>  
                    <BreadCrumb title="Inventory/Stock Dashboard" pageTitle="Dashboards" />
                    <Row>
                        <Col xl={12}>
                            <WidgetsOne />
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={12}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Critical Stock Levels - MUST-NOT STOCKOUT items</h4>
                                </CardHeader>
                                <CardBody>
                                    <CriticalStockChart />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="align-items-stretch">
                        <Col lg={6} xl={6} className="d-flex">
                            <Card className="flex-fill">
                                <CardHeader>
                                    <h4 className="card-title mb-0">Stock Value By Branch</h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartTwo />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6} xl={6} className="d-flex">
                            <Card className="flex-fill">
                                <CardHeader>
                                    <h4 className="card-title mb-0">
                                        Stock VS Sales Velocity - Branch Coverage Ratio
                                    </h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartThree />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={12}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">EXPIRY WATCH - Products at WRITE-OFF Risk</h4>
                                </CardHeader>
                                <div className="card-body p-0 border-top">
                                    <WidgetsTwo />
                                </div>
                                <CardBody className="border-top">
                                    <CustomTableOne />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={5}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">SLOW-MOVING STOCK( 0 or Low Movement - 30 days)</h4>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted">Use data attributes and other custom attributes as keys</p>
                                    <div id="users">
                                        <Row className="mb-2">
                                            <Col>
                                                <div>
                                                    <input className="search form-control" placeholder="Search" />
                                                </div>
                                            </Col>
                                            <Col className="col-auto">
                                                <button className="btn btn-light sort" data-sort="name">
                                                    Sort by name
                                                </button>
                                            </Col>
                                        </Row>

                                        <SimpleBar style={{ height: "242px" }} className="mx-n3">
                                            <SlowMovingStock movements={stockMovements} />
                                        </SimpleBar>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg={7}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Inter-branch Imbalance Alerts</h4>
                                </CardHeader>

                                <CardBody>
                                    <p className="text-muted">Products where one branch is overstocked while another is critically low.</p>

                                    <SimpleBar style={{ height: "272px" }} className="mx-n3 px-3">
                                        <ImbalanceAlerts />
                                    </SimpleBar>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default DashboardCrm;