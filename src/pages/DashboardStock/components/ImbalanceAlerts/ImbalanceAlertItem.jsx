import React from "react";
import { ListGroupItem } from "reactstrap";

const days = (value) => (value === null ? "no sales" : value > 365 ? ">1 yr" : `${value}d`);

const ImbalanceAlertItem = ({ data, index }) => {
    const tone = data.deficit ? "danger" : "success";

    return (
        <ListGroupItem data-id={index} className="px-3 py-2" title={data.insight || undefined}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="min-w-0">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <span className="fw-medium text-body fs-13 text-truncate" style={{ maxWidth: "240px" }} title={data.product}>
                            {data.product}
                        </span>
                        <span className={`badge bg-${tone}-subtle text-${tone} border border-${tone}-subtle fs-11 px-2 py-1`}>
                            {data.branch}
                        </span>
                    </div>
                    <p className="text-muted mb-0 fs-12">
                        {data.deficit ? "Needs" : "Can release"} ~{data.qty.toLocaleString()} units
                        {" "}• Stock {data.stock.toLocaleString()} ({data.stockShare.toFixed(0)}% of network)
                        {" "}• Sales share {data.salesShare.toFixed(0)}%
                        {" "}• Cover {days(data.coverBefore)} → {days(data.coverAfter)}
                    </p>
                </div>

                <span className="badge rounded-pill border border-warning text-warning bg-warning-subtle fs-11 fw-normal px-2 py-1 flex-shrink-0">
                    Suggested transfer
                </span>
            </div>
        </ListGroupItem>
    );
};

export default ImbalanceAlertItem;
