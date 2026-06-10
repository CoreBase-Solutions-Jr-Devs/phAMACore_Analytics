import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import CountUp from "react-countup";

const WidgetsTwo = () => {
    const batchExpiryNeo = useSelector(
        (state) => state.StockInventory.batchExpiryNeo || []
    );

    // console.log("batchExpiryNeo", batchExpiryNeo);

    const widgetData = useMemo(() => {
        let lessThan30 = 0;
        let between31and60 = 0;
        let between61and90 = 0;

        const today = new Date();

        batchExpiryNeo.forEach((item) => {
            if (!item.expirydate) return;

            const expiryDate = new Date(item.expirydate);

            const daysToExpiry = Math.ceil(
                (expiryDate - today) / (1000 * 60 * 60 * 24)
            );

            if (daysToExpiry <= 30) {
                lessThan30++;
            } else if (daysToExpiry <= 60) {
                between31and60++;
            } else if (daysToExpiry <= 90) {
                between61and90++;
            }
        });

        return [
            {
                label: "<= 30 Days Stock",
                counter: lessThan30,
                icon: "ri-fire-line text-danger",
                badge: "ri-arrow-up-circle-line text-success",
            },
            {
                label: "31-60 Days Stock",
                counter: between31and60,
                icon: "ri-timer-flash-line text-warning",
                badge: "ri-arrow-up-circle-line text-success",
            },
            {
                label: "61-90 Days Stock",
                counter: between61and90,
                icon: "ri-time-line text-info",
                badge: "ri-arrow-down-circle-line text-danger",
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
                            <i
                                className={`${widget.badge} fs-18 float-end align-middle`}
                            ></i>
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