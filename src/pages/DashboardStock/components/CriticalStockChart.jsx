import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Spinner } from "reactstrap";
import BarChartOne from "../Charts/Custom/BarChartOne";
import Pagination from "../../../Components/Common/Pagination";

const ITEMS_PER_PAGE = 15;

const CriticalStockChart = () => {
    const {
        criticalStockouts = [],
        loadingCriticalStockouts,
        errorCriticalStockouts,
    } = useSelector((state) => state.StockInventory ?? {});

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredItems = useMemo(() => {
        if (!criticalStockouts || !criticalStockouts.length) return [];
        if (!searchTerm.trim()) return criticalStockouts;

        const term = searchTerm.toLowerCase().trim();
        return criticalStockouts.filter((item) => {
            const name = (item.item_name || "").toLowerCase();
            const code = (item.item_code || "").toLowerCase();
            const group = (item.item_group || "").toLowerCase();
            const branch = (item.branch_name || "").toLowerCase();
            return (
                name.includes(term) ||
                code.includes(term) ||
                group.includes(term) ||
                branch.includes(term)
            );
        });
    }, [criticalStockouts, searchTerm]);

    const displayedItems = useMemo(() => {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }, [filteredItems, currentPage]);

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

    if (!criticalStockouts.length) {
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

    const searchHeader = (
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
            <div className="text-muted small">
                {filteredItems.length > 0 ? (
                    <>
                        Showing{" "}
                        <span className="fw-semibold text-dark">
                            {Math.min(
                                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                filteredItems.length
                            )}
                            -
                            {Math.min(
                                currentPage * ITEMS_PER_PAGE,
                                filteredItems.length
                            )}
                        </span>{" "}
                        of{" "}
                        <span className="fw-semibold text-dark">
                            {filteredItems.length}
                        </span>{" "}
                        critical items
                        {searchTerm && (
                            <span className="ms-1 text-muted">
                                (filtered from {criticalStockouts.length})
                            </span>
                        )}
                    </>
                ) : (
                    <span>No matching items found</span>
                )}
            </div>

            <div
                className="search-box ms-auto"
                style={{ minWidth: "220px", maxWidth: "280px" }}
            >
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search critical items..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                <i className="ri-search-line search-icon"></i>
            </div>
        </div>
    );

    if (searchTerm && !filteredItems.length) {
        return (
            <div>
                {searchHeader}
                <div
                    className="d-flex flex-column justify-content-center align-items-center py-5 my-3 text-center"
                    style={{ height: "360px" }}
                >
                    <i className="ri-search-eye-line text-muted display-4 mb-2"></i>
                    <div className="text-muted fw-medium">
                        No critical items matched "{searchTerm}"
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-link text-primary mt-2"
                        onClick={() => {
                            setSearchTerm("");
                            setCurrentPage(1);
                        }}
                    >
                        Clear search filter
                    </button>
                </div>
            </div>
        );
    }

    const paginationElement = (
        <div style={{ marginBottom: "-1.5rem" }}>
            <Pagination
                data={filteredItems}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                perPageData={ITEMS_PER_PAGE}
            />
        </div>
    );

    return (
        <div>
            {searchHeader}

            <BarChartOne
                categories={chartData.categories}
                data={chartData.data}
                colors={chartData.colors}
                metadata={chartData.metadata}
                reorderLine={14}
                height={440}
                paginationComponent={paginationElement}
            />
        </div>
    );
};

export default CriticalStockChart;