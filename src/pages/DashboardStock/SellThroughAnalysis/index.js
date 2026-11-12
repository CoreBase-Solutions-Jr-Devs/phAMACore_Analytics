import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Section from "../Section";
import FilterActions from "../FilterActions";
import SellThroughSection, {
    RECEIPT_TYPE_FILTERS,
    SELL_THROUGH_VIEW_MODES,
    normalizeSellThroughBatchRows,
    normalizeSellThroughSkuRows,
} from "../components/SellThroughSection";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import { exportToExcel } from "../../../helpers/export_helper";
import {
    fetchBranches,
    fetchKPISellThroughAnalysis,
} from "../../../slices/dashboardStock/thunk";
import { applyFilters, syncDraftFilters } from "../../../slices/dashboardStock/reducer";
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from "../../../helpers/branch_helper";

const SellThroughAnalysis = () => {
    document.title = "Sell-Through Analysis | phAMACore Analytics";

    const [sellThroughViewMode, setSellThroughViewMode] = useState("RECEIPT_BATCH");
    const [sellThroughReceiptType, setSellThroughReceiptType] = useState("ALL");
    const [sellThroughSearchTerm, setSellThroughSearchTerm] = useState("");

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
        sellThroughReceiptBatch = [],
        sellThroughSkuSummary = [],
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;
    const branchCode = activeFilters.branch && Number(activeFilters.branch) > 0 ? Number(activeFilters.branch) : 0;
    const isBranchView = branchCode > 0;

    const branchDisplayName = isBranchView
        ? cleanBranchName(resolveBranchName(branchCode, branches))
        : "";

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
        const periodParams = {
            clientid: 1,
            startDate: activeFilters.startDate,
            endDate: activeFilters.endDate,
            branchcode,
            TopN: 500,
        };

        dispatch(fetchKPISellThroughAnalysis({ ...periodParams, GroupBy: "RECEIPT_BATCH" }));
        dispatch(fetchKPISellThroughAnalysis({ ...periodParams, GroupBy: "SKU_SUMMARY" }));
    }, [dispatch, branchCode, activeFilters.startDate, activeFilters.endDate]);

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
            "Qty Received (WP)": r.qtyReceivedWp,
            "Qty Received (Pieces)": r.qtyReceivedPcs,
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
                        title="Sell-Through Analysis"
                        pageTitle="Inventory/Stock"
                        subtitle={isBranchView ? branchDisplayName : "All Branches"}
                    />

                    <Section
                        title="SELL-THROUGH ANALYSIS"
                        rightClickBtn={toggleRightColumn}
                        onExportExcel={handleExportSellThrough}
                    />

                    <Row>
                        <Col xl={12}>
                            <Card id="sell-through-analysis-card" className="mb-2">
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

export default SellThroughAnalysis;
