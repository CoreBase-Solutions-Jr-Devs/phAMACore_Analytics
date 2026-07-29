import React, { useMemo } from "react";
import ImbalanceAlertList from "./ImbalanceAlertList";
import { useImbalanceEngine } from "./useImbalanceEngine";
import { mockImbalanceAlerts } from "../Sample/imbalanceAlerts";
// import { mockImbalanceAlerts } from "../../mock/imbalanceAlerts";

const ImbalanceAlertsContainer = ({ stock, movements, expiry }) => {
    const alerts = useMemo(() => {

        const generated = useImbalanceEngine(stock, movements, expiry);

        return generated.length
            ? generated
            : mockImbalanceAlerts;

    }, [stock, movements, expiry]);

    return <ImbalanceAlertList alerts={alerts} />;
};

export default ImbalanceAlertsContainer;