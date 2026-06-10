import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import CountUp from "react-countup";

const WidgetsTwo = () => {
    const batchExpiryNeo = useSelector(
        (state) => state.StockInventory.batchExpiryNeo || []
    );

    const widgetData = useMemo(() => {
        let days0to30 = 0;
        let days31to60 = 0;
        let days61to90 = 0;

        const today = new Date();
        const msPerDay = 1000 * 60 * 60 * 24;

        batchExpiryNeo.forEach((item) => {
            if (!item.expirydate) return;

            const expiryDate = new Date(item.expirydate);

            const daysToExpiry = Math.ceil(
                (expiryDate - today) / msPerDay
            );

            if (daysToExpiry < 0 || daysToExpiry > 90) return;

            if (daysToExpiry <= 30) {
                days0to30++;
            } else if (daysToExpiry <= 60) {
                days31to60++;
            } else {
                days61to90++;
            }
        });

        return [
            {
                label: "0 - 30 Days (Critical)",
                counter: days0to30,
                icon: "ri-fire-line text-danger",
                badge: "ri-arrow-up-circle-line text-danger",
            },
            {
                label: "31 - 60 Days (Warning)",
                counter: days31to60,
                icon: "ri-timer-flash-line text-warning",
                badge: "ri-arrow-right-circle-line text-warning",
            },
            {
                label: "61 - 90 Days (Watch)",
                counter: days61to90,
                icon: "ri-time-line text-info",
                badge: "ri-arrow-down-circle-line text-info",
            },
        ];
    }, [batchExpiryNeo]);

    return (
        <div className="row row-cols-xxl-3 row-cols-md-3 row-cols-1 g-0">
            {widgetData.map((widget, index) => (
                <div className="col" key={index}>
                    <div className="py-4 px-3">
                        <h5 className="text-muted text-uppercase fs-13">
                            {widget.label}
                            <i className={`${widget.badge} fs-18 float-end align-middle`}></i>
                        </h5>

                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <i className={`${widget.icon} display-6`}></i>
                            </div>

                            <div className="flex-grow-1 ms-3">
                                <h2 className="mb-0">
                                    <CountUp
                                        start={0}
                                        end={widget.counter}
                                        duration={2}
                                    />
                                    <span className="fs-14 ms-1">Products</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WidgetsTwo;