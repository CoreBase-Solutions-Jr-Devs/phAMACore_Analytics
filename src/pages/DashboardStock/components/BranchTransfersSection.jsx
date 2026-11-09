import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardBody, Col, Row, Spinner } from "reactstrap";
import { useSelector } from "react-redux";
import TablePagination from "../../../Components/Common/TablePagination";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import { exportToExcel } from "../../../helpers/export_helper";
import { cleanBranchName } from "../../../helpers/branch_helper";
import { pick, num } from "../../utils/apiRow";
import { formatCompact } from "../../utils/formatHelper";

const MAX_ROWS = 50;

const formatDateShort = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).slice(0, 10);
    return d.toLocaleDateString("en-GB");
};

const isSyokimauBranch = (code, name) => {
    const c = String(code || "").trim().toUpperCase();
    const n = String(name || "").trim().toUpperCase();
    return c === "1" || c === "BR001" || n.includes("SYOKIMAU");
};

export const normalizeDestStockAging = (rows = []) =>
    (Array.isArray(rows) ? rows : []).map((r, idx) => {
        const destBranchId = pick(r, "dest_branch_id", "branch_id");
        const destBranchCode = String(pick(r, "dest_branch_code", "dest_branch_id") || "");
        const destBranchName = cleanBranchName(
            pick(r, "dest_branch_name", "branch_name") || (destBranchCode ? `Branch ${destBranchCode}` : "-")
        );
        const sourceBranchCode = String(pick(r, "source_branch_code", "source_branch_id") || "");
        const sourceBranchName = cleanBranchName(pick(r, "source_branch_name") || "");
        const itemCode = String(pick(r, "item_code", "itemCode") || "");
        const itemName = String(pick(r, "item_name", "itemName") || itemCode || "Unknown SKU");
        const batchNo = String(pick(r, "batch_number", "batchNo") || "-");
        const transferDoc = String(pick(r, "transfer_doc_number") || "-");
        const transferDate = formatDateShort(pick(r, "transfer_date"));
        const receiptDoc = String(pick(r, "receipt_doc_number") || "-");
        const receiptDate = formatDateShort(pick(r, "receipt_date"));
        const transferredUnits = num(pick(r, "transferred_units", "quantity_pw", "total_units"));
        const transferredCost = num(pick(r, "transferred_cost", "total_cost"));
        const currentBranchStock = num(pick(r, "current_branch_stock"));
        const unitsSoldSinceReceipt = num(pick(r, "units_sold_since_receipt"));
        const daysInStock = num(pick(r, "days_in_stock", "transit_days"));
        const agingBucket = String(pick(r, "aging_bucket") || `${daysInStock}d`);
        const actionInsight = String(pick(r, "action_insight") || "");

        return {
            id: `${transferDoc}-${itemCode}-${destBranchCode}-${idx}`,
            destBranchId,
            destBranchCode,
            destBranchName,
            sourceBranchCode,
            sourceBranchName,
            itemCode,
            itemName,
            batchNo,
            transferDoc,
            transferDate,
            receiptDoc,
            receiptDate,
            transferredUnits,
            transferredCost,
            currentBranchStock,
            unitsSoldSinceReceipt,
            daysInStock,
            agingBucket,
            actionInsight,
        };
    });

export const normalizeDrilldownRows = (rows = []) =>
    (Array.isArray(rows) ? rows : []).map((r, idx) => {
        const sourceBranchCode = String(pick(r, "source_branch_code", "source_branch_id") || "");
        const sourceBranchName = cleanBranchName(pick(r, "source_branch_name") || "-");
        const destBranchCode = String(pick(r, "dest_branch_code", "dest_branch_id") || "");
        const destBranchName = cleanBranchName(pick(r, "dest_branch_name") || "-");
        const itemCode = String(pick(r, "item_code", "itemCode") || "");
        const itemName = String(pick(r, "item_name", "itemName") || itemCode || "Unknown SKU");
        const batchNo = String(pick(r, "batch_number") || "-");
        const transferDoc = String(pick(r, "transfer_doc_number") || "-");
        const transferDate = formatDateShort(pick(r, "transfer_date"));
        const receiptDoc = String(pick(r, "receipt_doc_number") || "-");
        const receiptDate = formatDateShort(pick(r, "receipt_date"));
        const transitDays = num(pick(r, "transit_days"));
        const shipmentStatus = String(pick(r, "shipment_status") || "RECEIVED").toUpperCase();
        const quantityPw = num(pick(r, "quantity_pw", "transferred_units"));
        const totalCost = num(pick(r, "total_cost", "transferred_cost"));

        return {
            id: `dd-${transferDoc}-${itemCode}-${idx}`,
            sourceBranchCode,
            sourceBranchName,
            destBranchCode,
            destBranchName,
            itemCode,
            itemName,
            batchNo,
            transferDoc,
            transferDate,
            receiptDoc,
            receiptDate,
            transitDays,
            shipmentStatus,
            quantityPw,
            totalCost,
        };
    });

const TransferAgingTable = ({
    agingRows = [],
    drilldownRows = [],
    inTransitRows = [],
    branchBalanceRows = [],
    activeTab = "DEST_STOCK_AGING",
    searchTerm = "",
    branchFilter = "",
}) => {
    const [pageIndex, setPageIndex] = useState(0);

    const filteredRows = useMemo(() => {
        const term = (searchTerm || "").trim().toLowerCase();
        const bFilter = (branchFilter || "").trim().toLowerCase();

        let source = [];
        if (activeTab === "DEST_STOCK_AGING") source = agingRows;
        else if (activeTab === "DRILLDOWN") source = drilldownRows;
        else if (activeTab === "IN_TRANSIT") source = inTransitRows;
        else source = branchBalanceRows;

        return (Array.isArray(source) ? source : []).filter((row) => {
            if (bFilter) {
                const destName = String(row.destBranchName || cleanBranchName(pick(row, "dest_branch_name", "branch_name")) || "").toLowerCase();
                const srcName = String(row.sourceBranchName || cleanBranchName(pick(row, "source_branch_name")) || "").toLowerCase();
                if (destName !== bFilter && srcName !== bFilter) return false;
            }
            if (!term) return true;
            return Object.values(row || {}).some((val) => String(val ?? "").toLowerCase().includes(term));
        });
    }, [agingRows, drilldownRows, inTransitRows, branchBalanceRows, activeTab, searchTerm, branchFilter]);

    useEffect(() => {
        setPageIndex(0);
    }, [activeTab, searchTerm, branchFilter, filteredRows.length]);

    const pageCount = Math.max(Math.ceil(filteredRows.length / MAX_ROWS), 1);
    const safePageIndex = Math.min(pageIndex, pageCount - 1);
    const pageRows = useMemo(
        () => filteredRows.slice(safePageIndex * MAX_ROWS, (safePageIndex + 1) * MAX_ROWS),
        [filteredRows, safePageIndex]
    );

    if (!filteredRows.length) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted" style={{ minHeight: "160px" }}>
                <i className="ri-inbox-line display-6 mb-2"></i>
                <div className="fw-medium">No transfer records found</div>
                <small className="text-muted">Try adjusting the branch filter, search query, or date range.</small>
            </div>
        );
    }

    return (
        <>
            <div
                tabIndex={0}
                role="region"
                aria-label="Branch transfers table"
                className="table-responsive"
                style={{ maxHeight: "400px", overflowY: "auto" }}
            >
                {activeTab === "DEST_STOCK_AGING" && (
                    <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                        <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                            <tr>
                                <th>Product / Batch</th>
                                <th>Destination Branch</th>
                                <th>Transfer / Receipt Doc</th>
                                <th className="text-end">Transferred (Packs)</th>
                                <th className="text-end">Transfer Value (KES)</th>
                                <th className="text-end">Sold Since Receipt</th>
                                <th className="text-end">Current Branch Stock</th>
                                <th className="text-end">Days in Stock</th>
                                <th className="text-center">Aging Bucket</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((row) => {
                                const tone =
                                    row.daysInStock > 60 ? "danger" : row.daysInStock > 30 ? "warning" : "success";
                                return (
                                    <tr key={row.id}>
                                        <th scope="row" className="fw-medium">
                                            {row.itemName}
                                            <small className="text-muted d-block fw-normal">
                                                {row.itemCode}
                                                {row.batchNo && row.batchNo !== "-" ? ` · Batch: ${row.batchNo}` : ""}
                                            </small>
                                        </th>
                                        <td>{row.destBranchName}</td>
                                        <td>
                                            <span className="fw-medium">Rcpt: {row.receiptDoc} ({row.receiptDate})</span>
                                            <small className="text-muted d-block">
                                                {row.transferDoc}
                                            </small>
                                        </td>
                                        <td className="text-end fw-semibold">
                                            {row.transferredUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-end fw-semibold">
                                            KES {row.transferredCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="text-end text-success">
                                            {row.unitsSoldSinceReceipt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-end fw-medium">
                                            {row.currentBranchStock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-end fw-semibold">{row.daysInStock.toLocaleString()}d</td>
                                        <td className="text-center">
                                            <span className={`badge bg-${tone}-subtle text-${tone}`}>
                                                {row.agingBucket}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {activeTab === "DRILLDOWN" && (
                    <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                        <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                            <tr>
                                <th>Product / Batch</th>
                                <th>Source Branch</th>
                                <th>Destination Branch</th>
                                <th>BTR</th>
                                <th>BRN</th>
                                <th className="text-end">Qty (P/W)</th>
                                <th className="text-end">Value (KES)</th>
                                <th className="text-end">TOT Days</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((row) => {
                                const isReceived = row.shipmentStatus.includes("RECEIVED");
                                const tone = isReceived ? "success" : "warning";
                                return (
                                    <tr key={row.id}>
                                        <th scope="row" className="fw-medium">
                                            {row.itemName}
                                            <small className="text-muted d-block fw-normal">
                                                {row.itemCode} · Batch: {row.batchNo}
                                            </small>
                                        </th>
                                        <td>{row.sourceBranchName}</td>
                                        <td>{row.destBranchName}</td>
                                        <td>
                                            {row.transferDoc}
                                            <small className="text-muted d-block">{row.transferDate}</small>
                                        </td>
                                        <td>
                                            {row.receiptDoc}
                                            <small className="text-muted d-block">{row.receiptDate}</small>
                                        </td>
                                        <td className="text-end fw-semibold">
                                            {row.quantityPw.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-end fw-semibold">
                                            KES {row.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="text-end">{row.transitDays}d</td>
                                        <td className="text-center">
                                            <span className={`badge bg-${tone}-subtle text-${tone}`}>
                                                {row.shipmentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {activeTab === "BRANCH_BALANCE" && (
                    <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                        <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                            <tr>
                                <th>Branch</th>
                                <th>Role</th>
                                <th className="text-end">Outbound Transfers</th>
                                <th className="text-end">Outbound Value (KES)</th>
                                <th className="text-end">Inbound Receipts</th>
                                <th className="text-end">Inbound Value (KES)</th>
                                <th className="text-end">Net Stock Injection (KES)</th>
                                <th className="text-end">Pending Inbound Docs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((row, idx) => {
                                const branchName = cleanBranchName(pick(row, "branch_name", "branchName") || "-");
                                const role = String(pick(row, "branch_role") || "-");
                                const outCount = num(pick(row, "outbound_transfers_count"));
                                const outVal = num(pick(row, "outbound_value_cost"));
                                const inCount = num(pick(row, "inbound_receipts_count"));
                                const inVal = num(pick(row, "inbound_value_cost"));
                                const netVal = num(pick(row, "net_transfer_value_cost"));
                                const pendingDocs = num(pick(row, "pending_incoming_docs"));

                                return (
                                    <tr key={idx}>
                                        <th scope="row" className="fw-medium">{branchName}</th>
                                        <td>
                                            <span className="badge bg-info-subtle text-info">{role}</span>
                                        </td>
                                        <td className="text-end">{outCount.toLocaleString()}</td>
                                        <td className="text-end">KES {outVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                        <td className="text-end">{inCount.toLocaleString()}</td>
                                        <td className="text-end">KES {inVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                        <td className={`text-end fw-semibold ${netVal >= 0 ? "text-success" : "text-primary"}`}>
                                            KES {netVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="text-end">{pendingDocs.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {activeTab === "IN_TRANSIT" && (
                    <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                        <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                            <tr>
                                <th>Transfer Voucher</th>
                                <th>Dispatch Date</th>
                                <th>Source Branch</th>
                                <th>Destination Branch</th>
                                <th className="text-end">Lines</th>
                                <th className="text-end">Total Units</th>
                                <th className="text-end">In-Transit Value (KES)</th>
                                <th className="text-end">TOT Days</th>
                                <th className="text-center">Urgency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((row, idx) => {
                                const doc = pick(row, "transfer_doc_number") || "-";
                                const date = formatDateShort(pick(row, "transfer_date"));
                                const src = cleanBranchName(pick(row, "source_branch_name") || "-");
                                const dst = cleanBranchName(pick(row, "dest_branch_name") || "-");
                                const lines = num(pick(row, "line_items_count"));
                                const units = num(pick(row, "total_units"));
                                const cost = num(pick(row, "total_transfer_cost"));
                                const days = num(pick(row, "days_in_transit"));
                                const urgency = String(pick(row, "urgency_level") || "NORMAL").toUpperCase();
                                const tone = urgency.includes("CRITICAL")
                                    ? "danger"
                                    : urgency.includes("WARNING")
                                    ? "warning"
                                    : "info";

                                return (
                                    <tr key={idx}>
                                        <th scope="row" className="fw-medium">{doc}</th>
                                        <td>{date}</td>
                                        <td>{src}</td>
                                        <td>{dst}</td>
                                        <td className="text-end">{lines.toLocaleString()}</td>
                                        <td className="text-end">{units.toLocaleString()}</td>
                                        <td className="text-end fw-semibold">
                                            KES {cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="text-end fw-semibold">{days}d</td>
                                        <td className="text-center">
                                            <span className={`badge bg-${tone}-subtle text-${tone}`}>
                                                {urgency}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <TablePagination
                pageIndex={safePageIndex}
                pageCount={pageCount}
                totalResults={filteredRows.length}
                pageSize={MAX_ROWS}
                onPageChange={setPageIndex}
            />
        </>
    );
};

const BranchTransfersSection = () => {
    // Card 1: Inter-Branch Transfers
    const [transfersTab, setTransfersTab] = useState("DEST_STOCK_AGING");
    const [transfersSearch, setTransfersSearch] = useState("");
    const [transfersBranchFilter, setTransfersBranchFilter] = useState("");

    // Card 2: Branch Pull to/from Syokimau
    const [syokimauDirection, setSyokimauDirection] = useState("TO_SYOKIMAU"); // "TO_SYOKIMAU" (Dest=Syokimau) or "FROM_SYOKIMAU" (Source=Syokimau)
    const [syokimauTab, setSyokimauTab] = useState("DEST_STOCK_AGING");
    const [syokimauSearch, setSyokimauSearch] = useState("");
    const [syokimauBranchFilter, setSyokimauBranchFilter] = useState("");

    const {
        branchTransfersSummary = [],
        branchTransfersBalance = [],
        branchTransfersInTransit = [],
        branchTransfersTopSkus = [],
        branchTransfersDrilldown = [],
        branchTransfersDestStockAging = [],
        loadingBranchTransfers = false,
        errorBranchTransfers = null,
    } = useSelector((state) => state.StockInventory ?? {});

    const allAgingRows = useMemo(
        () => normalizeDestStockAging(branchTransfersDestStockAging),
        [branchTransfersDestStockAging]
    );

    const allDrilldownRows = useMemo(
        () => normalizeDrilldownRows(branchTransfersDrilldown),
        [branchTransfersDrilldown]
    );

    // Enrich aging rows with sourceBranchCode/sourceBranchName from drilldown rows via transferDoc
    const enrichedAgingRows = useMemo(() => {
        const docToSource = new Map();
        allDrilldownRows.forEach((d) => {
            if (d.transferDoc && d.transferDoc !== "-") {
                docToSource.set(d.transferDoc, {
                    sourceBranchCode: d.sourceBranchCode,
                    sourceBranchName: d.sourceBranchName,
                });
            }
        });
        return allAgingRows.map((r) => {
            const match = docToSource.get(r.transferDoc);
            return match
                ? {
                      ...r,
                      sourceBranchCode: r.sourceBranchCode || match.sourceBranchCode,
                      sourceBranchName: r.sourceBranchName || match.sourceBranchName,
                  }
                : r;
        });
    }, [allAgingRows, allDrilldownRows]);

    // Overall Branch Transfers metrics: Total Value, Total SKUs, Transfers Count, Avg Days in Stock
    const row27Metrics = useMemo(() => {
        const summary = (Array.isArray(branchTransfersSummary) ? branchTransfersSummary[0] : branchTransfersSummary) || {};
        const totalValueFromSummary = num(pick(summary, "total_transfer_value_cost", "total_receipt_value_cost"));
        const totalValueFromRows = allDrilldownRows.reduce((s, r) => s + r.totalCost, 0) ||
            enrichedAgingRows.reduce((s, r) => s + r.transferredCost, 0);
        const totalValue = totalValueFromSummary || totalValueFromRows;

        const skuSet = new Set();
        allDrilldownRows.forEach((r) => r.itemCode && skuSet.add(r.itemCode));
        enrichedAgingRows.forEach((r) => r.itemCode && skuSet.add(r.itemCode));
        (Array.isArray(branchTransfersTopSkus) ? branchTransfersTopSkus : []).forEach((r) => {
            const code = pick(r, "item_code");
            if (code) skuSet.add(code);
        });
        const totalSkus = skuSet.size || num(pick(summary, "total_transfer_lines"));

        const totalTransfers = num(pick(summary, "total_transfers_count")) ||
            new Set(allDrilldownRows.map((r) => r.transferDoc)).size;
        const inTransitValue = num(pick(summary, "in_transit_value_cost"));
        const fulfillmentRate = num(pick(summary, "fulfillment_rate_perc"));

        const avgDaysInStock =
            enrichedAgingRows.length > 0
                ? Math.round(
                      enrichedAgingRows.reduce((s, r) => s + r.daysInStock, 0) / enrichedAgingRows.length
                  )
                : 0;

        return {
            totalValue,
            totalSkus,
            totalTransfers,
            inTransitValue,
            fulfillmentRate,
            avgDaysInStock,
        };
    }, [branchTransfersSummary, allDrilldownRows, enrichedAgingRows, branchTransfersTopSkus]);

    // Syokimau Pull filtered datasets & metrics (Total Value, Total SKUs, Drill down to branches & days in stock)
    const { syokimauAgingRows, syokimauDrilldownRows, syokimauInTransitRows, branchPullMetrics } = useMemo(() => {
        const filterFn = (srcCode, srcName, dstCode, dstName) => {
            if (syokimauDirection === "TO_SYOKIMAU") {
                return isSyokimauBranch(dstCode, dstName);
            }
            if (syokimauDirection === "FROM_SYOKIMAU") {
                return isSyokimauBranch(srcCode, srcName);
            }
            return isSyokimauBranch(srcCode, srcName) || isSyokimauBranch(dstCode, dstName);
        };

        const sDrilldown = allDrilldownRows.filter((r) =>
            filterFn(r.sourceBranchCode, r.sourceBranchName, r.destBranchCode, r.destBranchName)
        );
        const sAging = enrichedAgingRows.filter((r) =>
            filterFn(r.sourceBranchCode, r.sourceBranchName, r.destBranchCode, r.destBranchName)
        );
        const sInTransit = (Array.isArray(branchTransfersInTransit) ? branchTransfersInTransit : []).filter((r) =>
            filterFn(
                pick(r, "source_branch_code"),
                pick(r, "source_branch_name"),
                pick(r, "dest_branch_code"),
                pick(r, "dest_branch_name")
            )
        );

        const activeSource = sDrilldown.length > 0 ? sDrilldown : sAging;
        const totalValue = sDrilldown.length > 0
            ? sDrilldown.reduce((s, r) => s + r.totalCost, 0)
            : sAging.reduce((s, r) => s + r.transferredCost, 0);

        const skuSet = new Set();
        activeSource.forEach((r) => r.itemCode && skuSet.add(r.itemCode));
        sAging.forEach((r) => r.itemCode && skuSet.add(r.itemCode));

        const docSet = new Set();
        sDrilldown.forEach((r) => r.transferDoc && docSet.add(r.transferDoc));
        sAging.forEach((r) => r.transferDoc && docSet.add(r.transferDoc));

        const avgDaysInStock =
            sAging.length > 0
                ? Math.round(sAging.reduce((s, r) => s + r.daysInStock, 0) / sAging.length)
                : 0;

        return {
            syokimauAgingRows: sAging,
            syokimauDrilldownRows: sDrilldown,
            syokimauInTransitRows: sInTransit,
            branchPullMetrics: {
                totalValue,
                totalSkus: skuSet.size,
                totalVouchers: docSet.size,
                avgDaysInStock,
            },
        };
    }, [allDrilldownRows, enrichedAgingRows, branchTransfersInTransit, syokimauDirection]);

    const availableBranches = useMemo(() => {
        const set = new Set();
        enrichedAgingRows.forEach((r) => r.destBranchName && r.destBranchName !== "-" && set.add(r.destBranchName));
        allDrilldownRows.forEach((r) => {
            if (r.destBranchName && r.destBranchName !== "-") set.add(r.destBranchName);
            if (r.sourceBranchName && r.sourceBranchName !== "-") set.add(r.sourceBranchName);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [enrichedAgingRows, allDrilldownRows]);

    const handleExportBranchTransfers = () => {
        const rows = enrichedAgingRows.map((r) => ({
            "Product": r.itemName,
            "Item Code": r.itemCode,
            "Batch": r.batchNo,
            "Source Branch": r.sourceBranchName || "-",
            "Destination Branch": r.destBranchName,
            "BTR": r.transferDoc,
            "Transfer Date": r.transferDate,
            "BRN": r.receiptDoc,
            "Receipt Date": r.receiptDate,
            "Transferred Units (Packs)": r.transferredUnits,
            "Transfer Value (KES)": r.transferredCost,
            "Sold Since Receipt": r.unitsSoldSinceReceipt,
            "Current Branch Stock": r.currentBranchStock,
            "Days in Stock": r.daysInStock,
            "Aging Bucket": r.agingBucket,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Branch_Transfers_${todayStr}`);
    };

    const handleExportSyokimauPull = () => {
        const source = syokimauAgingRows.length > 0 ? syokimauAgingRows : syokimauDrilldownRows;
        const rows = source.map((r) => ({
            "Product": r.itemName,
            "Item Code": r.itemCode,
            "Batch": r.batchNo,
            "Source Branch": r.sourceBranchName || "-",
            "Destination Branch": r.destBranchName,
            "Transfer Voucher": r.transferDoc,
            "Transfer Date": r.transferDate,
            "Receipt Voucher": r.receiptDoc,
            "Receipt Date": r.receiptDate,
            "Quantity (Packs)": r.transferredUnits ?? r.quantityPw ?? 0,
            "Value (KES)": r.transferredCost ?? r.totalCost ?? 0,
            "Current Branch Stock": r.currentBranchStock ?? "-",
            "Days in Stock": r.daysInStock ?? r.transitDays ?? 0,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Branch_Pull_Syokimau_${todayStr}`);
    };

    return (
        <>
            {/* BRANCH TRANSFERS */}
            <Row>
                <Col xl={12}>
                    <Card id="branch-transfers-card">
                        <CardHeader>
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div>
                                    <h4 className="card-title mb-1">
                                        BRANCH TRANSFERS — VALUE, SKUS &amp; DAYS IN STOCK
                                    </h4>
                                    <p className="text-muted mb-0 small">
                                        Inter-branch stock transfers, post-receipt branch holding duration, and active in-transit queue
                                    </p>
                                </div>
                                <CardExportButtons
                                    targetId="branch-transfers-card"
                                    title="Branch Transfers"
                                    onExport={handleExportBranchTransfers}
                                />
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Row className="g-2 mb-3">
                                <Col xl={3} md={6} sm={6}>
                                    <div className="p-2 border rounded bg-light-subtle h-100">
                                        <small className="text-muted d-block">Total Transfer Value (At Cost)</small>
                                        <h5 className="mb-0 mt-1 fw-semibold text-primary">
                                            KES {formatCompact(row27Metrics.totalValue)}
                                            <small className="text-muted fw-normal fs-12 ms-1">
                                                ({row27Metrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                                            </small>
                                        </h5>
                                    </div>
                                </Col>
                                <Col xl={3} md={6} sm={6}>
                                    <div className="p-2 border rounded bg-light-subtle h-100">
                                        <small className="text-muted d-block">Total Transferred SKUs</small>
                                        <h5 className="mb-0 mt-1 fw-semibold text-info">
                                            {row27Metrics.totalSkus.toLocaleString()} SKUs
                                            <small className="text-muted fw-normal fs-12 ms-1">
                                                · {row27Metrics.totalTransfers.toLocaleString()} vouchers
                                            </small>
                                        </h5>
                                    </div>
                                </Col>
                                <Col xl={3} md={6} sm={6}>
                                    <div className="p-2 border rounded bg-light-subtle h-100">
                                        <small className="text-muted d-block">Avg Days in Stock (Post-Receipt)</small>
                                        <h5 className="mb-0 mt-1 fw-semibold text-warning">
                                            {row27Metrics.avgDaysInStock.toLocaleString()} days
                                        </h5>
                                    </div>
                                </Col>
                                <Col xl={3} md={6} sm={6}>
                                    <div className="p-2 border rounded bg-light-subtle h-100">
                                        <small className="text-muted d-block">In-Transit Queue / Fulfillment</small>
                                        <h5 className="mb-0 mt-1 fw-semibold text-success">
                                            {row27Metrics.fulfillmentRate.toFixed(1)}% Fulfilled
                                            <small className="text-danger fw-normal fs-12 ms-1">
                                                · KES {formatCompact(row27Metrics.inTransitValue)} in transit
                                            </small>
                                        </h5>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3 align-items-center g-2">
                                <Col md={4}>
                                    <input
                                        className="form-control form-control-sm"
                                        placeholder="Search SKU, batch, voucher, or branch..."
                                        value={transfersSearch}
                                        onChange={(e) => setTransfersSearch(e.target.value)}
                                    />
                                </Col>
                                <Col md="auto">
                                    <select
                                        className="form-select form-select-sm"
                                        value={transfersBranchFilter}
                                        onChange={(e) => setTransfersBranchFilter(e.target.value)}
                                        aria-label="Filter transfers by branch"
                                    >
                                        <option value="">Branch</option>
                                        {availableBranches.map((b) => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </Col>
                                <Col md="auto" className="ms-md-auto">
                                    <div className="btn-group btn-group-sm" role="group">
                                        {[
                                            { key: "DRILLDOWN", label: "Transfer Vouchers" },
                                            { key: "DEST_STOCK_AGING", label: "Branch Drill-Down & Days in Stock" },
                                            { key: "BRANCH_BALANCE", label: "Branch Balance Matrix" },
                                            { key: "IN_TRANSIT", label: `Transfer Queue (In-Transit: ${branchTransfersInTransit.length})` },
                                        ].map((tab) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                className={`btn ${
                                                    transfersTab === tab.key ? "btn-caramel" : "btn-outline-caramel"
                                                }`}
                                                onClick={() => setTransfersTab(tab.key)}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </Col>
                            </Row>

                            {loadingBranchTransfers && !enrichedAgingRows.length && !allDrilldownRows.length ? (
                                <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center">
                                    <Spinner size="sm" color="primary" className="mb-2" />
                                    <small className="text-muted">Loading branch transfers...</small>
                                </div>
                            ) : errorBranchTransfers && !enrichedAgingRows.length ? (
                                <div className="text-danger text-center py-3 small">{String(errorBranchTransfers)}</div>
                            ) : (
                                <TransferAgingTable
                                    agingRows={enrichedAgingRows}
                                    drilldownRows={allDrilldownRows}
                                    inTransitRows={branchTransfersInTransit}
                                    branchBalanceRows={branchTransfersBalance}
                                    activeTab={transfersTab}
                                    searchTerm={transfersSearch}
                                    branchFilter={transfersBranchFilter}
                                />
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* BRANCH PULL TO SYOKIMAU */}
            <Row>
                <Col xl={12}>
                    <Card id="branch-pull-syokimau-card">
                        <CardHeader>
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div>
                                    <h4 className="card-title mb-1">
                                        BRANCH PULL TO SYOKIMAU — VALUE, SKUS &amp; DAYS IN STOCK
                                    </h4>
                                    <p className="text-muted mb-0 small">
                                        Stock pulled between retail branches and Syokimau Central Hub, with branch drill-down and days held in stock
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <div className="btn-group btn-group-sm" role="group" aria-label="Syokimau pull direction">
                                        <button
                                            type="button"
                                            className={`btn ${
                                                syokimauDirection === "TO_SYOKIMAU" ? "btn-primary" : "btn-outline-primary"
                                            }`}
                                            onClick={() => setSyokimauDirection("TO_SYOKIMAU")}
                                        >
                                            Pulled to Syokimau (Inbound)
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${
                                                syokimauDirection === "FROM_SYOKIMAU" ? "btn-primary" : "btn-outline-primary"
                                            }`}
                                            onClick={() => setSyokimauDirection("FROM_SYOKIMAU")}
                                        >
                                            Pulled from Syokimau (Dispatched to Branches)
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${
                                                syokimauDirection === "ALL_SYOKIMAU" ? "btn-primary" : "btn-outline-primary"
                                            }`}
                                            onClick={() => setSyokimauDirection("ALL_SYOKIMAU")}
                                        >
                                            All Syokimau Movements
                                        </button>
                                    </div>
                                    <CardExportButtons
                                        targetId="branch-pull-syokimau-card"
                                        title="Branch Pull to Syokimau"
                                        onExport={handleExportSyokimauPull}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Row className="g-2 mb-3">
                                <Col xl={3} md={6} sm={6}>
                                    <div className="p-2 border rounded bg-light-subtle h-100">
                                        <small className="text-muted d-block">Total Value (At Cost)</small>
                                        <h5 className="mb-0 mt-1 fw-semibold text-primary">
                                            KES {formatCompact(branchPullMetrics.totalValue)}
                                            <small className="text-muted fw-normal fs-12 ms-1">
                                                ({branchPullMetrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                                            </small>
                                        </h5>
                                    </div>
                                </Col>
                                <Col xl={3} md={6} sm={6}>
                                    <div className="p-2 border rounded bg-light-subtle h-100">
                                        <small className="text-muted d-block">Total SKUs</small>
                                        <h5 className="mb-0 mt-1 fw-semibold text-info">
                                            {branchPullMetrics.totalSkus.toLocaleString()} SKUs
                                        </h5>
                                    </div>
                                </Col>
                                <Col xl={3} md={6} sm={6}>
                                    <div className="p-2 border rounded bg-light-subtle h-100">
                                        <small className="text-muted d-block">Transfer Vouchers</small>
                                        <h5 className="mb-0 mt-1 fw-semibold text-success">
                                            {branchPullMetrics.totalVouchers.toLocaleString()} Vouchers
                                        </h5>
                                    </div>
                                </Col>
                                <Col xl={3} md={6} sm={6}>
                                    <div className="p-2 border rounded bg-light-subtle h-100">
                                        <small className="text-muted d-block">Avg Days in Stock</small>
                                        <h5 className="mb-0 mt-1 fw-semibold text-warning">
                                            {branchPullMetrics.avgDaysInStock.toLocaleString()} days
                                        </h5>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3 align-items-center g-2">
                                <Col md={4}>
                                    <input
                                        className="form-control form-control-sm"
                                        placeholder="Search Syokimau pull SKU, batch, or branch..."
                                        value={syokimauSearch}
                                        onChange={(e) => setSyokimauSearch(e.target.value)}
                                    />
                                </Col>
                                <Col md="auto">
                                    <select
                                        className="form-select form-select-sm"
                                        value={syokimauBranchFilter}
                                        onChange={(e) => setSyokimauBranchFilter(e.target.value)}
                                        aria-label="Filter Syokimau pull by branch"
                                    >
                                        <option value="">Branch</option>
                                        {availableBranches.map((b) => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </Col>
                                <Col md="auto" className="ms-md-auto">
                                    <div className="btn-group btn-group-sm" role="group">
                                        {[
                                            { key: "DEST_STOCK_AGING", label: "Branch Drill-Down & Days in Stock" },
                                            { key: "DRILLDOWN", label: "Voucher Line Items" },
                                            { key: "IN_TRANSIT", label: `In-Transit (${syokimauInTransitRows.length})` },
                                        ].map((tab) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                className={`btn ${
                                                    syokimauTab === tab.key ? "btn-caramel" : "btn-outline-caramel"
                                                }`}
                                                onClick={() => setSyokimauTab(tab.key)}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </Col>
                            </Row>

                            <TransferAgingTable
                                agingRows={syokimauAgingRows}
                                drilldownRows={syokimauDrilldownRows}
                                inTransitRows={syokimauInTransitRows}
                                branchBalanceRows={[]}
                                activeTab={syokimauTab}
                                searchTerm={syokimauSearch}
                                branchFilter={syokimauBranchFilter}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default BranchTransfersSection;
