import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Spinner } from "reactstrap";
import BarChartOne from "../Charts/Custom/BarChartOne";

const ITEMS_PER_PAGE = 15;

const CriticalStockChart = () => {
    const {
        criticalStockouts = [],
        loadingCriticalStockouts,
        errorCriticalStockouts,
    } = useSelector((state) => state.StockInventory ?? {});

    const [viewMode, setViewMode] = useState("top15"); // "top15" | "next15" | "all"

    const displayedItems = useMemo(() => {
        if (!criticalStockouts || !criticalStockouts.length) {
            return [];
        }

        if (viewMode === "top15") {
            return criticalStockouts.slice(0, ITEMS_PER_PAGE);
        }
        if (viewMode === "next15") {
            return criticalStockouts.slice(ITEMS_PER_PAGE, ITEMS_PER_PAGE * 2);
        }
        // "all" mode (scrollable)
        return criticalStockouts;
    }, [criticalStockouts, viewMode]);

    const chartData = useMemo(() => {
        if (!displayedItems.length) {
            return { categories: [], data: [], colors: [], metadata: [] };
        }

        const categories = displayedItems.map(
            (item) => item.item_name || item.item_code || "Unknown"
        );
        const data = displayedItems.map((item) =>
            Number(item.days_of_inventory ?? 0)
        );
        const metadata = displayedItems.map((item) => ({
            stock: item.current_stock_qty ?? 0,
            min: item.effective_min_qty ?? item.branch_min_qty ?? 0,
            status:
                item.stockout_risk_status ||
                (Number(item.days_of_inventory ?? 0) <= 6
                    ? "CRITICAL"
                    : "REORDER"),
            branch: item.branch_name,
            insight: item.action_insight,
        }));
        const colors = displayedItems.map((item) => {
            if (
                item.stockout_risk_status === "STOCKED_OUT" ||
                Number(item.days_of_inventory ?? 0) <= 6
            ) {
                return "#f06548"; // Danger
            }
            if (Number(item.days_of_inventory ?? 0) <= 14) {
                return "#f7b84b"; // Warning / Reorder
            }
            return "#0ab39c"; // Safe
        });

        return { categories, data, colors, metadata };
    }, [displayedItems]);

    if (loadingCriticalStockouts) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-5 my-3"
                style={{ height: "460px" }}
            >
                <Spinner color="primary" className="mb-3">
                    Loading...
                </Spinner>
                <h6 className="text-muted mb-1">
                    Loading Critical Stock Levels
                </h6>
                <small className="text-muted">
                    Analyzing Class A revenue drivers at risk...
                </small>
            </div>
        );
    }

    if (errorCriticalStockouts) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-5 my-3 text-danger text-center"
                style={{ height: "460px" }}
            >
                <i className="ri-error-warning-line display-4 mb-2"></i>
                <div>{errorCriticalStockouts}</div>
            </div>
        );
    }

    if (!chartData.categories.length) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center py-5 my-3 text-center"
                style={{ height: "460px" }}
            >
                <i className="ri-checkbox-circle-line text-success display-4 mb-2"></i>
                <div className="text-muted fw-medium">
                    No critical stockout items found
                </div>
                <small className="text-muted">
                    All monitored Class A items are within safe stock levels.
                </small>
            </div>
        );
    }

    const hasMultiplePages = criticalStockouts.length > ITEMS_PER_PAGE;

    return (
        <div>
            {hasMultiplePages && (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                    <div className="text-muted small">
                        <span className="fw-semibold text-dark">
                            {viewMode === "top15" &&
                                `Showing Top 15 (Highest Risk)`}
                            {viewMode === "next15" &&
                                `Showing Items 16–${Math.min(
                                    ITEMS_PER_PAGE * 2,
                                    criticalStockouts.length
                                )}`}
                            {viewMode === "all" &&
                                `Showing All ${criticalStockouts.length} Items (Scrollable)`}
                        </span>{" "}
                        <span className="text-muted">
                            of {criticalStockouts.length} total monitored
                        </span>
                    </div>

                    <div className="btn-group btn-group-sm" role="group">
                        <button
                            type="button"
                            className={`btn ${
                                viewMode === "top15"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                            }`}
                            onClick={() => setViewMode("top15")}
                        >
                            Top 15
                        </button>
                        <button
                            type="button"
                            className={`btn ${
                                viewMode === "next15"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                            }`}
                            onClick={() => setViewMode("next15")}
                        >
                            Items 16–{Math.min(ITEMS_PER_PAGE * 2, criticalStockouts.length)}
                        </button>
                        <button
                            type="button"
                            className={`btn ${
                                viewMode === "all"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                            }`}
                            onClick={() => setViewMode("all")}
                        >
                            <i className="ri-arrow-up-down-line me-1"></i>
                            All (Scroll)
                        </button>
                    </div>
                </div>
            )}

            <BarChartOne
                categories={chartData.categories}
                data={chartData.data}
                colors={chartData.colors}
                metadata={chartData.metadata}
                reorderLine={14}
                height={460}
                enableScroll={viewMode === "all"}
            />
        </div>
    );
};

export default CriticalStockChart;