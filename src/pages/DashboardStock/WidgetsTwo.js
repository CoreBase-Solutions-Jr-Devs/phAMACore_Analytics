import React, { useMemo } from "react";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { EXPIRY_BUCKETS, getExpiryRows } from "../utils/StockInventoryUtils";
import { formatCompact } from "../utils/formatHelper";

const EXPIRY_ICON_MAP = {
    expired: "x-octagon",
    "0-30": "alert-octagon",
    "31-60": "clock",
    "61-90": "eye",
};

const WidgetsTwo = () => {
    const batchExpiryNeo = useSelector(
        (state) => state.StockInventory?.batchExpiryNeo ?? []
    );

    // Batches (not products) per bucket, so the cards add up to the table below
    const widgetData = useMemo(() => {
        const rows = getExpiryRows(batchExpiryNeo);
        return EXPIRY_BUCKETS.map((bucket) => {
            const inBucket = rows.filter((row) => row.bucket === bucket.id);
            return {
                ...bucket,
                counter: inBucket.length,
                value: inBucket.reduce((sum, row) => sum + row.value, 0),
            };
        });
    }, [batchExpiryNeo]);

    return (
        <Row className="g-2 mb-2">
            {widgetData.map((widget) => (
                <Col xl={3} lg={3} md={6} sm={6} key={widget.id} className="d-flex px-2 pt-2">
                    <Card className="card-animate w-100">
                        <CardBody className="p-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="font-medium mb-0">{widget.label}</p>

                                    <h2 className={`mt-4 ff-secondary fw-semibold text-${widget.color}`}>
                                        <CountUp start={0} end={widget.counter} separator="," duration={2} />
                                    </h2>

                                    <p className="text-muted mb-0">
                                        {widget.counter === 1 ? "batch" : "batches"} · KES {formatCompact(widget.value)} at cost
                                    </p>
                                </div>

                                <div className="avatar-sm flex-shrink-0">
                                    <span className={`avatar-title bg-${widget.color}-subtle rounded-circle fs-2`}>
                                        <FeatherIcon icon={EXPIRY_ICON_MAP[widget.id]} className={`text-${widget.color}`} />
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default WidgetsTwo;
