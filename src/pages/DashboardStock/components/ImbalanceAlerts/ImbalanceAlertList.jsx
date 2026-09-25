import React from "react";
import { ListGroup, Spinner } from "reactstrap";
import ImbalanceAlertItem from "./ImbalanceAlertItem";

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
                <small className="text-muted">Analyzing inter-branch inventory balances...</small>
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
        <ListGroup className="list mb-0" flush>
            {alerts.map((item, i) => (
                <ImbalanceAlertItem key={item.id || i} data={item} index={i} />
            ))}
        </ListGroup>
    );
};

export default ImbalanceAlertList;