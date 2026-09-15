import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
import { setBranch } from '../../slices/dashboardStock/reducer';
import { resolveBranchName, saveActiveBranch } from '../../helpers/branch_helper';

import CriticalStockChart from './components/CriticalStockChart';
import SlowMovingStock from "./components/SlowMovingStock";
import ImbalanceAlerts from './components/ImbalanceAlerts';

import FilterActions from './FilterActions';
import { mockSlowMovingStock } from './components/Sample/slowMovingStock';

const DashboardStock = () => {
    document.title = "Inventory/Stock Dashboard | phAMACore Analytics";

    const [searchTerm, setSearchTerm] = useState("");
    const [sortAscending, setSortAscending] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { branchId } = useParams();

    const branchCode = branchId ? Number(branchId) : null;
    const isBranchView = !!branchCode;

    const { stockMovements = [], dailyClosingStock = [], branches = [], filters } = useSelector((state) => state.StockInventory);

    const branchDisplayName = isBranchView
        ? resolveBranchName(branchCode, branches, stockMovements)
        : "";

    const [rightColumn, setRightColumn] = useState(false);

    const toggleRightColumn = () => {
        setRightColumn(prev => !prev);
    };

    const formatDisplay = (date) => date || "";

    // Sync URL branchId into Redux state and persist active branch when URL changes
    useEffect(() => {
        dispatch(setBranch(branchCode));
        if (branchCode) {
            saveActiveBranch("stock", branchCode);
        }
    }, [dispatch, branchCode]);

    // Fetch branches once on mount
    useEffect(() => {
        dispatch(fetchBranches({ clientid: 1 }));
    }, [dispatch]);

    // Fetch data when branch or date filters change
    useEffect(() => {
        const payload = {
            clientid: 1,
            branchcode: branchCode || null,
            startDate: filters.startDate,
            endDate: filters.endDate,
        };

        dispatch(fetchDailyClosingStock(payload));
        dispatch(fetchBatchExpiryNeo(payload));
        // PowerBIStockMovements requires a valid branchcode: use branchCode if available, else default to 1
        dispatch(fetchStockMovements({
            clientid: 1,
            branchcode: branchCode || 1,
            startDate: filters.startDate,
            endDate: filters.endDate,
        }));
    }, [dispatch, branchCode, filters.startDate, filters.endDate]);

    const handleApplyFilters = () => {
        setRightColumn(false);

        if (filters.branch) {
            navigate(`/dashboard-stock/branch/${filters.branch}`);
        } else {
            navigate('/dashboard-stock');
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>

                    <BreadCrumb
                        title="Inventory/Stock"
                        pageTitle="Dashboards"
                        subtitle={isBranchView ? branchDisplayName : undefined}
                    />

                    <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">

                        <h4 className="card-title mb-0">
                            KEY METRICS
                        </h4>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            {isBranchView && branchDisplayName && (
                                <>
                                    <span>Branch:</span>
                                    <strong className="text-primary">{branchDisplayName}</strong>
                                    <span className="mx-1 text-muted">|</span>
                                </>
                            )}
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
                                    <h4 className="card-title mb-1">
                                        Critical Stock Levels - MUST-NOT STOCKOUT items
                                    </h4>

                                    {/* <small className="text-warning">
                                        Showing illustrative sample data while stock cover calculations are being validated.
                                    </small> */}
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
                                    <p className="text-muted">Low Sales Velocity Items (30 Days)</p>
                                    <div id="users">
                                        <Row className="mb-3 align-items-center g-2">
                                            <Col>
                                                <input
                                                    className="form-control"
                                                    placeholder="Search by item name or code..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </Col>

                                            <Col xs="auto">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setSortAscending((prev) => !prev)}
                                                >
                                                    {sortAscending ? "A–Z ▲" : "Z–A ▼"}
                                                </button>
                                            </Col>
                                        </Row>

                                        <SimpleBar style={{ height: "242px" }} className="mx-n3">
                                            <SlowMovingStock
                                                movements={
                                                    stockMovements?.length
                                                        ? stockMovements
                                                        : mockSlowMovingStock
                                                }
                                                searchTerm={searchTerm}
                                                sortAscending={sortAscending}
                                            />
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
                                        <ImbalanceAlerts
                                            stock={dailyClosingStock}
                                            movements={stockMovements}
                                        />
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