import React from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Badge } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import Widgets from './Widgets';
import { CustomDataLabel } from '../Charts/ApexCharts/BarCharts/BarCharts';
import { PaginationTable } from '../Tables/ReactTables/ReactTable';
import SimpleBar from 'simplebar-react';
import { Link } from 'react-router-dom';

// Import Images
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";
import WidgetsOne from './WidgetsOne';
import WidgetsTwo from './WidgetsTwo';
import BarChartOne from './Charts/Custom/BarChartOne';
import BarChartTwo from './Charts/Custom/BarChartTwo';
import BarChartThree from './Charts/Custom/BarChartThree';
import CustomTableOne from './Tables/Custom/CustomTableOne';


const DashboardCrm = () => {
    document.title="Inventory/Stock Dashboard | phAMACore Analytics";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>  
                    <BreadCrumb title="Inventory/Stock Dashboard" pageTitle="Dashboards" />
                    <Row>
                        <WidgetsOne />
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Critical Stock Levels - MUST-NOT STOCKOUT items</h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartOne dataColors='["--vz-primary", "--vz-secondary", "--vz-success", "--vz-info", "--vz-warning", "--vz-danger", "--vz-dark", "--vz-primary", "--vz-success", "--vz-secondary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6} xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Stock Value By Branch</h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartTwo dataColors='["--vz-primary", "--vz-secondary", "--vz-success", "--vz-info", "--vz-warning", "--vz-danger", "--vz-dark", "--vz-primary", "--vz-success", "--vz-secondary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg={6} xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Stock VS Sales Velocity - Branch Coverage Ratio</h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartThree dataColors='["--vz-primary", "--vz-secondary", "--vz-success", "--vz-info", "--vz-warning", "--vz-danger", "--vz-dark", "--vz-primary", "--vz-success", "--vz-secondary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
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
                                            <ListGroup className="list mb-0" flush>
                                                <ListGroupItem data-id="1">
                                                    <div className="d-flex">
                                                        <div className="flex-grow-1">
                                                            <h5 className="fs-13 mb-1"><Link to="#" className="link name text-body">Chlorpheniramine 4mg</Link></h5>
                                                            <p className="born timestamp text-muted mb-0" data-timestamp="12345">Eldoret. 0 units sold. 38 days</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className="badge rounded-pill border border-danger text-danger fs-11 fw-normal px-2 py-1">Dead Stock</span>
                                                        </div>
                                                    </div>
                                                </ListGroupItem>

                                                <ListGroupItem data-id="2">
                                                    <div className="d-flex">
                                                        <div className="flex-grow-1">
                                                            <h5 className="fs-13 mb-1"><Link to="#" className="link name text-body">Ferrous Sulphate 200mg</Link></h5>
                                                            <p className="born timestamp text-muted mb-0" data-timestamp="23456">Nakuru. 4units/day. 28 days</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className="badge rounded-pill border border-warning text-warning fs-11 fw-normal px-2 py-1">Slow</span>
                                                        </div>
                                                    </div>
                                                </ListGroupItem>

                                                <ListGroupItem data-id="3">
                                                    <div className="d-flex">
                                                        <div className="flex-grow-1">
                                                            <h5 className="fs-13 mb-1"><Link to="#" className="link name text-body">Hydrocortisone Cream</Link></h5>
                                                            <p className="born timestamp text-muted mb-0" data-timestamp="34567">Kisumu. 2 units/day. 32 days</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className="badge rounded-pill border border-warning text-warning fs-11 fw-normal px-2 py-1">Slow</span>
                                                        </div>
                                                    </div>
                                                </ListGroupItem>

                                                <ListGroupItem data-id="4">
                                                    <div className="d-flex">
                                                        <div className="flex-grow-1">
                                                            <h5 className="fs-13 mb-1"><Link to="#" className="link name text-body">Zinc Sulphate Tabs</Link></h5>
                                                            <p className="born timestamp text-muted mb-0" data-timestamp="45678">Thika. 6 units/day. 22 days.</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className="badge rounded-pill border border-warning text-warning fs-11 fw-normal px-2 py-1">Slow</span>
                                                        </div>
                                                    </div>
                                                </ListGroupItem>

                                                <ListGroupItem data-id="5">
                                                    <div className="d-flex">
                                                        <div className="flex-grow-1">
                                                            <h5 className="fs-13 mb-1"><Link to="#" className="link name text-body">Calamine Lotion 200ml</Link></h5>
                                                            <p className="born timestamp text-muted mb-0" data-timestamp="45678">Mombasa. 1 unit/day. 41 days.</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className="badge rounded-pill border border-danger text-danger fs-11 fw-normal px-2 py-1">Near Dead</span>
                                                        </div>
                                                    </div>
                                                </ListGroupItem>

                                            </ListGroup >
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
                                        <ListGroup className="list mb-0" flush>

                                            <ListGroupItem data-id="01">
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                                        <span className="fw-medium text-body fs-13">Amoxicillin 500mg</span>
                                                        <span className="ms-1 text-muted">·</span>
                                                        <span className="badge rounded-pill text-bg-success fs-11 fw-normal px-2 py-1">Nairobi 2,400u</span>
                                                        <span className="text-muted">→</span>
                                                        <span className="badge rounded-pill text-bg-danger fs-11 fw-normal px-2 py-1">Eldoret 260u</span>
                                                    </div>
                                                    <span className="badge rounded-pill border border-warning text-warning fs-11 fw-normal px-2 py-1">Transfer queued</span>
                                                </div>
                                            </ListGroupItem>

                                            <ListGroupItem data-id="02">
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                                        <span className="fw-medium text-body fs-13">Co-Artem 20/120mg</span>
                                                        <span className="ms-1 text-muted">·</span>
                                                        <span className="badge rounded-pill text-bg-success fs-11 fw-normal px-2 py-1">Mombasa 1,140u</span>
                                                        <span className="text-muted">→</span>
                                                        <span className="badge rounded-pill text-bg-danger fs-11 fw-normal px-2 py-1">Eldoret 180u</span>
                                                    </div>
                                                    <span className="badge rounded-pill border border-warning text-warning fs-11 fw-normal px-2 py-1">Transfer queued</span>
                                                </div>
                                            </ListGroupItem>

                                            <ListGroupItem data-id="03">
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                                        <span className="fw-medium text-body fs-13">ORS Sachets</span>
                                                        <span className="ms-1 text-muted">·</span>
                                                        <span className="badge rounded-pill text-bg-success fs-11 fw-normal px-2 py-1">Thika 3,200u</span>
                                                        <span className="text-muted">→</span>
                                                        <span className="badge rounded-pill text-bg-danger fs-11 fw-normal px-2 py-1">Nakuru 340u</span>
                                                    </div>
                                                    <span className="badge rounded-pill border border-danger text-danger fs-11 fw-normal px-2 py-1">Transfer urgent</span>
                                                </div>
                                            </ListGroupItem>

                                            <ListGroupItem data-id="04">
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                                        <span className="fw-medium text-body fs-13">Metformin 500mg</span>
                                                        <span className="ms-1 text-muted">·</span>
                                                        <span className="badge rounded-pill text-bg-success fs-11 fw-normal px-2 py-1">Nairobi 1,650u</span>
                                                        <span className="text-muted">→</span>
                                                        <span className="badge rounded-pill text-bg-danger fs-11 fw-normal px-2 py-1">Nakuru 320u</span>
                                                    </div>
                                                    <span className="badge rounded-pill border border-danger text-danger fs-11 fw-normal px-2 py-1">Transfer urgent</span>
                                                </div>
                                            </ListGroupItem>

                                            <ListGroupItem data-id="05">
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                                        <span className="fw-medium text-body fs-13">Vitamin C 500mg</span>
                                                        <span className="ms-1 text-muted">·</span>
                                                        <span className="badge rounded-pill text-bg-warning fs-11 fw-normal px-2 py-1">Mombasa 3,400u (near-expiry)</span>
                                                        <span className="text-muted">→</span>
                                                        <span className="badge rounded-pill text-bg-info fs-11 fw-normal px-2 py-1">All branches</span>
                                                    </div>
                                                    <span className="badge rounded-pill border border-danger text-danger fs-11 fw-normal px-2 py-1">Promote urgently</span>
                                                </div>
                                            </ListGroupItem>

                                        </ListGroup>
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