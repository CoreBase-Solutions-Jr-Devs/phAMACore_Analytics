import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import ActiveProjects from './ActiveProjects';
import Chat from './Chat';
import MyTasks from './MyTasks';
import ProjectsOverview from './ProjectsOverview';
import ProjectsStatus from './ProjectsStatus';
import TeamMembers from './TeamMembers';
import UpcomingSchedules from './UpcomingSchedules';
import Widgets from './Widgets';
import BarChartOne from './Charts/Custom/Bar/BarChartOne';
import BarChartTwo from './Charts/Custom/Bar/BarChartTwo';
import CustomTableOne from './Tables/Custom/CustomTableOne';
import BarChartThree from './Charts/Custom/Bar/BarChartThree';
import WidgetsOne from './WidgetsOne';
import CustomTableTwo from './Tables/Custom/CustomTableTwo';
import { LineChartOne } from './Charts/Custom/Line/LineChartOne';
import { LineChartTwo } from './Charts/Custom/Line/LineChartTwo';
import LineChartThree from './Charts/Custom/Line/LineChartThree';

const DashboardProject = () => {
    document.title="Branch Sales | phAMACore Analytics";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Branch Sales - Nairobi" pageTitle="Dashboards" />
                    <Row className="project-wrapper">
                        <Col xxl={8}>
                            <Widgets />
                            {/* <ProjectsOverview /> */}
                        </Col>
                        {/* <UpcomingSchedules /> */}
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Top 10 Products Sold Today</h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartOne dataColors='["--vz-primary", "--vz-secondary", "--vz-success", "--vz-info", "--vz-warning", "--vz-danger", "--vz-dark", "--vz-primary", "--vz-success", "--vz-secondary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                        <Col>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Bottom 10 Products Sold Today</h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartTwo dataColors='["--vz-primary", "--vz-secondary", "--vz-success", "--vz-info", "--vz-warning", "--vz-danger", "--vz-dark", "--vz-primary", "--vz-success", "--vz-secondary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Salesman Leaderboard - Revenue(KES)</h4>
                                </CardHeader>
                                <CardBody>
                                    <CustomTableOne />
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Top 10 Customers by Revenue(KES)</h4>
                                </CardHeader>
                                <CardBody>
                                    <BarChartThree dataColors='["--vz-primary", "--vz-secondary", "--vz-success", "--vz-info", "--vz-warning", "--vz-danger", "--vz-dark", "--vz-primary", "--vz-success", "--vz-secondary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Card>
                            <CardHeader>
                                <h4 className="card-title mb-0">Branch Receivables Aging(KES '000)</h4>
                            </CardHeader>
                            <CardBody>
                                <WidgetsOne />
                                <CustomTableTwo />
                            </CardBody>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardBody>
                                    <LineChartOne dataColors='["--vz-primary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg={6}>
                            <Card>
                                <CardBody>
                                    <LineChartTwo dataColors='["--vz-success"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Card>
                            <CardBody>
                                <LineChartThree />
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default DashboardProject;