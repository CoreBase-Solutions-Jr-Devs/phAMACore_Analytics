import React, { useEffect, useMemo, useState } from "react";
import { Spinner, Modal, ModalHeader, ModalBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import FloatingTooltip from "../../../Components/Common/FloatingTooltip";
import TablePagination from "../../../Components/Common/TablePagination";
import { fetchKPISellThroughAnalysis } from "../../../slices/dashboardStock/thunk";
import { cleanBranchName } from "../../../helpers/branch_helper";
import { pick, num } from "../../utils/apiRow";

const MAX_ROWS = 50;

export const RECEIPT_TYPE_FILTERS = [
    { key: "ALL", label: "All Receipts" },
    { key: "SUPPLIER", label: "Supplier Purchases" },
    { key: "TRANSFER", label: "Transfer Receipts" },
];

export const SELL_THROUGH_VIEW_MODES = [
    { key: "RECEIPT_BATCH", label: "Batch Consignments" },
    { key: "SKU_SUMMARY", label: "SKU Summary" },
];

const formatDateShort = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).slice(0, 10);
    return d.toLocaleDateString("en-GB");
};

export const normalizeSellThroughBatchRows = (rows = []) =>
    (Array.isArray(rows) ? rows : []).map((row, idx) => {
        const itemCode = String(pick(row, "item_code", "itemCode") || "");
        const itemName = String(pick(row, "item_name", "itemName") || itemCode || "Unknown SKU");
        const branchCode = String(pick(row, "branch_code", "branchCode", "branch_id") || "");
        const branchName = cleanBranchName(
            pick(row, "branch_name", "branchName") || (branchCode ? `Branch ${branchCode}` : "All Branches")
        );
        const packQty = Math.max(num(pick(row, "pack_qty", "packQty")) || 1, 1);
        const receiptType = String(pick(row, "receipt_type", "receiptType") || "SUPPLIER").toUpperCase();
        const receiptDoc = String(pick(row, "receipt_doc_number", "receiptDocNumber") || "-");
        const receiptDate = pick(row, "receipt_date", "receiptDate");
        const sourceEntity = String(pick(row, "source_entity_name", "sourceEntityName") || "-");
        const batchNo = String(pick(row, "batch_number", "batchNumber") || "-");
        const expiryDate = pick(row, "expiry_date", "expiryDate");

        const qtyReceivedWp = num(pick(row, "qty_received_wp", "qtyReceivedWp", "qty_received_pcs"));
        const qtyReceivedPcs = num(pick(row, "qty_received_pcs", "qtyReceivedPcs"));
        const qtySoldWp = num(
            pick(row, "allocated_retail_sold_wp", "allocated_consumed_wp", "allocated_retail_sold_pcs")
        );
        const qtyTransferredWp = num(pick(row, "allocated_transferred_wp", "allocated_transferred_pcs"));
        const batchRemainingWp = num(pick(row, "batch_balance_remaining_wp", "batch_balance_remaining_pcs"));
        const currentBranchStockWp = num(pick(row, "current_branch_stock_wp", "current_branch_stock_pcs"));
        const receiptTotalCost = num(pick(row, "receipt_total_cost", "batch_remaining_value_cost"));
        const remainingCost = num(pick(row, "batch_remaining_value_cost"));

        const daysHeld = num(pick(row, "days_held", "daysHeld"));
        const actualSellThroughRaw = pick(row, "actual_sell_through_days", "actualSellThroughDays");
        const actualSellThroughDays =
            actualSellThroughRaw !== null && actualSellThroughRaw !== undefined && actualSellThroughRaw !== ""
                ? num(actualSellThroughRaw)
                : null;
        const estimatedCoverRaw = pick(row, "estimated_stock_cover_days", "estimatedStockCoverDays");
        const estimatedCoverDays =
            estimatedCoverRaw !== null && estimatedCoverRaw !== undefined && estimatedCoverRaw !== ""
                ? num(estimatedCoverRaw)
                : null;
        const dailyRunRate = num(pick(row, "daily_run_rate", "dailyRunRate"));
        const batchStatus = String(pick(row, "batch_status", "batchStatus") || "ACTIVE").toUpperCase();
        const clearingSummary = String(pick(row, "clearing_transactions_summary") || "");
        const actionInsight = String(pick(row, "action_insight", "actionInsight") || "");

        return {
            id: `${pick(row, "lot_id") || idx}-${itemCode}-${branchCode}-${idx}`,
            lotId: pick(row, "lot_id"),
            itemCode,
            itemName,
            branchCode,
            branchName,
            packQty,
            receiptType,
            receiptDoc,
            receiptDate,
            receiptDateFormatted: formatDateShort(receiptDate),
            sourceEntity,
            batchNo,
            expiryDateFormatted: formatDateShort(expiryDate),
            qtyReceivedWp,
            qtyReceivedPcs,
            qtySoldWp,
            qtyTransferredWp,
            batchRemainingWp,
            currentBranchStockWp,
            receiptTotalCost,
            remainingCost,
            daysHeld,
            actualSellThroughDays,
            estimatedCoverDays,
            dailyRunRate,
            batchStatus,
            clearingSummary,
            actionInsight,
        };
    });

export const normalizeSellThroughSkuRows = (rows = []) =>
    (Array.isArray(rows) ? rows : []).map((row, idx) => {
        const itemCode = String(pick(row, "item_code", "itemCode") || "");
        const itemName = String(pick(row, "item_name", "itemName") || itemCode || "Unknown SKU");
        const branchCode = String(pick(row, "branch_code", "branchCode", "branch_id") || "");
        const branchName = cleanBranchName(
            pick(row, "branch_name", "branchName") || (branchCode ? `Branch ${branchCode}` : "All Branches")
        );
        const packQty = Math.max(num(pick(row, "pack_qty", "packQty")) || 1, 1);
        const receiptType = String(pick(row, "last_receipt_type", "receipt_type") || "-").toUpperCase();
        const receiptDoc = String(pick(row, "last_receipt_doc_number") || "-");
        const receiptDate = pick(row, "last_receipt_date");

        const qtyReceivedWp = num(pick(row, "last_receipt_qty_wp", "last_receipt_qty_pcs"));
        const qtySoldWp = num(pick(row, "allocated_retail_sold_wp", "allocated_consumed_wp"));
        const currentBranchStockWp = num(pick(row, "current_stock_on_hand_wp", "current_stock_whole_packs"));
        const wholePacks = num(pick(row, "current_stock_whole_packs"));
        const loosePieces = num(pick(row, "current_stock_loose_pieces"));
        const currentStockValue = num(pick(row, "current_stock_value"));
        const daysHeld = num(pick(row, "days_since_last_receipt"));
        const actualSellThroughRaw = pick(row, "last_batch_sell_through_days");
        const actualSellThroughDays =
            actualSellThroughRaw !== null && actualSellThroughRaw !== undefined && actualSellThroughRaw !== ""
                ? num(actualSellThroughRaw)
                : null;
        const estimatedCoverRaw = pick(row, "estimated_stock_cover_days");
        const estimatedCoverDays =
            estimatedCoverRaw !== null && estimatedCoverRaw !== undefined && estimatedCoverRaw !== ""
                ? num(estimatedCoverRaw)
                : null;
        const batchStatus = String(pick(row, "stock_health_status") || "ACTIVE").toUpperCase();
        const actionInsight = String(pick(row, "action_insight") || "");

        return {
            id: `sku-${itemCode}-${branchCode}-${idx}`,
            itemCode,
            itemName,
            branchCode,
            branchName,
            packQty,
            receiptType,
            receiptDoc,
            receiptDateFormatted: formatDateShort(receiptDate),
            qtyReceivedWp,
            qtySoldWp,
            batchRemainingWp: currentBranchStockWp,
            currentBranchStockWp,
            wholePacks,
            loosePieces,
            remainingCost: currentStockValue,
            daysHeld,
            actualSellThroughDays,
            estimatedCoverDays,
            batchStatus,
            actionInsight,
        };
    });

const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s.includes("DEPLETED") || s.includes("SOLD_OUT") || s.includes("FAST")) {
        return { tone: "success", label: status || "DEPLETED" };
    }
    if (s.includes("DEAD") || s.includes("EXPIRED")) {
        return { tone: "danger", label: status };
    }
    if (s.includes("SLOW")) {
        return { tone: "warning", label: status };
    }
    return { tone: "info", label: status || "ACTIVE" };
};

const SellThroughSection = ({
    viewMode = "RECEIPT_BATCH",
    receiptTypeFilter = "ALL",
    searchTerm = "",
}) => {
    const dispatch = useDispatch();
    const [hoverInfo, setHoverInfo] = useState(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [sortField, setSortField] = useState("daysHeld");
    const [sortDesc, setSortDesc] = useState(true);
    const [selectedLot, setSelectedLot] = useState(null);

    const {
        sellThroughReceiptBatch = [],
        sellThroughSkuSummary = [],
        sellThroughDepletionDrillDown = [],
        loadingSellThroughAnalysis = false,
        errorSellThroughAnalysis = null,
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDesc((prev) => !prev);
        } else {
            setSortField(field);
            setSortDesc(field !== "itemName");
        }
    };

    const handleOpenDrilldown = (item) => {
        setSelectedLot(item);
        dispatch(
            fetchKPISellThroughAnalysis({
                clientid: 1,
                startDate: activeFilters.startDate,
                endDate: activeFilters.endDate,
                BranchCode: item.branchCode || (activeFilters.branch ? String(activeFilters.branch) : ""),
                ItemCode: item.itemCode,
                GroupBy: "DEPLETION_DRILLDOWN",
                TopN: 200,
            })
        );
    };

    const rows = useMemo(() => {
        const normalized =
            viewMode === "SKU_SUMMARY"
                ? normalizeSellThroughSkuRows(sellThroughSkuSummary)
                : normalizeSellThroughBatchRows(sellThroughReceiptBatch);

        const byReceiptType =
            receiptTypeFilter === "ALL"
                ? normalized
                : normalized.filter((r) => r.receiptType.includes(receiptTypeFilter));

        const term = (searchTerm || "").trim().toLowerCase();
        const searched = term
            ? byReceiptType.filter((r) =>
                  [r.itemName, r.itemCode, r.branchName, r.batchNo, r.receiptDoc, r.sourceEntity, r.batchStatus].some(
                      (f) => String(f || "").toLowerCase().includes(term)
                  )
              )
            : byReceiptType;

        return [...searched].sort((a, b) => {
            if (sortField === "itemName") {
                return sortDesc ? b.itemName.localeCompare(a.itemName) : a.itemName.localeCompare(b.itemName);
            }
            const av = a[sortField] ?? -1;
            const bv = b[sortField] ?? -1;
            return sortDesc ? bv - av : av - bv;
        });
    }, [viewMode, sellThroughReceiptBatch, sellThroughSkuSummary, receiptTypeFilter, searchTerm, sortField, sortDesc]);

    useEffect(() => {
        setPageIndex(0);
    }, [viewMode, receiptTypeFilter, searchTerm, sortField, sortDesc]);

    const pageCount = Math.max(Math.ceil(rows.length / MAX_ROWS), 1);
    const safePageIndex = Math.min(pageIndex, pageCount - 1);
    const pageRows = useMemo(
        () => rows.slice(safePageIndex * MAX_ROWS, (safePageIndex + 1) * MAX_ROWS),
        [rows, safePageIndex]
    );

    const renderSortIcon = (field) => {
        if (sortField !== field) return null;
        return <i className={`ms-1 text-primary ${sortDesc ? "ri-arrow-down-line" : "ri-arrow-up-line"}`}></i>;
    };

    const renderSortableHeader = (field, label, className = "") => (
        <th
            scope="col"
            className={className}
            role="button"
            onClick={() => handleSort(field)}
            style={{ cursor: "pointer", userSelect: "none" }}
        >
            {label}
            {renderSortIcon(field)}
        </th>
    );

    if (loadingSellThroughAnalysis && !rows.length) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center" style={{ minHeight: "180px" }}>
                <Spinner size="sm" color="primary" className="mb-2" />
                <small className="text-muted">Loading sell-through &amp; physical batch depletion data...</small>
            </div>
        );
    }

    if (errorSellThroughAnalysis && !rows.length) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-danger" style={{ minHeight: "180px" }}>
                <i className="ri-error-warning-line display-6 mb-2"></i>
                <small>{String(errorSellThroughAnalysis)}</small>
            </div>
        );
    }

    if (!rows.length) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted" style={{ minHeight: "180px" }}>
                <i className="ri-inbox-line display-6 mb-2"></i>
                <div className="fw-medium">No sell-through records found for this filter</div>
                <small className="text-muted">Try switching Receipt Type or expanding your date range.</small>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <div
                tabIndex={0}
                role="region"
                aria-label="Time taken to sell stock table"
                className="table-responsive"
                style={{ maxHeight: "max(420px, calc(100vh - 350px))", overflowY: "auto" }}
                onMouseLeave={() => setHoverInfo(null)}
            >
                <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                    <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                        <tr>
                            {renderSortableHeader("itemName", "Product / Pack Size")}
                            <th scope="col">Branch</th>
                            <th scope="col">Receipt Date &amp; Source</th>
                            {renderSortableHeader("qtyReceivedWp", "Qty Received (Packs)", "text-end")}
                            {renderSortableHeader("qtySoldWp", "Sold Since Receipt", "text-end")}
                            {renderSortableHeader("currentBranchStockWp", "Current Balance", "text-end")}
                            {renderSortableHeader("daysHeld", "Days Held", "text-end")}
                            {renderSortableHeader("actualSellThroughDays", "Actual Sell-Through", "text-end")}
                            {renderSortableHeader("estimatedCoverDays", "Est. Stock Cover", "text-end")}
                            <th scope="col" className="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((item) => {
                            const badge = getStatusBadge(item.batchStatus);
                            const isTransfer = item.receiptType.includes("TRANSFER");
                            return (
                                <tr key={item.id}>
                                    <th
                                        scope="row"
                                        className="fw-medium"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleOpenDrilldown(item)}
                                        onMouseEnter={(e) =>
                                            setHoverInfo({
                                                title: item.itemName,
                                                badgeColor: "#299cdb",
                                                mainValue: `SKU: ${item.itemCode} · Pack Size: ${item.packQty}`,
                                                mainColor: "#0ab39c",
                                                subText: `Batch: ${item.batchNo || "-"} · Expiry: ${item.expiryDateFormatted || "-"}`,
                                                extraText: item.actionInsight || "Click to inspect physical transaction lineage",
                                                x: e.clientX,
                                                y: e.clientY,
                                            })
                                        }
                                        onMouseMove={(e) =>
                                            setHoverInfo((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
                                        }
                                    >
                                        <span className="text-primary">{item.itemName}</span>
                                        <small className="text-muted d-block fw-normal">
                                            {item.itemCode} · Pack of {item.packQty}
                                            {item.batchNo && item.batchNo !== "-" ? ` · Batch: ${item.batchNo}` : ""}
                                        </small>
                                    </th>
                                    <td>{item.branchName}</td>
                                    <td>
                                        <span className="fw-medium">{item.receiptDateFormatted}</span>
                                        <small className="text-muted d-block">
                                            <span
                                                className={`badge ${
                                                    isTransfer
                                                        ? "bg-info-subtle text-info"
                                                        : "bg-primary-subtle text-primary"
                                                } me-1`}
                                            >
                                                {isTransfer ? "Transfer" : "Supplier"}
                                            </span>
                                            {item.receiptDoc}
                                        </small>
                                    </td>
                                    <td className="text-end fw-semibold">
                                        {item.qtyReceivedWp.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-end text-success fw-medium">
                                        {item.qtySoldWp.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-end fw-semibold">
                                        {item.currentBranchStockWp.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        {viewMode === "RECEIPT_BATCH" && (
                                            <small className="text-muted d-block fw-normal">
                                                Lot bal: {item.batchRemainingWp.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </small>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        <span className="fw-semibold">{item.daysHeld.toLocaleString()}d</span>
                                    </td>
                                    <td className="text-end">
                                        {item.actualSellThroughDays !== null && item.actualSellThroughDays > 0 ? (
                                            <span className="badge bg-success-subtle text-success fs-12">
                                                {item.actualSellThroughDays.toLocaleString()} days (Actual)
                                            </span>
                                        ) : (
                                            <span className="text-muted small">In progress</span>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        {item.estimatedCoverDays !== null ? (
                                            <span className="text-body fw-medium">
                                                {item.estimatedCoverDays >= 999
                                                    ? "999+ days (Est.)"
                                                    : `${Math.round(item.estimatedCoverDays).toLocaleString()} days (Est.)`}
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <span
                                            className={`badge rounded-pill border border-${badge.tone} text-${badge.tone} bg-${badge.tone}-subtle fs-11 fw-normal px-2 py-1`}
                                        >
                                            {badge.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <FloatingTooltip hoverInfo={hoverInfo} />

            <TablePagination
                pageIndex={safePageIndex}
                pageCount={pageCount}
                totalResults={rows.length}
                pageSize={MAX_ROWS}
                onPageChange={setPageIndex}
            />

            <Modal isOpen={Boolean(selectedLot)} toggle={() => setSelectedLot(null)} size="lg" centered>
                <ModalHeader toggle={() => setSelectedLot(null)}>
                    Physical Lot Depletion Lineage — {selectedLot?.itemName} ({selectedLot?.itemCode})
                </ModalHeader>
                <ModalBody>
                    {selectedLot && (
                        <div className="mb-3 p-2 bg-light rounded small d-flex flex-wrap gap-3">
                            <div>
                                <strong>Branch:</strong> {selectedLot.branchName}
                            </div>
                            <div>
                                <strong>Receipt Voucher:</strong> {selectedLot.receiptDoc} ({selectedLot.receiptDateFormatted})
                            </div>
                            <div>
                                <strong>Batch:</strong> {selectedLot.batchNo}
                            </div>
                            <div>
                                <strong>Days Held:</strong> {selectedLot.daysHeld} days
                            </div>
                        </div>
                    )}
                    <div className="table-responsive" style={{ maxHeight: "340px", overflowY: "auto" }}>
                        <table className="table table-sm table-bordered table-nowrap mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Outflow Voucher</th>
                                    <th>Outflow Date</th>
                                    <th>Type</th>
                                    <th className="text-end">Consumed (Packs)</th>
                                    <th className="text-end">Running Depletion %</th>
                                    <th className="text-end">Days to Outflow</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(sellThroughDepletionDrillDown || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-3">
                                            {selectedLot?.clearingSummary || "No outflow transactions recorded for this lot yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    (sellThroughDepletionDrillDown || []).map((d, i) => (
                                        <tr key={i}>
                                            <td className="fw-medium">{pick(d, "outflow_doc_number") || "-"}</td>
                                            <td>{formatDateShort(pick(d, "outflow_date"))}</td>
                                            <td>{pick(d, "outflow_type") || "-"}</td>
                                            <td className="text-end">
                                                {num(pick(d, "allocated_consumed_wp", "allocated_consumed_pcs")).toLocaleString(
                                                    undefined,
                                                    { maximumFractionDigits: 2 }
                                                )}
                                            </td>
                                            <td className="text-end">
                                                {num(pick(d, "running_depletion_pct")).toFixed(1)}%
                                            </td>
                                            <td className="text-end">
                                                {num(pick(d, "days_from_receipt_to_outflow"))}d
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default SellThroughSection;
