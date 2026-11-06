import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
    fetchKPIBranchOrderFillRate,
    fetchKPIBranchTransfers,
    fetchKPICriticalStockouts,
    fetchKPIImbalances,
    fetchKPISalesTransactions,
    fetchKPISellThroughAnalysis,
    fetchKPISlowMovingStock,
    fetchKPIStockHealth,
    fetchKPITotalStockValueByBranch,
} from '../../slices/dashboardStock/thunk';
import { setBranch, applyFilters, syncDraftFilters } from '../../slices/dashboardStock/reducer';
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from '../../helpers/branch_helper';

import CriticalStockChart from './components/CriticalStockChart';
import SlowMovingStock from "./components/SlowMovingStock";
import ImbalanceAlerts from './components/ImbalanceAlerts';
import SellThroughSection, {
    RECEIPT_TYPE_FILTERS,
    SELL_THROUGH_VIEW_MODES,
    normalizeSellThroughBatchRows,
    normalizeSellThroughSkuRows,
} from './components/SellThroughSection';
import BranchOfrSection, { OFR_TABS } from './components/BranchOfrSection';
import BranchTransfersSection from './components/BranchTransfersSection';
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
    getImbalanceBranches,
    IMBALANCE_STATUS_FILTERS,
    getExpiryRows,
    getLookbackDays,
    CRITICAL_TOP_N,
    IMBALANCE_TOP_N,
    SLOW_MOVER_TOP_N,
} from '../utils/StockInventoryUtils';
import { addDaysApi, parseApiDate } from '../utils/dateHelper';
import { pick, num } from '../utils/apiRow';

const DashboardStock = () => {
    document.title = "Inventory/Stock Dashboard | phAMACore Analytics";

    const [searchTerm, setSearchTerm] = useState("");
    // Slow moving stock: sort by column, most capital tied up first by default
    const [sortField, setSortField] = useState("tiedUpCapital");
    const [sortDesc, setSortDesc] = useState(true);

    const [imbalanceSearchTerm, setImbalanceSearchTerm] = useState("");
    // Transfer suggestions: keep the API severity ranking, filter by Deficit / Surplus and Branch
    const [imbalanceStatusFilter, setImbalanceStatusFilter] = useState("ALL");
    const [imbalanceBranchFilter, setImbalanceBranchFilter] = useState("");

    // Row 25: Time taken to sell stock (Sell-Through Analysis)
    const [sellThroughViewMode, setSellThroughViewMode] = useState("RECEIPT_BATCH");
    const [sellThroughReceiptType, setSellThroughReceiptType] = useState("ALL");
    const [sellThroughSearchTerm, setSellThroughSearchTerm] = useState("");

    // Row 26: Branch Order Fill Rate (OFR from LPOs made to Syokimau)
    const [ofrActiveTab, setOfrActiveTab] = useState("BRANCH_OFR");
    const [ofrSearchTerm, setOfrSearchTerm] = useState("");

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

    const getImbalanceTabBtnClass = (key) => {
        const isActive = imbalanceStatusFilter === key;
        if (key === "DEFICIT") return isActive ? "btn-danger" : "btn-outline-danger";
        if (key === "SURPLUS") return isActive ? "btn-success" : "btn-outline-success";
        return isActive ? "btn-caramel" : "btn-outline-caramel";
    };

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
        batchExpiryNeo = [],
        branches = [],
        criticalStockouts = [],
        totalStockValueByBranch = [],
        kpiSalesTransactions = [],
        kpiSalesPeriodDays = 1,
        slowMovingStock = [],
        imbalances = [],
        sellThroughReceiptBatch = [],
        sellThroughSkuSummary = [],
        branchOrderFillRateByBranch = [],
        branchOrderFillRateDrilldown = [],
        branchOrderFillRateTopShortages = [],
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

    const formatDisplay = (date) => date || "";

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
    // filtered by the selected branch.
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

    // Movement-based figures: follow the branch and the date filter.
    // The per-line closing stock and stock movement downloads were dropped: the stock health
    // endpoint already returns the KPIs and transfer suggestions that were derived from them.
    useEffect(() => {
        const branchcode = branchCode || 0;
        const health = {
            clientid: 1,
            branchcode,
            LookbackDays: lookbackDays,
            AsOfDate: activeFilters.endDate,
        };
        const periodParams = {
            clientid: 1,
            startDate: activeFilters.startDate,
            endDate: activeFilters.endDate,
            branchcode,
            TopN: 500,
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
        dispatch(fetchKPISellThroughAnalysis({ ...periodParams, GroupBy: "RECEIPT_BATCH" }));
        dispatch(fetchKPISellThroughAnalysis({ ...periodParams, GroupBy: "SKU_SUMMARY" }));
        dispatch(fetchKPIBranchOrderFillRate({ ...periodParams, GroupBy: "SUMMARY" }));
        dispatch(fetchKPIBranchOrderFillRate({ ...periodParams, GroupBy: "BRANCH_OFR" }));
        dispatch(fetchKPIBranchOrderFillRate({ ...periodParams, GroupBy: "TOP_SHORTAGES" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "SUMMARY" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "BRANCH_BALANCE" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "IN_TRANSIT" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "TOP_SKUS" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "DRILLDOWN" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "DEST_STOCK_AGING" }));
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
        const rows = getExpiryRows(batchExpiryNeo, {
            branchCode,
            branches,
            asOfDate: activeFilters.endDate,
        }).map((row) => ({
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

    const imbalanceBranches = useMemo(
        () => getImbalanceBranches(imbalances),
        [imbalances]
    );

    useEffect(() => {
        if (imbalanceBranchFilter && !imbalanceBranches.includes(imbalanceBranchFilter)) {
            setImbalanceBranchFilter("");
        }
    }, [imbalanceBranches, imbalanceBranchFilter]);

    const imbalanceCounts = useMemo(() => {
        const list = buildTransferSuggestions(imbalances, lookbackDays).filter(
            (item) => !imbalanceBranchFilter || item.branch === imbalanceBranchFilter
        );
        const deficit = list.filter((item) => item.deficit).length;
        return { deficit, surplus: list.length - deficit };
    }, [imbalances, lookbackDays, imbalanceBranchFilter]);

    const handleExportImbalanceAlerts = () => {
        const suggestions = filterTransferSuggestions(
            buildTransferSuggestions(imbalances, lookbackDays),
            imbalanceStatusFilter,
            imbalanceBranchFilter
        );
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
            "Required Transfer Units": a.qty.toLocaleString(),
            "Network Counterpart": a.networkContext,
            "Action": a.actionInsight,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `InterBranch_Transfer_Suggestions_${todayStr}`);
    };

    const handleExportSellThrough = () => {
        const source =
            sellThroughViewMode === "SKU_SUMMARY"
                ? normalizeSellThroughSkuRows(sellThroughSkuSummary)
                : normalizeSellThroughBatchRows(sellThroughReceiptBatch);
        const rows = source.map((r) => ({
            "Product": r.itemName,
            "Item Code": r.itemCode,
            "Pack Size": r.packQty,
            "Branch": r.branchName,
            "Receipt Type": r.receiptType,
            "Receipt Voucher": r.receiptDoc,
            "Receipt Date": r.receiptDateFormatted,
            "Batch": r.batchNo || "-",
            "Qty Received (Packs)": r.qtyReceivedWp,
            "Qty Sold Since Receipt (Packs)": r.qtySoldWp,
            "Current Balance (Packs)": r.currentBranchStockWp,
            "Days Held": r.daysHeld,
            "Actual Sell-Through Days": r.actualSellThroughDays ?? "In progress",
            "Estimated Stock Cover Days": r.estimatedCoverDays ?? "-",
            "Status": r.batchStatus,
            "Action Insight": r.actionInsight || "-",
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Sell_Through_Analysis_${todayStr}`);
    };

    const handleExportBranchOfr = () => {
        let source = branchOrderFillRateByBranch;
        if (ofrActiveTab === "ORDER_DRILLDOWN") source = branchOrderFillRateDrilldown;
        else if (ofrActiveTab === "TOP_SHORTAGES") source = branchOrderFillRateTopShortages;
        const rows = (Array.isArray(source) ? source : []).map((r) => ({ ...r }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Branch_Order_Fill_Rate_${ofrActiveTab}_${todayStr}`);
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
                                                Pareto Class ABC items (top revenue sellers) at risk
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
                                        {slowMovingStock.length > 0 && ` · ${slowMovingStock.length.toLocaleString()} items`}
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
                                                    className={`btn ${sortField === "name" ? "btn-caramel" : "btn-outline-caramel"}`}
                                                    onClick={() => handleSlowMovingSort("name")}
                                                >
                                                    Sort by Name{renderSlowSortIcon("name")}
                                                </button>
                                            </Col>
                                            <Col xs="auto">
                                                <button
                                                    type="button"
                                                    className={`btn ${sortField === "tiedUpCapital" ? "btn-caramel" : "btn-outline-caramel"}`}
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
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                        <p className="text-muted mb-0 small">
                                            Branches with a difference 20% of an item's stock against its sales. These are suggestions only; no transfer has been raised.
                                        </p>

                                        <div className="d-flex align-items-center gap-2 ms-auto">
                                            <label
                                                htmlFor="imbalance-branch-filter"
                                                className="text-muted small mb-0 text-nowrap fw-medium"
                                            >
                                                <i className="ri-filter-3-line me-1 align-middle"></i>
                                                Branch:
                                            </label>
                                            <select
                                                id="imbalance-branch-filter"
                                                className="form-select form-select-sm"
                                                style={{ minWidth: "180px", width: "auto" }}
                                                value={imbalanceBranchFilter}
                                                onChange={(e) => setImbalanceBranchFilter(e.target.value)}
                                                aria-label="Filter imbalances by branch"
                                            >
                                                <option value="">All Branches</option>
                                                {imbalanceBranches.map((branchName) => (
                                                    <option key={branchName} value={branchName}>
                                                        {branchName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

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
                                                        className={`btn ${getImbalanceTabBtnClass(tab.key)}`}
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
                                        branchFilter={imbalanceBranchFilter}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* ROW 25: TIME TAKEN TO SELL STOCK (SELL-THROUGH ANALYSIS) */}
                    <Row>
                        <Col xl={12}>
                            <Card id="sell-through-analysis-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <div>
                                            <h4 className="card-title mb-1">
                                                TIME TAKEN TO SELL STOCK — SELL-THROUGH &amp; BATCH DEPLETION
                                            </h4>
                                            <p className="text-muted mb-0 small">
                                                Purchase &amp; transfer receipt dates, quantity received vs sold, current balance, days held, and actual sell-through time vs estimated stock cover
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <div className="btn-group btn-group-sm" role="group" aria-label="Sell-through view mode">
                                                {SELL_THROUGH_VIEW_MODES.map((m) => (
                                                    <button
                                                        key={m.key}
                                                        type="button"
                                                        className={`btn ${
                                                            sellThroughViewMode === m.key
                                                                ? "btn-primary"
                                                                : "btn-outline-primary"
                                                        }`}
                                                        onClick={() => setSellThroughViewMode(m.key)}
                                                    >
                                                        {m.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <CardExportButtons
                                                targetId="sell-through-analysis-card"
                                                title="Time Taken to Sell Stock"
                                                onExport={handleExportSellThrough}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <Row className="mb-3 align-items-center g-2">
                                        <Col md={5}>
                                            <input
                                                className="form-control form-control-sm"
                                                placeholder="Search product, SKU, batch, receipt voucher, or branch..."
                                                value={sellThroughSearchTerm}
                                                onChange={(e) => setSellThroughSearchTerm(e.target.value)}
                                            />
                                        </Col>
                                        <Col md="auto" className="ms-md-auto">
                                            <div className="btn-group btn-group-sm" role="group" aria-label="Filter by receipt type">
                                                {RECEIPT_TYPE_FILTERS.map((t) => (
                                                    <button
                                                        key={t.key}
                                                        type="button"
                                                        className={`btn ${
                                                            sellThroughReceiptType === t.key
                                                                ? "btn-caramel"
                                                                : "btn-outline-caramel"
                                                        }`}
                                                        onClick={() => setSellThroughReceiptType(t.key)}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                    <SellThroughSection
                                        viewMode={sellThroughViewMode}
                                        receiptTypeFilter={sellThroughReceiptType}
                                        searchTerm={sellThroughSearchTerm}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* ROW 26: OFR FOR BRANCHES (FROM LPOS MADE TO SYOKIMAU) */}
                    <Row>
                        <Col xl={12}>
                            <Card id="branch-ofr-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <div>
                                            <h4 className="card-title mb-1">
                                                BRANCH ORDER FILL RATE (OFR) — LPOS TO SYOKIMAU CENTRAL HUB
                                            </h4>
                                            <p className="text-muted mb-0 small">
                                                Fulfillment fidelity for internal branch LPOs raised to Syokimau (Orders vs Dispatches vs Branch Receipts)
                                            </p>
                                        </div>
                                        <CardExportButtons
                                            targetId="branch-ofr-card"
                                            title="Branch Order Fill Rate"
                                            onExport={handleExportBranchOfr}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <Row className="mb-3 align-items-center g-2">
                                        <Col md={5}>
                                            <input
                                                className="form-control form-control-sm"
                                                placeholder="Search branch, LPO voucher, or shortage SKU..."
                                                value={ofrSearchTerm}
                                                onChange={(e) => setOfrSearchTerm(e.target.value)}
                                            />
                                        </Col>
                                        <Col md="auto" className="ms-md-auto">
                                            <div className="btn-group btn-group-sm" role="group" aria-label="OFR view tabs">
                                                {OFR_TABS.map((t) => (
                                                    <button
                                                        key={t.key}
                                                        type="button"
                                                        className={`btn ${
                                                            ofrActiveTab === t.key
                                                                ? "btn-caramel"
                                                                : "btn-outline-caramel"
                                                        }`}
                                                        onClick={() => setOfrActiveTab(t.key)}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                    <BranchOfrSection
                                        activeTab={ofrActiveTab}
                                        searchTerm={ofrSearchTerm}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* ROWS 27 & 28: BRANCH TRANSFERS & BRANCH PULL TO SYOKIMAU */}
                    <BranchTransfersSection />

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
