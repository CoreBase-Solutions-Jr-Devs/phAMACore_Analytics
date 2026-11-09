import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import WidgetsOne from './WidgetsOne';
import BarChartTwo from './Charts/Custom/BarChartTwo';
import BarChartThree from './Charts/Custom/BarChartThree';

import {
    fetchBatchExpiryNeo,
    fetchBranches,
    fetchKPICriticalStockouts,
    fetchKPIImbalances,
    fetchKPISalesTransactions,
    fetchKPISlowMovingStock,
    fetchKPIStockHealth,
    fetchKPITotalStockValueByBranch,
} from '../../slices/dashboardStock/thunk';
import { applyFilters, syncDraftFilters } from '../../slices/dashboardStock/reducer';
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from '../../helpers/branch_helper';

import Section from './Section';
import FilterActions from './FilterActions';

import { exportToExcel } from '../../helpers/export_helper';
import CardExportButtons from '../../Components/Common/CardExportButtons';
import { transformStockVsSalesVelocity, getPeriodDays } from './Charts/Custom/util/chartTransforms';
import {
    getLookbackDays,
    CRITICAL_TOP_N,
    IMBALANCE_TOP_N,
    SLOW_MOVER_TOP_N,
} from '../utils/StockInventoryUtils';
import { addDaysApi, parseApiDate } from '../utils/dateHelper';

const DashboardStock = () => {
    document.title = "Inventory/Stock Dashboard | phAMACore Analytics";

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { branchId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const queryBranchParam = searchParams.get("branch");
    const urlBranchCode = useMemo(() => {
        const raw = branchId ?? queryBranchParam;
        if (raw === null || raw === undefined || raw === "") return null;
        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    }, [branchId, queryBranchParam]);

    const {
        branches = [],
        totalStockValueByBranch = [],
        kpiSalesTransactions = [],
        kpiSalesPeriodDays = 1,
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;

    const branchCode = activeFilters.branch && Number(activeFilters.branch) > 0 ? Number(activeFilters.branch) : 0;
    const isBranchView = branchCode > 0;

    const branchDisplayName = isBranchView
        ? cleanBranchName(resolveBranchName(branchCode, branches))
        : "";

    const lookbackDays = getLookbackDays(activeFilters.startDate, activeFilters.endDate);

    const [rightColumn, setRightColumn] = useState(false);

    const toggleRightColumn = () => {
        setRightColumn((prev) => {
            if (prev) {
                dispatch(syncDraftFilters());
            }
            return !prev;
        });
    };

    // Sync URL branch query param / legacy path param, Redux state, and localStorage persistence
    useEffect(() => {
        if (branchId !== undefined) {
            const code = urlBranchCode ?? 0;
            saveActiveBranch("stock", code);
            dispatch(applyFilters({ branch: code }));
            navigate(`/dashboard-stock?branch=${code}`, { replace: true });
            return;
        }

        if (urlBranchCode !== null) {
            saveActiveBranch("stock", urlBranchCode);
            dispatch(applyFilters({ branch: urlBranchCode }));
            return;
        }

        const persistedBranch = getActiveBranch("stock") ?? 0;
        dispatch(applyFilters({ branch: persistedBranch }));
        setSearchParams({ branch: String(persistedBranch) }, { replace: true });
    }, [dispatch, navigate, branchId, urlBranchCode, setSearchParams]);

    // Fetch branches once on mount
    useEffect(() => {
        dispatch(fetchBranches({ clientid: 1 }));
    }, [dispatch]);

    // Stock position: live figures that depend on the branch.
    useEffect(() => {
        const branchcode = branchCode || 0;

        dispatch(fetchKPITotalStockValueByBranch({ clientid: 1, whichcost: 1, branchcode }));
    }, [dispatch, branchCode]);

    // Batch expiry: 12-month lookback up to 90 days ahead of the filtered end date (or today),
    // filtered by the selected branch (needed for Near Expiry KPI widget).
    useEffect(() => {
        const branchcode = branchCode || 0;
        const asOf = parseApiDate(activeFilters.endDate) || new Date();

        dispatch(fetchBatchExpiryNeo({
            clientid: 1,
            branchcode,
            startDate: addDaysApi(-365, asOf),
            endDate: addDaysApi(90, asOf),
        }));
    }, [dispatch, branchCode, activeFilters.endDate]);

    // Movement-based figures: follow the branch and the date filter (needed for top KPI widgets and Stock VS Cost of Sales).
    useEffect(() => {
        const branchcode = branchCode || 0;
        const health = {
            clientid: 1,
            branchcode,
            LookbackDays: lookbackDays,
            AsOfDate: activeFilters.endDate,
        };

        dispatch(fetchKPIStockHealth(health));
        dispatch(fetchKPICriticalStockouts({ ...health, GroupBy: "CRITICAL_STOCKOUTS", TopN: CRITICAL_TOP_N }));
        dispatch(fetchKPISlowMovingStock({ ...health, GroupBy: "SLOW_MOVERS", TopN: SLOW_MOVER_TOP_N }));
        dispatch(fetchKPIImbalances({ ...health, TopN: IMBALANCE_TOP_N }));
        dispatch(fetchKPISalesTransactions({
            clientid: 1,
            startDate: activeFilters.startDate,
            endDate: activeFilters.endDate,
            GroupBy: "BRANCH",
            branchcode,
        }));
    }, [dispatch, branchCode, activeFilters.startDate, activeFilters.endDate, lookbackDays]);

    const periodDays = useMemo(() => {
        if (kpiSalesPeriodDays && kpiSalesPeriodDays > 1) {
            return kpiSalesPeriodDays;
        }
        if (activeFilters?.startDate && activeFilters?.endDate) {
            return getPeriodDays(activeFilters.startDate, activeFilters.endDate);
        }
        return 1;
    }, [kpiSalesPeriodDays, activeFilters?.startDate, activeFilters?.endDate]);

    const handleExportStockValueByBranch = () => {
        const rows = (totalStockValueByBranch || []).map((item) => {
            const rawBranch = item.branch_name || item.branchName || `Branch ${item.branch_id ?? ""}`;
            const branch = cleanBranchName(rawBranch);
            const rawVal = Number(item.total_stock_value || 0);
            return {
                "Branch": branch,
                "Stock Value (KES)": rawVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                "Stock Value (M KES)": Number((rawVal / 1000000).toFixed(2)),
            };
        });
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Stock_Value_By_Branch_${todayStr}`);
    };

    const handleExportStockVelocity = () => {
        const velocityData = transformStockVsSalesVelocity(totalStockValueByBranch, kpiSalesTransactions, periodDays);
        const rows = (velocityData.categories || []).map((branch, idx) => ({
            "Branch": branch,
            "Stock Value (KES)": (velocityData.rawStock?.[idx] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
            "Stock Value (M KES)": velocityData.stock?.[idx] ?? 0,
            "Avg Daily Cost of Sales (KES)": (velocityData.rawDailySales?.[idx] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
            "Consumption per 30 Days (KES)": (velocityData.monthlyConsumption?.[idx] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
            "Days of Cover": velocityData.daysCover?.[idx] ?? "-",
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Stock_VS_Sales_Velocity_${todayStr}`);
    };

    const handleApplyFilters = () => {
        const nextBranch = filters.branch && Number(filters.branch) > 0 ? Number(filters.branch) : 0;
        saveActiveBranch("stock", nextBranch);
        dispatch(applyFilters({ branch: nextBranch }));
        setRightColumn(false);
        setSearchParams({ branch: String(nextBranch) }, { replace: true });
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

                    <Section rightClickBtn={toggleRightColumn} />

                    <Row>
                        <Col xl={12}>
                            <WidgetsOne />
                        </Col>
                    </Row>

                    <Row className="align-items-stretch">
                        <Col lg={6} className="d-flex">
                            <Card className="flex-fill" id="stock-value-branch-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">
                                            {isBranchView && branchDisplayName
                                                ? `Stock Value - ${branchDisplayName}`
                                                : "Stock Value By Branch"}
                                        </h4>
                                        <CardExportButtons
                                            targetId="stock-value-branch-card"
                                            title="Stock Value By Branch"
                                            onExport={handleExportStockValueByBranch}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <BarChartTwo />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6} className="d-flex">
                            <Card className="flex-fill" id="stock-velocity-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">
                                            {isBranchView && branchDisplayName
                                                ? `Stock VS Cost of Sales - ${branchDisplayName}`
                                                : "Stock VS Cost of Sales - Branch Coverage"}
                                        </h4>
                                        <CardExportButtons
                                            targetId="stock-velocity-card"
                                            title="Stock VS Sales Velocity"
                                            onExport={handleExportStockVelocity}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <BarChartThree />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                </Container>
                <FilterActions
                    onApply={handleApplyFilters}
                    rightColumn={rightColumn}
                    hideRightColumn={toggleRightColumn}
                />
            </div>
        </React.Fragment>
    );
};

export default DashboardStock;
