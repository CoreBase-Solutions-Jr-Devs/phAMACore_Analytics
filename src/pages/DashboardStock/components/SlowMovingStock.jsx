import React, { useMemo } from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import { Link } from "react-router-dom";
import moment from "moment";

const SlowMovingStock = ({ movements = [] }) => {
    const processed = useMemo(() => {
        const now = moment();
        const DAYS_WINDOW = 30;

        // 1. Filter last 30 days
        const last30Days = movements.filter((m) =>
            moment(m.movement_date).isAfter(now.clone().subtract(DAYS_WINDOW, "days"))
        );

        // 2. Group by item_Code
        const grouped = {};

        last30Days.forEach((m) => {
            const key = m.item_Code;

            if (!grouped[key]) {
                grouped[key] = {
                    item_Code: m.item_Code,
                    item_Name: m.item_Name,
                    totalQty: 0,
                    lastMovement: m.movement_date,
                };
            }

            grouped[key].totalQty += Math.abs(Number(m.quantity));

            // keep latest movement
            if (
                moment(m.movement_date).isAfter(
                    moment(grouped[key].lastMovement)
                )
            ) {
                grouped[key].lastMovement = m.movement_date;
            }
        });

        // 3. Convert + compute inactivity days
        const result = Object.values(grouped).map((item) => {
            const daysSince = now.diff(moment(item.lastMovement), "days");

            let status = "Slow";
            if (item.totalQty === 0 || daysSince > 30) status = "Dead Stock";
            else if (item.totalQty <= 3) status = "Slow";
            else if (item.totalQty <= 6) status = "Moderate";

            return {
                ...item,
                daysSince,
                status,
            };
        });

        // 4. Sort by inactivity (worst first)
        return result.sort((a, b) => b.daysSince - a.daysSince);
    }, [movements]);

    const getBadgeClass = (status) => {
        switch (status) {
            case "Dead Stock":
                return "danger";
            case "Slow":
                return "warning";
            default:
                return "info";
        }
    };

    return (
        <ListGroup className="list mb-0" flush>
            {processed.map((item, idx) => (
                <ListGroupItem key={idx} data-id={idx}>
                    <div className="d-flex">
                        <div className="flex-grow-1">
                            <h5 className="fs-13 mb-1">
                                <Link to="#" className="link name text-body">
                                    {item.item_Name}
                                </Link>
                            </h5>

                            <p className="text-muted mb-0">
                                Code: {item.item_Code} • {item.totalQty} units moved •{" "}
                                {item.daysSince} days inactive
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            <span
                                className={`badge rounded-pill border border-${getBadgeClass(
                                    item.status
                                )} text-${getBadgeClass(item.status)} fs-11 fw-normal px-2 py-1`}
                            >
                                {item.status}
                            </span>
                        </div>
                    </div>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default SlowMovingStock;