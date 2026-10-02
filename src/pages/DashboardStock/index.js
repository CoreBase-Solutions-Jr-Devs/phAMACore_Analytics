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
    fetchDailyClosingStock,
    fetchKPICriticalStockouts,
    fetchKPISalesTransactions,
    fetchKPISlowMovingStock,
    fetchKPIStockHealth,
    fetchKPITotalStockValueByBranch,
    fetchStockMovements
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
import { useImbalanceEngine } from './components/ImbalanceAlerts/useImbalanceEngine';
import { transformStockVsSalesVelocity, getPeriodDays } from './Charts/Custom/util/chartTransforms';

const DashboardStock = () => {
    document.title = "Inventory/Stock Dashboard | phAMACore Analytics";

    const [searchTerm, setSearchTerm] = useState("");
    const [sortAscending, setSortAscending] = useState(true);

    const [imbalanceSearchTerm, setImbalanceSearchTerm] = useState("");
    const [imbalanceSortAscending, setImbalanceSortAscending] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { branchId } = useParams();

    const branchCode = branchId ? Number(branchId) : null;
    const isBranchView = !!branchCode;

    const {
        stockMovements = [],
        dailyClosingStock = [],
        batchExpiryNeo = [],
        branches = [],
        criticalStockouts = [],
        totalStockValueByBranch = [],
        kpiSalesTransactions = [],
        kpiSalesPeriodDays = 1,
        slowMovingStock = [],
        filters = {},
    } = useSelector((state) => state.StockInventory ?? {});

    const branchDisplayName = isBranchView
        ? cleanBranchName(resolveBranchName(branchCode, branches, stockMovements))
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
        dispatch(fetchKPITotalStockValueByBranch({
            clientid: 1,
            whichcost: 1,
            IncludeBlocked: false,
            branchcode: branchCode || null,
        }));
        dispatch(fetchKPIStockHealth({
            clientid: 1,
            branchcode: branchCode || null,
        }));
        dispatch(fetchKPICriticalStockouts({
            clientid: 1,
            branchcode: branchCode || null,
            GroupBy: "CRITICAL_STOCKOUTS",
            TopN: 30,
            AsOfDate: filters.endDate,
        }));
        dispatch(fetchKPISlowMovingStock({
            clientid: 1,
            branchcode: branchCode || null,
            GroupBy: "SLOW_MOVERS",
            TopN: 50,
            LookbackDays: 30,
            AsOfDate: filters.endDate,
        }));
        // PowerBIStockMovements requires a valid branchcode: use branchCode if available, else default to 1
        dispatch(fetchStockMovements({
            clientid: 1,
            branchcode: branchCode || 1,
            startDate: filters.startDate,
            endDate: filters.endDate,
        }));
        dispatch(fetchKPISalesTransactions({
            clientid: 1,
            startDate: filters.startDate,
            endDate: filters.endDate,
            GroupBy: "BRANCH",
            branchcode: branchCode || null,
        }));
    }, [dispatch, branchCode, filters.startDate, filters.endDate]);

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
            "Days of Inventory": item.days_of_inventory !== undefined ? Number(item.days_of_inventory) : "-",
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
            "Avg Daily Sales (KES)": (velocityData.rawDailySales?.[idx] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
            "Daily Sales (M KES)": velocityData.sales?.[idx] ?? 0,
            "Days of Cover": velocityData.daysCover?.[idx] ?? "-",
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Stock_VS_Sales_Velocity_${todayStr}`);
    };

    const handleExportExpiryWatch = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() + 90);

        const rows = (batchExpiryNeo || [])
            .filter((item) => {
                if (!item.expirydate) return false;
                const exp = new Date(item.expirydate);
                return !isNaN(exp.getTime()) && exp >= today && exp <= cutoff;
            })
            .map((item) => {
                const qty = Number(item.qtyBal || 0);
                const val = Number(item.costValue || 0);
                const exp = new Date(item.expirydate);
                const daysRemaining = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
                let action = "Prioritise Sales";
                if (daysRemaining <= 30) action = "Promote now";
                else if (daysRemaining <= 60) action = "Transfer/Promote";

                return {
                    "Product": item.invName || item.itemName || "",
                    "Branch": cleanBranchName(item.branchName || item.branch_name || ""),
                    "Expiry Date": exp.toLocaleDateString("en-GB"),
                    "Days Remaining": daysRemaining,
                    "Qty Balance": qty.toLocaleString(),
                    "Cost Value (KES)": val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    "Action Status": action,
                };
            });
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Expiry_Watch_Stock_${todayStr}`);
    };

    const handleExportSlowMovingStock = () => {
        const rows = (slowMovingStock || []).map((item) => {
            const category = item.movement_category || item.status || "SLOW_MOVER";
            let statusLabel = "Slow";
            if (category === "DEAD_STOCK" || category === "Dead Stock") statusLabel = "Dead Stock";
            else if (category === "Moderate") statusLabel = "Moderate";

            return {
                "Item Name": item.item_name || item.item_Name || "Unknown Item",
                "Item Code": item.item_code || item.item_Code || "",
                "Branch": cleanBranchName(item.branch_name || item.branchName || ""),
                "Current Stock": item.current_stock_qty !== undefined ? Number(item.current_stock_qty).toLocaleString() : "-",
                "Units Sold (30 Days)": item.units_sold_window !== undefined ? Number(item.units_sold_window).toLocaleString() : (item.totalQty ?? "-"),
                "Tied Up Capital (KES)": item.tied_up_capital !== undefined ? Number(item.tied_up_capital).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
                "Movement Status": statusLabel,
                "Action Insight": item.action_insight || "-",
            };
        });
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Slow_Moving_Stock_${todayStr}`);
    };

    const handleExportImbalanceAlerts = () => {
        const alerts = useImbalanceEngine(dailyClosingStock, stockMovements, batchExpiryNeo) || [];
        const rows = alerts.map((a) => ({
            "Product": a.product || a.itemCode || "",
            "Item Code": a.itemCode || "",
            "Source / From": a.fromBranch || a.from || "",
            "Destination / To": a.toBranch || a.to || "",
            "Transfer / Difference Units": a.suggestedTransfer || a.diff || 0,
            "Urgency Status": a.statusLabel || a.status || "",
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `InterBranch_Imbalance_Alerts_${todayStr}`);
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
                                                Class A Revenue Drivers at Risk
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
                                                ? `Stock VS Sales Velocity - ${branchDisplayName}`
                                                : "Stock VS Sales Velocity - Branch Coverage Ratio"}
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
                                        <h4 className="card-title mb-0">EXPIRY WATCH - WRITE-OFF RISK</h4>
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
                        <Col lg={5}>
                            <Card className="card-height-100" id="slow-moving-stock-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">SLOW MOVING STOCK (30 DAYS)</h4>
                                        <CardExportButtons
                                            targetId="slow-moving-stock-card"
                                            title="Slow Moving Stock"
                                            onExport={handleExportSlowMovingStock}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted text-truncate mb-3">Low Sales Velocity Items (30 Days)</p>
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
                                                searchTerm={searchTerm}
                                                sortAscending={sortAscending}
                                            />
                                        </SimpleBar>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg={7}>
                            <Card className="card-height-100" id="imbalance-alerts-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">INTER-BRANCH IMBALANCE ALERTS</h4>
                                        <CardExportButtons
                                            targetId="imbalance-alerts-card"
                                            title="Inter-Branch Imbalance Alerts"
                                            onExport={handleExportImbalanceAlerts}
                                        />
                                    </div>
                                </CardHeader>

                                <CardBody>
                                    <p className="text-muted text-truncate mb-3">Products where one branch is overstocked while another is critically low.</p>

                                    <Row className="mb-3 align-items-center g-2">
                                        <Col>
                                            <input
                                                className="form-control"
                                                placeholder="Search by product, branch, or code..."
                                                value={imbalanceSearchTerm}
                                                onChange={(e) => setImbalanceSearchTerm(e.target.value)}
                                            />
                                        </Col>

                                        <Col xs="auto">
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => setImbalanceSortAscending((prev) => !prev)}
                                                title={imbalanceSortAscending ? "Sort A–Z" : "Sort Z–A"}
                                            >
                                                {imbalanceSortAscending ? "A–Z ▲" : "Z–A ▼"}
                                            </button>
                                        </Col>
                                    </Row>

                                    <SimpleBar style={{ height: "242px" }} className="mx-n3 px-3">
                                        <ImbalanceAlerts
                                            stock={dailyClosingStock}
                                            movements={stockMovements}
                                            expiry={batchExpiryNeo}
                                            searchTerm={imbalanceSearchTerm}
                                            sortAscending={imbalanceSortAscending}
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