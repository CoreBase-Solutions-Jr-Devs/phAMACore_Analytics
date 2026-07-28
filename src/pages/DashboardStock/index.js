import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import WidgetsOne from './WidgetsOne';
import WidgetsTwo from './WidgetsTwo';
// import BarChartOne from './Charts/Custom/BarChartOne';
import BarChartTwo from './Charts/Custom/BarChartTwo';
import BarChartThree from './Charts/Custom/BarChartThree';
import CustomTableOne from './Tables/Custom/CustomTableOne';

import {
    fetchBatchExpiryNeo,
    fetchBranches,
    fetchDailyClosingStock,
    fetchStockMovements
} from '../../slices/dashboardStock/thunk';

import CriticalStockChart from './components/CriticalStockChart';
import SlowMovingStock from "./components/SlowMovingStock";
import ImbalanceAlerts from './components/ImbalanceAlerts';

import FilterActions from './FilterActions';

const DashboardStock = () => {
    document.title = "Inventory/Stock Dashboard | phAMACore Analytics";

    const dispatch = useDispatch();
    const { stockMovements = [] } = useSelector((state) => state.StockInventory);

    const [rightColumn, setRightColumn] = useState(false);

    const toggleRightColumn = () => {
        setRightColumn(prev => !prev);
    };

    const { filters } = useSelector((state) => state.StockInventory);
    const formatDisplay = (date) => date || "";

    const handleApplyFilters = () => {
        const payload = {
            clientid: 1,
            branchcode: filters.branch ?? 0,
            startDate: filters.startDate,
            endDate: filters.endDate,
        };

        // console.log("Filters:", filters);
        // console.log("Payload:", payload);
        dispatch(fetchDailyClosingStock(payload));
        dispatch(fetchStockMovements(payload));
        dispatch(fetchBatchExpiryNeo(payload));

        setRightColumn(false);
    };

    // Load with filters
    useEffect(() => {
        dispatch(fetchBranches({ clientid: 1 }));

        setRightColumn(false);
        handleApplyFilters();
    }, []);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>

                    <BreadCrumb title="Inventory/Stock" pageTitle="Dashboards" />

                    <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">

                        <h4 className="card-title mb-0">
                            KEY METRICS
                        </h4>

                        <div className="d-flex align-items-center gap-2">
                            <span>Filtered From:</span>
                            <strong>{formatDisplay(filters.startDate)}</strong>
                            <span>to</span>
                            <strong>{formatDisplay(filters.endDate)}</strong>
                        </div>

                        <button
                            type="button"
                            className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
                            onClick={toggleRightColumn}
                        >
                            <i className="ri-filter-fill"></i>
                            Filter
                        </button>

                    </div>

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
                        <Col lg={6} className="d-flex">
                            <Card className="flex-fill">
                                <CardHeader>
                                    <h4 className="card-title mb-0">Stock Value By Branch</h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartTwo />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6} className="d-flex">
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
                                    <h4 className="card-title mb-0">EXPIRY WATCH - WRITE-OFF RISK</h4>
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
                                    <h4 className="card-title mb-0">SLOW MOVING STOCK (30 DAYS)</h4>
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
                        <FilterActions
                            onApply={handleApplyFilters}
                            rightColumn={rightColumn}
                            hideRightColumn={toggleRightColumn}
                        />
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default DashboardStock;