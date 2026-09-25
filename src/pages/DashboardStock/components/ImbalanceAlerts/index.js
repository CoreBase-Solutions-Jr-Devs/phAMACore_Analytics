import React from "react";
import { useSelector } from "react-redux";
import ImbalanceAlertsContainer from "./ImbalanceAlertsContainer";

const ImbalanceAlerts = ({
    stock,
    movements,
    expiry,
    searchTerm = "",
    sortAscending = true,
}) => {
    const {
        dailyClosingStock = [],
        stockMovements = [],
        batchExpiryNeo = [],
        loadingStock = false,
        errorStock = null,
    } = useSelector((state) => state.StockInventory ?? {});

    const stockData = stock !== undefined ? stock : dailyClosingStock;
    const movementsData = movements !== undefined ? movements : stockMovements;
    const expiryData = expiry !== undefined ? expiry : batchExpiryNeo;

    return (
        <ImbalanceAlertsContainer
            stock={stockData}
            movements={movementsData}
            expiry={expiryData}
            searchTerm={searchTerm}
            sortAscending={sortAscending}
            isLoading={loadingStock}
            error={errorStock}
        />
    );
};

export default ImbalanceAlerts;