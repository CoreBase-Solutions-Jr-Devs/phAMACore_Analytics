import React, { useMemo } from "react";
import ImbalanceAlertList from "./ImbalanceAlertList";
import { useImbalanceEngine } from "./useImbalanceEngine";

const ImbalanceAlertsContainer = ({
    stock,
    movements,
    expiry,
    searchTerm = "",
    sortAscending = true,
    isLoading,
    error,
}) => {
    const rawAlerts = useMemo(() => {
        return useImbalanceEngine(stock, movements, expiry) || [];
    }, [stock, movements, expiry]);

    const filteredAlerts = useMemo(() => {
        let list = rawAlerts || [];
        const term = (searchTerm || "").trim().toLowerCase();

        if (term) {
            list = list.filter((item) => {
                const product = (item.product || "").toLowerCase();
                const code = (item.itemCode || "").toLowerCase();
                const from = (item.from || "").toLowerCase();
                const to = (item.to || "").toLowerCase();
                const status = (item.statusLabel || item.status || "").toLowerCase();
                return (
                    product.includes(term) ||
                    code.includes(term) ||
                    from.includes(term) ||
                    to.includes(term) ||
                    status.includes(term)
                );
            });
        }

        if (sortAscending !== null && sortAscending !== undefined) {
            list = [...list].sort((a, b) => {
                const nameA = a.product || "";
                const nameB = b.product || "";
                return sortAscending
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            });
        }

        return list;
    }, [rawAlerts, searchTerm, sortAscending]);

    return (
        <ImbalanceAlertList
            alerts={filteredAlerts}
            searchTerm={searchTerm}
            isLoading={isLoading}
            error={error}
        />
    );
};

export default ImbalanceAlertsContainer;