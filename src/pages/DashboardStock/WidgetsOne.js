import React, { useMemo } from "react";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { computeKPIs, getKPIMeta, getLookbackDays, IMBALANCE_TOP_N } from "../utils/StockInventoryUtils";


const KPI_ICON_MAP = {
    // 1: { icon: "package", color: "primary" }, // Total SKUs
    // 2: { icon: "ksh", color: "success" }, // Total Stock Value
    3: { icon: "alert-triangle", color: "warning" }, // Below Reorder Level
    4: { icon: "x-circle", color: "danger" }, // Out of Stock
    5: { icon: "clock", color: "danger" }, // Near Expiry
    6: { icon: "trending-down", color: "warning" }, // Slow Movers
    7: { icon: "layers", color: "warning" }, // Overstocked
    8: { icon: "git-branch", color: "info" }, // Branch Imbalances
};

const WidgetsOne = () => {

    const {
        batchExpiryNeo = [], stockHealth = [], imbalances = [], branches = [], filters = {}, appliedFilters,
        loadingBatchExpiryNeo, loadingStockHealth, loadingImbalances, errorStockHealth,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;
    const lookbackDays = getLookbackDays(activeFilters.startDate, activeFilters.endDate);

    const kpis = useMemo(
        () =>
            computeKPIs(batchExpiryNeo, stockHealth, imbalances, {
                branchCode: activeFilters.branch,
                branches,
                asOfDate: activeFilters.endDate,
            }),
        [batchExpiryNeo, stockHealth, imbalances, activeFilters.branch, branches, activeFilters.endDate]
    );

    const meta = useMemo(
        () => getKPIMeta({ lookbackDays, imbalanceCapped: imbalances.length >= IMBALANCE_TOP_N }),
        [lookbackDays, imbalances.length]
    );

    // Each card waits only for the call that feeds it
    const loadingById = { 5: loadingBatchExpiryNeo, 8: loadingImbalances };
    const errorStock = errorStockHealth;

    return (
        <React.Fragment>
            <Row className="g-2 mb-2" id="stock-kpi-widgets">
                {meta.map((widget) => {
                    const { icon, color } =
                        KPI_ICON_MAP[widget.id] ?? { icon: "activity", color: "primary" };

                    return (
                        <Col xl={2} lg={4} md={4} sm={6} xs={12} key={widget.id} className="d-flex">
                            <Card className="card-animate w-100 mb-0">
                                <CardBody className="p-2 d-flex flex-column justify-content-between">
                                    <div>
                                        <p className="font-medium mb-0 text-truncate">{widget.label}</p>

                                        <h2 className={`mt-2 ff-secondary fw-semibold text-${color}`}>
                                            {(loadingById[widget.id] ?? loadingStockHealth) ? (
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
                                                    duration={2}
                                                />
                                            )}
                                        </h2>
                                    </div>

                                    <p className="text-muted mb-0 small text-truncate">
                                        {widget.subtitle ?? "\u00A0"}
                                    </p>
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