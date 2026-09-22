import React from "react";
import { ListGroupItem } from "reactstrap";

const ImbalanceAlertItem = ({ data, index }) => {
    const badgeClass =
        {
            queued: "border-warning text-warning bg-warning-subtle",
            urgent: "border-danger text-danger bg-danger-subtle",
            replenish: "border-primary text-primary bg-primary-subtle",
            promote: "border-info text-info bg-info-subtle",
        }[data.status] || (data.badgeClass ? `border-${data.badgeClass} text-${data.badgeClass} bg-${data.badgeClass}-subtle` : "border-secondary text-secondary bg-secondary-subtle");

    const badgeText =
        data.statusLabel ||
        {
            queued: "Transfer queued",
            urgent: "Transfer urgent",
            replenish: "Replenish all",
            promote: "Promote urgently",
        }[data.status] ||
        data.status;

    const toBadgeClass =
        data.status === "replenish"
            ? "bg-primary-subtle text-primary border border-primary-subtle"
            : data.status === "promote"
            ? "bg-info-subtle text-info border border-info-subtle"
            : "bg-danger-subtle text-danger border border-danger-subtle";

    const tooltipTitle = data.suggestedTransfer
        ? `Suggested transfer: ~${data.suggestedTransfer.toLocaleString()} units`
        : data.diff
        ? `Difference: ${data.diff.toLocaleString()} units`
        : undefined;

    return (
        <ListGroupItem data-id={index} className="px-3 py-2" title={tooltipTitle}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center flex-wrap gap-2 min-w-0">
                    <span className="fw-medium text-body fs-13 text-truncate" style={{ maxWidth: "220px" }} title={data.product}>
                        {data.product}
                    </span>

                    <span className="text-muted">·</span>

                    <span className="badge bg-success-subtle text-success border border-success-subtle fs-11 px-2 py-1">
                        {data.from}
                    </span>

                    <i className="ri-arrow-right-line text-muted fs-12"></i>

                    <span className={`badge ${toBadgeClass} fs-11 px-2 py-1`}>
                        {data.to}
                    </span>
                </div>

                <div className="flex-shrink-0">
                    <span className={`badge rounded-pill border fs-11 fw-normal px-2 py-1 ${badgeClass}`}>
                        {badgeText}
                    </span>
                </div>
            </div>
        </ListGroupItem>
    );
};

export default ImbalanceAlertItem;