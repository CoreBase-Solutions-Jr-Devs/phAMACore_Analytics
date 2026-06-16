import React from "react";
import { ListGroupItem } from "reactstrap";

const ImbalanceAlertItem = ({ data, index }) => {
    return (
        <ListGroupItem data-id={index}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">

                <div className="d-flex align-items-center flex-wrap gap-2">
                    <span className="fw-medium text-body fs-13">
                        {data.product}
                    </span>

                    <span className="text-muted">·</span>

                    <span className="badge text-bg-success fs-11 px-2 py-1">
                        {data.from}
                    </span>

                    <span className="text-muted">→</span>

                    <span className="badge text-bg-danger fs-11 px-2 py-1">
                        {data.to}
                    </span>
                </div>

                <span
                    className={`badge fs-11 px-2 py-1 border ${data.status === "urgent"
                            ? "border-danger text-danger"
                            : "border-warning text-warning"
                        }`}
                >
                    Transfer {data.status}
                </span>

            </div>
        </ListGroupItem>
    );
};

export default ImbalanceAlertItem;