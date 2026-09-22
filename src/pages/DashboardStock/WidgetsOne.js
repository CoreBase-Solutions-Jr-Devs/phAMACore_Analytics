import React, { useMemo } from "react";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { KPI_META, computeKPIs, getKPIMeta } from "../utils/StockInventoryUtils";
import { useImbalanceEngine } from "./components/ImbalanceAlerts/useImbalanceEngine";
import { resolveBranchName } from "../../helpers/branch_helper";


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

    const {
        dailyClosingStock = [], stockMovements = [], batchExpiryNeo = [], totalStockValueByBranch = [], stockHealth = [], slowMovingStock = [], branches = [],
        loadingStock, loadingMovements, loadingTotalStockValueByBranch, loadingStockHealth, loadingSlowMovingStock, errorStock,
    } = useSelector((state) => state.StockInventory ?? {});

    const branch = useSelector(
        (state) => state.StockInventory?.filters?.branch
    );

    const isBranchView = Boolean(branch && branch !== "All Branches");
    const branchDisplayName = isBranchView
        ? (branchMap?.[branch] || resolveBranchName(branch, branches, stockMovements) || `Branch ${branch}`)
        : "All Branches";

    const alerts = useMemo(
        () => useImbalanceEngine(dailyClosingStock, stockMovements, batchExpiryNeo),
        [dailyClosingStock, stockMovements, batchExpiryNeo]
    );

    const kpis = useMemo(
        () => computeKPIs(dailyClosingStock, stockMovements, batchExpiryNeo, totalStockValueByBranch, stockHealth, slowMovingStock, alerts),
        [dailyClosingStock, stockMovements, batchExpiryNeo, totalStockValueByBranch, stockHealth, slowMovingStock, alerts]
    );

    const healthObj = Array.isArray(stockHealth) && stockHealth.length > 0
        ? stockHealth[0]
        : (stockHealth && typeof stockHealth === "object" && !Array.isArray(stockHealth) ? stockHealth : null);

    const meta = useMemo(
        () => getKPIMeta({ branchName: branchDisplayName, isBranchView, healthObj }),
        [branchDisplayName, isBranchView, healthObj]
    );

    const isLoading = loadingStock || loadingMovements || loadingTotalStockValueByBranch || loadingStockHealth || loadingSlowMovingStock;

    return (
        <React.Fragment>

            <Row className="g-2 mb-2">
                {meta.map((widget) => {
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