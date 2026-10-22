import React from "react";
import { Spinner } from "reactstrap";

const formatCoverDays = (value) =>
    value === null || value === undefined ? "No sales" : value > 365 ? ">1 yr" : `${value}d`;

const ImbalanceAlertList = ({
    alerts = [],
    searchTerm = "",
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
        if (searchTerm) {
            return (
                <div
                    className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted"
                    style={{ minHeight: "180px" }}
                >
                    <i className="ri-search-line display-6 mb-2"></i>
                    <div className="fw-medium text-dark fs-13">No matching imbalance alerts</div>
                    <small className="text-muted">
                        No alerts match "{searchTerm}". Try adjusting your search query.
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
        <div className="table-responsive">
            <table className="table table-sm table-hover table-borderless table-nowrap align-middle mb-0">
                <thead
                    className="text-muted table-light"
                    style={{ position: "sticky", top: 0, zIndex: 1 }}
                >
                    <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Category</th>
                        <th scope="col">Branch</th>
                        <th scope="col" className="text-center">Position</th>
                        <th scope="col" className="text-end">Branch Stock</th>
                        <th scope="col" className="text-end">Stock Share</th>
                        <th scope="col" className="text-end">Sales Share</th>
                        <th scope="col" className="text-end">Suggested Transfer</th>
                        <th scope="col" className="text-end">Cover (Before → After)</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.map((item, i) => {
                        const tone = item.deficit ? "danger" : "success";
                        return (
                            <tr
                                key={item.id || i}
                                data-id={i}
                                title={item.insight || undefined}
                            >
                                <th scope="row" className="fw-medium">
                                    {item.product}
                                    {item.itemCode && (
                                        <small className="text-muted d-block fw-normal">
                                            {item.itemCode}
                                        </small>
                                    )}
                                </th>
                                <td className="text-muted">{item.group || "-"}</td>
                                <td>{item.branch || "-"}</td>
                                <td className="text-center">
                                    <span
                                        className={`badge rounded-pill border border-${tone} text-${tone} bg-${tone}-subtle fs-11 fw-normal px-2 py-1`}
                                    >
                                        {item.deficit ? "Needs stock" : "Has surplus"}
                                    </span>
                                </td>
                                <td className="text-end">{(item.stock ?? 0).toLocaleString()}</td>
                                <td className="text-end">{(item.stockShare ?? 0).toFixed(0)}%</td>
                                <td className="text-end">{(item.salesShare ?? 0).toFixed(0)}%</td>
                                <td className="text-end fw-semibold">
                                    {item.deficit ? "Receive" : "Release"} ~{(item.qty ?? 0).toLocaleString()}
                                </td>
                                <td className="text-end text-muted">
                                    {formatCoverDays(item.coverBefore)} →{" "}
                                    <span className="text-body fw-medium">
                                        {formatCoverDays(item.coverAfter)}
                                    </span>
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