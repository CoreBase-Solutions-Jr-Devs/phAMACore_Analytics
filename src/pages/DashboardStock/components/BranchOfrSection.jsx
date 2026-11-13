import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import TablePagination from "../../../Components/Common/TablePagination";
import { fetchKPIBranchOrderFillRate } from "../../../slices/dashboardStock/thunk";
import { cleanBranchName } from "../../../helpers/branch_helper";
import { pick, num } from "../../utils/apiRow";
import { formatCompact } from "../../utils/formatHelper";

const MAX_ROWS = 50;

export const OFR_TABS = [
    { key: "BRANCH_OFR", label: "By Branch" },
    { key: "ORDER_DRILLDOWN", label: "LPO Voucher Drill-Down" },
    { key: "TOP_SHORTAGES", label: "Top Main Branch Shortages" },
];

const formatDateShort = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).slice(0, 10);
    return d.toLocaleDateString("en-GB");
};

export const extractOfrSummary = (summaryRows = [], branchRows = []) => {
    const first = (Array.isArray(summaryRows) ? summaryRows[0] : summaryRows) || {};
    const totalOrders =
        num(pick(first, "total_orders", "total_orders_count", "orders_count")) ||
        branchRows.reduce((s, r) => s + num(pick(r, "total_orders", "orders_count")), 0);
    const orderFillRate = num(pick(first, "order_fill_rate_perc", "order_fill_rate", "ofr_perc"));
    const lineFillRate = num(pick(first, "line_fill_rate_perc", "line_fill_rate"));
    const qtyFillRate = num(pick(first, "quantity_fill_rate_perc", "qty_fill_rate_perc", "qty_fill_rate"));
    const receiptFidelity = num(pick(first, "receipt_fidelity_perc", "receipt_fidelity"));
    const backorderExposure =
        num(pick(first, "backorder_exposure_kes", "backorder_value_kes", "backorder_value", "unfulfilled_value")) ||
        branchRows.reduce((s, r) => s + num(pick(r, "backorder_exposure_kes", "backorder_value", "unfulfilled_value")), 0);
    const actionInsight = String(pick(first, "action_insight") || "");

    return {
        totalOrders,
        orderFillRate,
        lineFillRate,
        qtyFillRate,
        receiptFidelity,
        backorderExposure,
        actionInsight,
    };
};

const BranchOfrSection = ({ activeTab = "BRANCH_OFR", searchTerm = "" }) => {
    const dispatch = useDispatch();
    const [pageIndex, setPageIndex] = useState(0);

    const {
        branchOrderFillRateSummary = [],
        branchOrderFillRateByBranch = [],
        branchOrderFillRateDrilldown = [],
        branchOrderFillRateTopShortages = [],
        loadingBranchOrderFillRate = false,
        errorBranchOrderFillRate = null,
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;
    const branchCode = activeFilters.branch && Number(activeFilters.branch) > 0 ? Number(activeFilters.branch) : 0;

    // Lazy-fetch ORDER_DRILLDOWN when user switches to that tab if not yet loaded
    useEffect(() => {
        if (activeTab === "ORDER_DRILLDOWN") {
            dispatch(
                fetchKPIBranchOrderFillRate({
                    clientid: 1,
                    startDate: activeFilters.startDate,
                    endDate: activeFilters.endDate,
                    branchcode: branchCode,
                    GroupBy: "ORDER_DRILLDOWN",
                    TopN: 500,
                })
            );
        }
    }, [dispatch, activeTab, activeFilters.startDate, activeFilters.endDate, branchCode]);

    const summary = useMemo(
        () => extractOfrSummary(branchOrderFillRateSummary, branchOrderFillRateByBranch),
        [branchOrderFillRateSummary, branchOrderFillRateByBranch]
    );

    const rows = useMemo(() => {
        const term = (searchTerm || "").trim().toLowerCase();
        let source = [];
        if (activeTab === "BRANCH_OFR") source = branchOrderFillRateByBranch;
        else if (activeTab === "ORDER_DRILLDOWN") source = branchOrderFillRateDrilldown;
        else source = branchOrderFillRateTopShortages;

        const list = Array.isArray(source) ? source : [];
        if (!term) return list;

        return list.filter((row) =>
            Object.values(row || {}).some((val) => String(val ?? "").toLowerCase().includes(term))
        );
    }, [
        activeTab,
        branchOrderFillRateByBranch,
        branchOrderFillRateDrilldown,
        branchOrderFillRateTopShortages,
        searchTerm,
    ]);

    useEffect(() => {
        setPageIndex(0);
    }, [activeTab, searchTerm, rows.length]);

    const pageCount = Math.max(Math.ceil(rows.length / MAX_ROWS), 1);
    const safePageIndex = Math.min(pageIndex, pageCount - 1);
    const pageRows = useMemo(
        () => rows.slice(safePageIndex * MAX_ROWS, (safePageIndex + 1) * MAX_ROWS),
        [rows, safePageIndex]
    );

    const kpiPills = [
        { label: "Total Branch LPOs", value: summary.totalOrders.toLocaleString(), color: "primary" },
        { label: "Order Fill Rate (OFR)", value: `${summary.orderFillRate.toFixed(1)}%`, color: summary.orderFillRate >= 80 ? "success" : "warning" },
        { label: "Line Fill Rate", value: `${summary.lineFillRate.toFixed(1)}%`, color: "info" },
        { label: "Quantity Fill Rate", value: `${summary.qtyFillRate.toFixed(1)}%`, color: "primary" },
        { label: "Receipt Fidelity", value: `${summary.receiptFidelity.toFixed(1)}%`, color: "success" },
        { label: "Backorder Exposure", value: `KES ${formatCompact(summary.backorderExposure)}`, color: "danger" },
    ];

    return (
        <div>
            <Row className="g-2 mb-3">
                {kpiPills.map((kpi, idx) => (
                    <Col xl={2} lg={4} md={4} sm={6} xs={6} key={idx}>
                        <div className="p-2 border rounded bg-light-subtle h-100">
                            <small className="text-muted d-block text-truncate">{kpi.label}</small>
                            <h5 className={`mb-0 mt-1 fw-semibold text-${kpi.color}`}>{kpi.value}</h5>
                        </div>
                    </Col>
                ))}
            </Row>

            {summary.actionInsight && (
                <div className="alert alert-info py-2 px-3 mb-3 small">
                    <i className="ri-information-line me-1 align-middle"></i>
                    {summary.actionInsight}
                </div>
            )}

            {loadingBranchOrderFillRate && !rows.length ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center" style={{ minHeight: "180px" }}>
                    <Spinner size="sm" color="primary" className="mb-2" />
                    <small className="text-muted">Loading branch order fill rate data...</small>
                </div>
            ) : errorBranchOrderFillRate && !rows.length ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-danger" style={{ minHeight: "180px" }}>
                    <i className="ri-error-warning-line display-6 mb-2"></i>
                    <small>{String(errorBranchOrderFillRate)}</small>
                </div>
            ) : !rows.length ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted" style={{ minHeight: "180px" }}>
                    <i className="ri-inbox-line display-6 mb-2"></i>
                    <div className="fw-medium">No Branch Order Fill Rate records found</div>
                    <small className="text-muted">Try adjusting the date range or branch filter.</small>
                </div>
            ) : (
                <>
                    <div
                        tabIndex={0}
                        role="region"
                        aria-label="Branch order fill rate table"
                        className="table-responsive"
                        style={{ maxHeight: "max(400px, calc(100vh - 350px))", overflowY: "auto" }}
                    >
                        {activeTab === "BRANCH_OFR" && (
                            <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                                <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                                    <tr>
                                        <th>Branch</th>
                                        <th className="text-end">Total Orders</th>
                                        <th className="text-end">Order Fill Rate %</th>
                                        <th className="text-end">Line Fill Rate %</th>
                                        <th className="text-end">Qty Fill Rate %</th>
                                        <th className="text-end">Units Ordered</th>
                                        <th className="text-end">Units Fulfilled</th>
                                        <th className="text-end">Backorder Value (KES)</th>
                                        <th>Operational Insight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((row, i) => {
                                        const branch = cleanBranchName(
                                            pick(row, "dest_branch_name", "branch_name", "branchName") || "-"
                                        );
                                        const ofr = num(pick(row, "order_fill_rate_perc", "order_fill_rate", "ofr_perc"));
                                        const lfr = num(pick(row, "line_fill_rate_perc", "line_fill_rate"));
                                        const qfr = num(pick(row, "quantity_fill_rate_perc", "qty_fill_rate_perc", "qty_fill_rate"));
                                        const orders = num(pick(row, "total_orders", "orders_count"));
                                        const orderedUnits = num(pick(row, "units_ordered", "total_units_ordered", "ordered_qty"));
                                        const fulfilledUnits = num(
                                            pick(row, "units_received", "units_dispatched", "units_fulfilled", "fulfilled_qty")
                                        );
                                        const backorderVal = num(
                                            pick(row, "backorder_exposure_kes", "backorder_value_kes", "backorder_value", "unfulfilled_value")
                                        );
                                        const insight = pick(row, "action_insight") || "-";
                                        const tone = ofr >= 80 ? "success" : ofr >= 50 ? "warning" : "danger";

                                        return (
                                            <tr key={i}>
                                                <th scope="row" className="fw-medium">{branch}</th>
                                                <td className="text-end">{orders.toLocaleString()}</td>
                                                <td className="text-end">
                                                    <span className={`badge bg-${tone}-subtle text-${tone} fs-12`}>
                                                        {ofr.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="text-end">{lfr.toFixed(1)}%</td>
                                                <td className="text-end fw-semibold">{qfr.toFixed(1)}%</td>
                                                <td className="text-end">{orderedUnits.toLocaleString()}</td>
                                                <td className="text-end text-success">{fulfilledUnits.toLocaleString()}</td>
                                                <td className="text-end text-danger fw-medium">
                                                    KES {backorderVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="text-muted small text-wrap" style={{ maxWidth: "280px" }}>
                                                    {insight}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {activeTab === "ORDER_DRILLDOWN" && (
                            <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                                <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                                    <tr>
                                        <th>LPO</th>
                                        <th>Order Date</th>
                                        <th>Requesting Branch</th>
                                        <th>BTR</th>
                                        <th>BRN</th>
                                        <th className="text-end">Units Ordered</th>
                                        <th className="text-end">Unit Value (KES)</th>
                                        <th className="text-end">Units Dispatched</th>
                                        <th className="text-end">Units Received</th>
                                        <th className="text-end">Unfulfilled Units</th>
                                        <th className="text-end">Unfulfilled Value (KES)</th>
                                        <th className="text-end">Turnaround</th>
                                        <th className="text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((row, i) => {
                                        const orderDoc = pick(row, "order_number") || "-";
                                        const orderDate = formatDateShort(pick(row, "order_date", "doc_date"));
                                        const branch = cleanBranchName(
                                            pick(row, "dest_branch_name", "branch_name") || "-"
                                        );
                                        const transferDoc = pick(row, "transfer_doc_number", "transfer_voucher") || "-";
                                        const receiptDoc = pick(row, "receipt_doc_number", "receipt_voucher") || "-";
                                        const uOrdered = num(pick(row, "units_ordered", "ordered_units", "qty_ordered"));
                                        const uCost = num(pick(row, "ordered_value_cost"));
                                        const uDispatched = num(pick(row, "units_dispatched", "dispatched_units", "qty_dispatched"));
                                        const uReceived = num(pick(row, "units_received", "received_units", "qty_received"));
                                        const unfUnits = num(pick(row, "unfulfilled_units"));
                                        const unfCost = num(pick(row, "unfulfilled_value_cost"));
                                        const turnaround = pick(row, "turnaround_days", "transit_days");
                                        const status = String(pick(row, "order_status", "fulfillment_status", "status") || "PENDING").toUpperCase();
                                        const tone = status.includes("FULFILLED") && !status.includes("UN")
                                            ? "success"
                                            : status.includes("PARTIAL")
                                            ? "warning"
                                            : "danger";

                                        return (
                                            <tr key={i}>
                                                <th scope="row" className="fw-medium">{orderDoc}</th>
                                                <td>{orderDate}</td>
                                                <td>{branch}</td>
                                                <td>{transferDoc}</td>
                                                <td>{receiptDoc}</td>
                                                <td className="text-end">{uOrdered.toLocaleString()}</td>
                                                <td className="text-end">{uCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                <td className="text-end">{uDispatched.toLocaleString()}</td>
                                                <td className="text-end fw-semibold">{uReceived.toLocaleString()}</td>
                                                <td className="text-end text-danger fw-semibold">{unfUnits.toLocaleString()}</td>
                                                <td className="text-end text-danger fw-semibold">{unfCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                <td className="text-end">
                                                    {turnaround !== null && turnaround !== undefined ? `${num(turnaround)}d` : "-"}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge bg-${tone}-subtle text-${tone}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {activeTab === "TOP_SHORTAGES" && (
                            <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                                <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                                    <tr>
                                        <th>Product / SKU</th>
                                        <th className="text-end">Shortage Occurrences</th>
                                        <th className="text-end">Lost / Unfulfilled Units</th>
                                        <th className="text-end">Lost Value (KES)</th>
                                        <th className="text-end">Branches Impacted</th>
                                        <th>Affected Branches</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((row, i) => {
                                        const itemCode = pick(row, "item_code", "itemCode") || "";
                                        const itemName = pick(row, "item_name", "itemName") || itemCode || "Unknown SKU";
                                        const count = num(pick(row, "shortage_orders_count", "shortage_count", "orders_affected"));
                                        const lostUnits = num(
                                            pick(row, "lost_fulfillment_units", "unfulfilled_units", "shortage_units")
                                        );
                                        const lostVal = num(
                                            pick(row, "lost_fulfillment_value", "unfulfilled_value_kes", "backorder_exposure_kes", "shortage_value")
                                        );
                                        const branchCount = num(pick(row, "affected_branches_count", "branches_count"));
                                        const branchList = pick(row, "affected_branches_list", "affected_branches", "branches_list") || "-";

                                        return (
                                            <tr key={i}>
                                                <th scope="row" className="fw-medium">
                                                    {itemName}
                                                    {itemCode && <small className="text-muted d-block fw-normal">{itemCode}</small>}
                                                </th>
                                                <td className="text-end">{count.toLocaleString()}</td>
                                                <td className="text-end text-danger fw-semibold">{lostUnits.toLocaleString()}</td>
                                                <td className="text-end text-danger fw-semibold">
                                                    KES {lostVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="text-end">{branchCount.toLocaleString()}</td>
                                                <td className="text-muted small text-wrap" style={{ maxWidth: "300px" }}>
                                                    {branchList}
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
                        totalResults={rows.length}
                        pageSize={MAX_ROWS}
                        onPageChange={setPageIndex}
                    />
                </>
            )}
        </div>
    );
};

export default BranchOfrSection;
