import React, { useEffect, useMemo, useState } from 'react';
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
    fetchKPICriticalStockouts,
    fetchKPIImbalances,
    fetchKPISalesTransactions,
    fetchKPISlowMovingStock,
    fetchKPIStockHealth,
    fetchKPITotalStockValueByBranch,
} from '../../slices/dashboardStock/thunk';
import { setBranch } from '../../slices/dashboardStock/reducer';
import { resolveBranchName, saveActiveBranch, cleanBranchName } from '../../helpers/branch_helper';

import CriticalStockChart from './components/CriticalStockChart';
import SlowMovingStock from "./components/SlowMovingStock";
import ImbalanceAlerts from './components/ImbalanceAlerts';
import Section from './Section';
import FilterActions from './FilterActions';

import { exportToExcel } from '../../helpers/export_helper';
import CardExportButtons from '../../Components/Common/CardExportButtons';
import { transformStockVsSalesVelocity, getPeriodDays } from './Charts/Custom/util/chartTransforms';
import { suggestedOrderQty } from './components/CriticalStockChart';
import {
    buildTransferSuggestions,
    buildSlowMovingRows,
    sortSlowMovingRows,
    formatSlowDaysCover,
    filterTransferSuggestions,
    IMBALANCE_STATUS_FILTERS,
    getExpiryRows,
    getLookbackDays,
    CRITICAL_TOP_N,
    IMBALANCE_TOP_N,
    SLOW_MOVER_TOP_N,
} from '../utils/StockInventoryUtils';
import { addDaysApi } from '../utils/dateHelper';

const DashboardStock = () => {
    document.title = "Inventory/Stock Dashboard | phAMACore Analytics";

    const [searchTerm, setSearchTerm] = useState("");
    // Slow moving stock: sort by column, most capital tied up first by default
    const [sortField, setSortField] = useState("tiedUpCapital");
    const [sortDesc, setSortDesc] = useState(true);

    const [imbalanceSearchTerm, setImbalanceSearchTerm] = useState("");
    // Transfer suggestions: keep the API severity ranking, filter by Deficit / Surplus
    const [imbalanceStatusFilter, setImbalanceStatusFilter] = useState("ALL");

    const handleSlowMovingSort = (field) => {
        if (sortField === field) {
            setSortDesc((prev) => !prev);
        } else {
            setSortField(field);
            setSortDesc(field !== "name");
        }
    };

    const renderSlowSortIcon = (field) =>
        sortField === field ? (
            <i className={`ms-1 ${sortDesc ? "ri-arrow-down-line" : "ri-arrow-up-line"}`}></i>
        ) : null;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { branchId } = useParams();

    const branchCode = branchId ? Number(branchId) : null;
    const isBranchView = !!branchCode;

    const {
        batchExpiryNeo = [],
        branches = [],
        criticalStockouts = [],
        totalStockValueByBranch = [],
        kpiSalesTransactions = [],
        kpiSalesPeriodDays = 1,
        slowMovingStock = [],
        imbalances = [],
        filters = {},
    } = useSelector((state) => state.StockInventory ?? {});

    const branchDisplayName = isBranchView
        ? cleanBranchName(resolveBranchName(branchCode, branches))
        : "";

    const lookbackDays = getLookbackDays(filters.startDate, filters.endDate);

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

    // Stock position: live figures that only depend on the branch, not on the date filter.
    useEffect(() => {
        const branchcode = branchCode || null;

        dispatch(fetchKPITotalStockValueByBranch({ clientid: 1, whichcost: 1, branchcode }));

        // Expiry is a fixed window around today (expired in the last 12 months up to 90 days
        // ahead). It used to take the dashboard date range, so a one-day filter returned nothing.
        dispatch(fetchBatchExpiryNeo({
            clientid: 1,
            branchcode,
            startDate: addDaysApi(-365),
            endDate: addDaysApi(90),
        }));
    }, [dispatch, branchCode]);

    // Movement-based figures: follow the branch and the date filter.
    // The per-line closing stock and stock movement downloads were dropped: the stock health
    // endpoint already returns the KPIs and transfer suggestions that were derived from them.
    useEffect(() => {
        const health = {
            clientid: 1,
            branchcode: branchCode || null,
            LookbackDays: lookbackDays,
            AsOfDate: filters.endDate,
        };

        dispatch(fetchKPIStockHealth(health));
        dispatch(fetchKPICriticalStockouts({ ...health, GroupBy: "CRITICAL_STOCKOUTS", TopN: CRITICAL_TOP_N }));
        dispatch(fetchKPISlowMovingStock({ ...health, GroupBy: "SLOW_MOVERS", TopN: SLOW_MOVER_TOP_N }));
        dispatch(fetchKPIImbalances({ ...health, TopN: IMBALANCE_TOP_N }));
        dispatch(fetchKPISalesTransactions({
            clientid: 1,
            startDate: filters.startDate,
            endDate: filters.endDate,
            GroupBy: "BRANCH",
            branchcode: branchCode || null,
        }));
    }, [dispatch, branchCode, filters.startDate, filters.endDate, lookbackDays]);

    const periodDays = useMemo(() => {
        if (kpiSalesPeriodDays && kpiSalesPeriodDays > 1) {
            return kpiSalesPeriodDays;
        }
        if (filters?.startDate && filters?.endDate) {
            return getPeriodDays(filters.startDate, filters.endDate);
        }
        return 1;
    }, [kpiSalesPeriodDays, filters?.startDate, filters?.endDate]);

    const handleExportCriticalStock = () => {
        const rows = (criticalStockouts || []).map((item) => ({
            "Item Name": item.item_name || "Unknown",
            "Item Code": item.item_code || "",
            "Category / Group": item.item_group || "-",
            "Branch": cleanBranchName(item.branch_name || item.branchName || ""),
            "Current Stock": Number(item.current_stock_qty ?? 0).toLocaleString(),
            "Min Reorder Qty": Number(item.effective_min_qty ?? item.branch_min_qty ?? 0).toLocaleString(),
            "ABC Class": item.abc_class || "-",
            "Monthly Demand": Number(item.monthly_demand ?? 0).toLocaleString(),
            "Days of Inventory": item.days_of_inventory !== undefined ? Number(item.days_of_inventory) : "-",
            "Suggested Order Qty (estimate)": suggestedOrderQty(item).toLocaleString(),
            "Risk Status": item.stockout_risk_status || (Number(item.days_of_inventory ?? 0) <= 6 ? "CRITICAL" : "REORDER"),
            "Action Insight": item.action_insight || "-",
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Critical_Stock_Levels_${todayStr}`);
    };

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

    const handleExportExpiryWatch = () => {
        const rows = getExpiryRows(batchExpiryNeo).map((row) => ({
            "Product": row.product,
            "Batch": row.batch || "-",
            "Branch": row.branch,
            "Expiry Date": row.expiry.toLocaleDateString("en-GB"),
            "Days Remaining": row.daysRemaining,
            "Qty Balance": row.qty.toLocaleString(),
            "Cost Value (KES)": row.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            "Action Status": row.action,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Expiry_Watch_Stock_${todayStr}`);
    };

    const handleExportSlowMovingStock = () => {
        const rows = sortSlowMovingRows(buildSlowMovingRows(slowMovingStock), sortField, sortDesc).map((item) => ({
            "Item Name": item.name,
            "Item Code": item.itemCode,
            "Category": item.category,
            "Branch": item.branch,
            "Stock Qty": item.stockQty.toLocaleString(),
            [`Sold (${lookbackDays}D)`]: item.unitsSold.toLocaleString(),
            "Days Cover": formatSlowDaysCover(item.daysCover),
            "Unit Avg Cost (KES)": item.unitAvgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            "Tied-Up Capital (KES)": item.tiedUpCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            "Status": item.statusLabel,
            "Action Insight": item.actionInsight || "-",
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Slow_Moving_Stock_${todayStr}`);
    };

    const imbalanceCounts = useMemo(() => {
        const list = buildTransferSuggestions(imbalances, lookbackDays);
        const deficit = list.filter((item) => item.deficit).length;
        return { deficit, surplus: list.length - deficit };
    }, [imbalances, lookbackDays]);

    const handleExportImbalanceAlerts = () => {
        const suggestions = filterTransferSuggestions(buildTransferSuggestions(imbalances, lookbackDays), imbalanceStatusFilter);
        const rows = suggestions.map((a) => ({
            "Product": a.product,
            "Item Code": a.itemCode,
            "Category": a.group,
            "Branch": a.branch,
            "Status": a.deficit ? "Deficit" : "Surplus",
            "Imbalance Gap %": Number(a.gap.toFixed(1)),
            "Branch Stock": a.stock.toLocaleString(),
            "Company Stock": a.companyStock.toLocaleString(),
            "Stock Share %": Number(a.stockShare.toFixed(1)),
            "Branch Sales": a.sales.toLocaleString(),
            "Company Sales": a.companySales.toLocaleString(),
            "Sales Share %": Number(a.salesShare.toFixed(1)),
            "Rec. Transfer Units": a.qty.toLocaleString(),
            "Network Counterpart": a.networkContext,
            "Action": a.actionInsight,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `InterBranch_Transfer_Suggestions_${todayStr}`);
    };

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

                    <Section rightClickBtn={toggleRightColumn} />

                    <Row>
                        <Col xl={12}>
                            <WidgetsOne />
                        </Col>
                    </Row>

                    <Row>
                        <Col xl={12}>
                            <Card id="critical-stock-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <div>
                                            <h4 className="card-title mb-1">
                                                Critical Stock Levels - MUST-NOT STOCKOUT items
                                            </h4>
                                            <p className="text-muted mb-0 small">
                                                Class A items (top sellers making up about 80% of revenue over 90 days) at risk
                                                {criticalStockouts.length > 0 && ` · ${criticalStockouts.length.toLocaleString()} items`}
                                            </p>
                                        </div>
                                        <CardExportButtons
                                            targetId="critical-stock-card"
                                            title="Critical Stock Levels"
                                            onExport={handleExportCriticalStock}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <CriticalStockChart />
                                </CardBody>
                            </Card>
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
                    <Row>
                        <Col xl={12}>
                            <Card id="expiry-watch-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">EXPIRY WATCH - EXPIRED &amp; WRITE-OFF RISK</h4>
                                        <CardExportButtons
                                            targetId="expiry-watch-card"
                                            title="Expiry Watch"
                                            onExport={handleExportExpiryWatch}
                                        />
                                    </div>
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
                        <Col xl={12}>
                            <Card id="slow-moving-stock-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">SLOW MOVING STOCK ({lookbackDays} DAYS)</h4>
                                        <CardExportButtons
                                            targetId="slow-moving-stock-card"
                                            title="Slow Moving Stock"
                                            onExport={handleExportSlowMovingStock}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted mb-3 small">
                                        Dead stock: no sales in {lookbackDays} days. Slow: over 180 days of stock on hand, or under 5% sold.
                                        {slowMovingStock.length >= SLOW_MOVER_TOP_N && SLOW_MOVER_TOP_N > 0 && ` Top ${SLOW_MOVER_TOP_N} by capital tied up.`}
                                    </p>
                                    <div id="users">
                                        <Row className="mb-3 align-items-center g-2">
                                            <Col>
                                                <input
                                                    className="form-control"
                                                    placeholder="Search by item name, code, category, or branch..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </Col>

                                            <Col xs="auto">
                                                <button
                                                    type="button"
                                                    className={`btn ${sortField === "name" ? "btn-primary" : "btn-outline-secondary"}`}
                                                    onClick={() => handleSlowMovingSort("name")}
                                                >
                                                    Sort by Name{renderSlowSortIcon("name")}
                                                </button>
                                            </Col>
                                            <Col xs="auto">
                                                <button
                                                    type="button"
                                                    className={`btn ${sortField === "tiedUpCapital" ? "btn-primary" : "btn-outline-secondary"}`}
                                                    onClick={() => handleSlowMovingSort("tiedUpCapital")}
                                                >
                                                    Sort by Capital{renderSlowSortIcon("tiedUpCapital")}
                                                </button>
                                            </Col>
                                        </Row>
                                        <SlowMovingStock
                                            searchTerm={searchTerm}
                                            sortField={sortField}
                                            sortDesc={sortDesc}
                                            onSort={handleSlowMovingSort}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={12}>
                            <Card id="imbalance-alerts-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">INTER-BRANCH TRANSFER SUGGESTIONS</h4>
                                        <CardExportButtons
                                            targetId="imbalance-alerts-card"
                                            title="Inter-Branch Imbalance Alerts"
                                            onExport={handleExportImbalanceAlerts}
                                        />
                                    </div>
                                </CardHeader>

                                <CardBody>
                                    <p className="text-muted mb-3 small">Branches holding over 20% more or less of an item's stock than their share of its sales. These are suggestions only; no transfer has been raised.</p>

                                    <Row className="mb-3 align-items-center g-2">
                                        <Col>
                                            <input
                                                className="form-control"
                                                placeholder="Search by product, branch, category, or code..."
                                                value={imbalanceSearchTerm}
                                                onChange={(e) => setImbalanceSearchTerm(e.target.value)}
                                            />
                                        </Col>

                                        <Col xs="auto">
                                            <div className="btn-group" role="group" aria-label="Filter by imbalance status">
                                                {IMBALANCE_STATUS_FILTERS.map((tab) => (
                                                    <button
                                                        key={tab.key}
                                                        type="button"
                                                        className={`btn ${imbalanceStatusFilter === tab.key ? "btn-primary" : "btn-outline-secondary"}`}
                                                        onClick={() => setImbalanceStatusFilter(tab.key)}
                                                    >
                                                        {tab.label}
                                                        {tab.key !== "ALL" && (
                                                            <span className="badge bg-light text-body ms-1">
                                                                {tab.key === "DEFICIT" ? imbalanceCounts.deficit : imbalanceCounts.surplus}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                    <ImbalanceAlerts
                                        searchTerm={imbalanceSearchTerm}
                                        statusFilter={imbalanceStatusFilter}
                                    />
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