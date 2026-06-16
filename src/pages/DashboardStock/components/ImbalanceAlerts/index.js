import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import ImbalanceAlertsContainer from "./ImbalanceAlertsContainer";

const ImbalanceAlerts = () => {
    const { dailyClosingStock, stockMovements, batchExpiryNeo } = useSelector(
        (state) => state.StockInventory
    );

    return (
        <ImbalanceAlertsContainer
            stock={dailyClosingStock}
            movements={stockMovements}
            expiry={batchExpiryNeo}
        />
    );
};

export default ImbalanceAlerts;