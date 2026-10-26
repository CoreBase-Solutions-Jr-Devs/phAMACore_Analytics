import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import ImbalanceAlertList from "./ImbalanceAlertList";
import {
    buildTransferSuggestions,
    filterTransferSuggestions,
    getLookbackDays,
} from "../../../utils/StockInventoryUtils";

const MAX_ROWS = 100;

// Transfer suggestions come straight from PowerBIKPIStockHealth (GroupBy = IMBALANCES),
// replacing the old client-side engine that needed every closing-stock line in the browser.
// Rows keep the API's severity ranking; the Deficit / Surplus and Branch filters narrow the list.
const ImbalanceAlerts = ({ searchTerm = "", statusFilter = "ALL", branchFilter = "" }) => {
    const {
        imbalances = [],
        loadingImbalances = false,
        errorImbalances = null,
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;

    const lookbackDays = getLookbackDays(activeFilters.startDate, activeFilters.endDate);

    const alerts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const list = buildTransferSuggestions(imbalances, lookbackDays).filter(
            (item) =>
                !term ||
                [item.product, item.itemCode, item.branch, item.group, item.networkContext].some((field) =>
                    String(field).toLowerCase().includes(term)
                )
        );
        return filterTransferSuggestions(list, statusFilter, branchFilter);
    }, [imbalances, lookbackDays, searchTerm, statusFilter, branchFilter]);

    return (
        <>
            <ImbalanceAlertList
                alerts={alerts.slice(0, MAX_ROWS)}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                branchFilter={branchFilter}
                isLoading={loadingImbalances}
                error={errorImbalances}
            />
            {alerts.length > MAX_ROWS && (
                <p className="text-muted fs-12 text-center mt-2 mb-0">
                    Showing {MAX_ROWS} of {alerts.length.toLocaleString()} suggestions. Search to narrow the
                    list, or export for all of them.
                </p>
            )}
        </>
    );
};

export default ImbalanceAlerts;
