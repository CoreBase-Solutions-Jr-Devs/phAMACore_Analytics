import React, { useMemo } from "react";
import ImbalanceAlertList from "./ImbalanceAlertList";
import { useImbalanceEngine } from "./useImbalanceEngine";

const ImbalanceAlertsContainer = ({ stock, movements, expiry }) => {
    const alerts = useMemo(() => {
        return useImbalanceEngine(stock, movements, expiry);
    }, [stock, movements, expiry]);

    return <ImbalanceAlertList alerts={alerts} />;
};

export default ImbalanceAlertsContainer;