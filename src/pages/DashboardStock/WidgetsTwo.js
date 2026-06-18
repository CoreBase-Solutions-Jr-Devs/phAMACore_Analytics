import React, { useMemo } from "react";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

const EXPIRY_ICON_MAP = {
    1: { icon: "alert-octagon", color: "danger" },
    2: { icon: "clock", color: "warning" },
    3: { icon: "eye", color: "info" },
};

const WidgetsTwo = () => {
    const batchExpiryNeo = useSelector(
        (state) => state.StockInventory?.batchExpiryNeo ?? []
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
            const daysToExpiry = Math.ceil((expiryDate - today) / msPerDay);

            if (daysToExpiry < 0 || daysToExpiry > 90) return;

            if (daysToExpiry <= 30) days0to30++;
            else if (daysToExpiry <= 60) days31to60++;
            else days61to90++;
        });

        return [
            { id: 1, label: "0 - 30 Days (Critical)", counter: days0to30, subtitle: "Products" },
            { id: 2, label: "31 - 60 Days (Warning)", counter: days31to60, subtitle: "Products" },
            { id: 3, label: "61 - 90 Days (Watch)", counter: days61to90, subtitle: "Products" },
        ];
    }, [batchExpiryNeo]);

    return (
        <Row className="g-2 mb-2">
            {widgetData.map((widget) => {
                const { icon, color } =
                    EXPIRY_ICON_MAP[widget.id] ?? { icon: "activity", color: "primary" };
                const productLabel = widget.counter === 1 ? "product" : "products";

                return (
                    <Col xl={4} lg={4} md={4} sm={6} key={widget.id} className="d-flex px-2 pt-2">
                        <Card className="card-animate w-100">
                            <CardBody className="p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="font-medium mb-0">{widget.label}</p>

                                        <h2 className={`mt-4 ff-secondary fw-semibold text-${color}`}>
                                            <CountUp
                                                start={0}
                                                end={widget.counter}
                                                separator=","
                                                duration={4}
                                            />
                                        </h2>

                                        <p className="text-muted mb-0">
                                            {widget.counter} {productLabel}
                                        </p>
                                    </div>

                                    <div className="avatar-sm flex-shrink-0">
                                        <span
                                            className={`avatar-title bg-${color}-subtle rounded-circle fs-2`}
                                        >
                                            <FeatherIcon icon={icon} className={`text-${color}`} />
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};

export default WidgetsTwo;