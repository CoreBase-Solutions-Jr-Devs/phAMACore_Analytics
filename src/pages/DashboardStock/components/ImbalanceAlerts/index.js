import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import ImbalanceAlertList from "./ImbalanceAlertList";
import { buildTransferSuggestions, getLookbackDays } from "../../../utils/StockInventoryUtils";

const MAX_ROWS = 100;

// Transfer suggestions come straight from PowerBIKPIStockHealth (GroupBy = IMBALANCES),
// replacing the old client-side engine that needed every closing-stock line in the browser.
const ImbalanceAlerts = ({ searchTerm = "", sortAscending = true }) => {
    const {
        imbalances = [],
        loadingImbalances = false,
        errorImbalances = null,
        filters = {},
    } = useSelector((state) => state.StockInventory ?? {});

    const lookbackDays = getLookbackDays(filters.startDate, filters.endDate);

    const alerts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const list = buildTransferSuggestions(imbalances, lookbackDays).filter(
            (item) =>
                !term ||
                [item.product, item.itemCode, item.branch, item.group].some((field) =>
                    String(field).toLowerCase().includes(term)
                )
        );
        return list.sort((a, b) =>
            sortAscending ? a.product.localeCompare(b.product) : b.product.localeCompare(a.product)
        );
    }, [imbalances, lookbackDays, searchTerm, sortAscending]);

    return (
        <>
            <ImbalanceAlertList
                alerts={alerts.slice(0, MAX_ROWS)}
                searchTerm={searchTerm}
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
