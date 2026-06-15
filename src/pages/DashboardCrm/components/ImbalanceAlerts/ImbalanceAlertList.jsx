import React from "react";
import { ListGroup } from "reactstrap";
import ImbalanceAlertItem from "./ImbalanceAlertItem";

const ImbalanceAlertList = ({ alerts }) => {
    if (!alerts?.length) {
        return <p className="text-muted">No imbalance detected</p>;
    }

    return (
        <ListGroup className="list mb-0" flush>
            {alerts.map((item, i) => (
                <ImbalanceAlertItem key={item.id} data={item} index={i} />
            ))}
        </ListGroup>
    );
};

export default ImbalanceAlertList;