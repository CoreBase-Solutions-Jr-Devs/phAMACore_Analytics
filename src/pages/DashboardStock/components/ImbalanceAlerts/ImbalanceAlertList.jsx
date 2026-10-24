import React from "react";
import { Spinner } from "reactstrap";

const formatGap = (gap = 0) => `${gap > 0 ? "+" : ""}${Number(gap).toFixed(1)}%`;

const ImbalanceAlertList = ({
    alerts = [],
    searchTerm = "",
    statusFilter = "ALL",
    isLoading = false,
    error = null,
}) => {
    if (isLoading && (!alerts || alerts.length === 0)) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center"
                style={{ minHeight: "180px" }}
            >
                <Spinner size="sm" color="primary" className="mb-2" />
                <small className="text-muted">Loading transfer suggestions...</small>
            </div>
        );
    }

    if (error && (!alerts || alerts.length === 0)) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-danger"
                style={{ minHeight: "180px" }}
            >
                <i className="ri-error-warning-line display-6 mb-2"></i>
                <small>{typeof error === "string" ? error : "Failed to load branch imbalance data."}</small>
            </div>
        );
    }

    if (!alerts?.length) {
        if (searchTerm || statusFilter !== "ALL") {
            return (
                <div
                    className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted"
                    style={{ minHeight: "180px" }}
                >
                    <i className="ri-search-line display-6 mb-2"></i>
                    <div className="fw-medium text-dark fs-13">No matching imbalance alerts</div>
                    <small className="text-muted">
                        {searchTerm
                            ? `No alerts match "${searchTerm}". Try adjusting your search query.`
                            : "No inter-branch imbalances match your filter."}
                    </small>
                </div>
            );
        }

        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted"
                style={{ minHeight: "180px" }}
            >
                <div className="avatar-sm mb-2">
                    <div className="avatar-title bg-success-subtle text-success rounded-circle fs-20">
                        <i className="ri-checkbox-circle-line"></i>
                    </div>
                </div>
                <div className="fw-medium text-dark fs-13">No Imbalance Detected</div>
                <small className="text-muted">
                    Stock levels are balanced across branches. No inter-branch transfers or replenishments needed.
                </small>
            </div>
        );
    }

    return (
        <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="table table-borderless table-centered table-nowrap mb-0">
                <thead className="text-muted table-light sticky-top">
                    <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Branch</th>
                        <th scope="col" className="text-center">Status &amp; Gap</th>
                        <th scope="col" className="text-end">Branch Stock</th>
                        <th scope="col" className="text-end">Branch Sales</th>
                        <th scope="col" className="text-center">Rec. Transfer</th>
                        <th scope="col">Network Counterpart &amp; Action</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.map((item, i) => {
                        const tone = item.deficit ? "danger" : "success";
                        return (
                            <tr key={item.id || i} data-id={i}>
                                <th
                                    scope="row"
                                    className="fw-medium"
                                    title={`${item.product} (${item.itemCode})\nCategory: ${item.group}\n${item.actionInsight}`}
                                >
                                    {item.product}
                                    <small className="text-muted d-block fw-normal">
                                        {[item.itemCode, item.group].filter((v) => v && v !== "-").join(" · ")}
                                    </small>
                                </th>
                                <td>
                                    <span className="badge bg-light text-body fs-12 fw-medium">{item.branch || "-"}</span>
                                </td>
                                <td
                                    className="text-center"
                                    title={`Stock share (${item.stockShare.toFixed(1)}%) vs Sales share (${item.salesShare.toFixed(1)}%) = ${formatGap(item.gap)} gap`}
                                >
                                    <span
                                        className={`badge rounded-pill border border-${tone} text-${tone} bg-${tone}-subtle fs-11 fw-normal px-2 py-1`}
                                    >
                                        {item.deficit ? "Deficit" : "Surplus"}
                                    </span>
                                    <small className={`d-block fw-semibold text-${tone}`}>{formatGap(item.gap)} gap</small>
                                </td>
                                <td
                                    className="text-end"
                                    title={`Branch Stock: ${item.stock.toLocaleString()} units of ${item.companyStock.toLocaleString()} company total (${item.stockShare.toFixed(1)}%)`}
                                >
                                    <span className="fw-semibold">{item.stock.toLocaleString()} u</span>
                                    <small className="text-muted d-block">
                                        {item.stockShare.toFixed(1)}% of {item.companyStock.toLocaleString()}
                                    </small>
                                </td>
                                <td
                                    className="text-end"
                                    title={`Branch Sales: ${item.sales.toLocaleString()} units of ${item.companySales.toLocaleString()} company total (${item.salesShare.toFixed(1)}%)`}
                                >
                                    <span className="fw-semibold">{item.sales.toLocaleString()} u</span>
                                    <small className="text-muted d-block">
                                        {item.salesShare.toFixed(1)}% of {item.companySales.toLocaleString()}
                                    </small>
                                </td>
                                <td className="text-center">
                                    <span
                                        className="badge bg-primary-subtle text-primary fs-12 fw-semibold px-2 py-1"
                                        title={item.actionInsight}
                                    >
                                        <i className="ri-arrow-left-right-line me-1 align-middle"></i>
                                        {item.qty.toLocaleString()} u
                                    </span>
                                </td>
                                <td title={`${item.networkContext}\n\nAction: ${item.actionInsight}`}>
                                    <div className="text-truncate fs-12 fw-medium" style={{ maxWidth: "320px" }}>
                                        {item.networkContext}
                                    </div>
                                    <small className="text-muted d-block text-truncate" style={{ maxWidth: "320px" }}>
                                        <i className="ri-information-line text-primary me-1 align-middle"></i>
                                        {item.actionInsight}
                                    </small>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ImbalanceAlertList;
