import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Section from "../Section";
import FilterActions from "../FilterActions";
import SlowMovingStockComponent from "../components/SlowMovingStock";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import { exportToExcel } from "../../../helpers/export_helper";
import {
    fetchBranches,
    fetchKPISlowMovingStock,
} from "../../../slices/dashboardStock/thunk";
import { applyFilters, syncDraftFilters } from "../../../slices/dashboardStock/reducer";
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from "../../../helpers/branch_helper";
import {
    buildSlowMovingRows,
    sortSlowMovingRows,
    formatSlowDaysCover,
    getLookbackDays,
    SLOW_MOVER_TOP_N,
} from "../../utils/StockInventoryUtils";

const SlowMovingStockPage = () => {
    document.title = "Slow Moving Stock | phAMACore Analytics";

    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("tiedUpCapital");
    const [sortDesc, setSortDesc] = useState(true);

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
        slowMovingStock = [],
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

    useEffect(() => {
        if (urlBranchCode !== null) {
            saveActiveBranch("stock", urlBranchCode);
            dispatch(applyFilters({ branch: urlBranchCode }));
            return;
        }

        const persistedBranch = getActiveBranch("stock") ?? 0;
        dispatch(applyFilters({ branch: persistedBranch }));
        setSearchParams({ branch: String(persistedBranch) }, { replace: true });
    }, [dispatch, urlBranchCode, setSearchParams]);

    useEffect(() => {
        dispatch(fetchBranches({ clientid: 1 }));
    }, [dispatch]);

    useEffect(() => {
        const branchcode = branchCode || 0;
        const health = {
            clientid: 1,
            branchcode,
            LookbackDays: lookbackDays,
            AsOfDate: activeFilters.endDate,
        };

        dispatch(fetchKPISlowMovingStock({ ...health, GroupBy: "SLOW_MOVERS", TopN: SLOW_MOVER_TOP_N }));
    }, [dispatch, branchCode, activeFilters.endDate, lookbackDays]);

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
                        title="Slow Moving Stock"
                        pageTitle="Inventory/Stock"
                        subtitle={isBranchView ? branchDisplayName : "All Branches"}
                    />

                    <Section
                        title="SLOW MOVING STOCK"
                        rightClickBtn={toggleRightColumn}
                        onExportExcel={handleExportSlowMovingStock}
                    />

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
                                        <SlowMovingStockComponent
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

export default SlowMovingStockPage;
