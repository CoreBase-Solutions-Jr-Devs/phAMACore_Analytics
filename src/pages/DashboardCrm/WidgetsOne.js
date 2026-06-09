import React, { useEffect, useMemo } from "react";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchDailyClosingStock, fetchStockMovements, fetchBatchExpiry } from "../../slices/dashboardCRM/thunk";
import { KPI_META, computeKPIs, getTodayApi, getNDaysAgoApi} from "../utils/StockInventoryUtils";


const KPI_ICON_MAP = {
    1: { icon: "package", color: "primary" }, // Total SKUs
    2: { icon: "dollar-sign", color: "success" }, // Total Stock Value
    3: { icon: "alert-triangle", color: "warning" }, // Below Reorder Level
    4: { icon: "x-circle", color: "danger" }, // Out of Stock
    5: { icon: "clock", color: "danger" }, // Near Expiry
    6: { icon: "trending-down", color: "warning" }, // Slow Movers
    7: { icon: "layers", color: "warning" }, // Overstocked
    8: { icon: "git-branch", color: "info" }, // Branch Imbalances
};

const WidgetsOne = ({ branchMap = {} }) => {
    const dispatch = useDispatch();

    const {
        dailyClosingStock = [], stockMovements = [], batchExpiry = [],
        loadingStock, loadingMovements, errorStock,
    } = useSelector((state) => state.StockInventory ?? {});

    const { branch } = useSelector(
        (state) => state.StockInventory?.dcsParams ?? {}
    );

    const branchName =
        !branch || branch === "All Branches"
            ? "All Branches"
            : branchMap?.[branch] || "Unknown Branch";

    useEffect(() => {
        // All items — no itemcode / suppliercode / manufucturercode params
        dispatch(
            fetchDailyClosingStock({
                clientid: 1,
                startDate: "01/01/2026",
                endDate: getTodayApi(),
                branchcode: 1,
            })
        );

        // 30-day window for Slow Movers KPI
        dispatch(
            fetchStockMovements({
                clientid: 1,
                startDate: getNDaysAgoApi(30),
                endDate: getTodayApi(),
                branchcode: 1,
                itemcode: 20007,
            })
        );

        // Batch Expiry data - Near Expiry KPI
        dispatch(
            fetchBatchExpiry({
                clientid: 1,
                startDate: "01/01/2026",
                endDate: getTodayApi(),
                // branchcode: 1,
            })
        );
    }, [dispatch]);

    const kpis = useMemo(
        () => computeKPIs(dailyClosingStock, stockMovements, batchExpiry),
        [dailyClosingStock, stockMovements, batchExpiry]
    );

    const isLoading = loadingStock || loadingMovements;

    return (
        <React.Fragment>
            <div className="mb-2">
                <h4 className="card-title mb-0 text-start">
                    KEY METRICS
                    {branchName !== "All Branches" && ` — ${branchName}`}
                </h4>
            </div>

            <Row className="g-2 mb-2">
                {KPI_META.map((widget) => {
                    const { icon, color } =
                        KPI_ICON_MAP[widget.id] ?? { icon: "activity", color: "primary" };

                    return (
                        <Col xl={3} lg={4} md={6} sm={6} key={widget.id} className="d-flex">
                            <Card className="card-animate w-100">
                                <CardBody className="p-2">

                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="font-medium mb-0">{widget.label}</p>

                                            <h2 className={`mt-4 ff-secondary fw-semibold text-${color}`}>
                                                {isLoading ? (
                                                    <span className="placeholder-glow">
                                                        <span className="placeholder col-6 rounded" />
                                                    </span>
                                                ) : (
                                                    <CountUp
                                                        start={0}
                                                        end={kpis[widget.id] ?? 0}
                                                        prefix={widget.prefix ?? ""}
                                                        suffix={widget.suffix ?? ""}
                                                        separator={widget.separator ?? ","}
                                                        decimals={widget.decimals ?? 0}
                                                        duration={4}
                                                    />
                                                )}
                                            </h2>

                                            <p className="text-muted mb-0">
                                                {widget.subtitle ?? "\u00A0"}
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

            {errorStock && (
                <div className="alert alert-danger mt-2" role="alert">
                    {typeof errorStock === "string"
                        ? errorStock
                        : "Failed to load inventory data."}
                </div>
            )}
        </React.Fragment>
    );
};

export default WidgetsOne;