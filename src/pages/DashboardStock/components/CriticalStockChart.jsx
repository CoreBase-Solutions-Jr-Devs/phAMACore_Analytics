import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Spinner } from "reactstrap";
import BarChartOne from "../Charts/Custom/BarChartOne";
import Pagination from "../../../Components/Common/Pagination";
import FloatingTooltip from "../../../Components/Common/FloatingTooltip";
import { cleanBranchName } from "../../../helpers/branch_helper";

const ITEMS_PER_PAGE = 15;

const ABC_HELP =
    "ABC class ranks items by sales revenue over the last 90 days, company-wide. " +
    "Class A items are the top sellers that together make up about 80% of revenue.";
const ORDER_HELP =
    "Estimate only: one month of demand plus the minimum level, less stock on hand. " +
    "It ignores stock on order, pack sizes and supplier minimums.";

const ABC_FILTER_OPTIONS = [
    { key: "ALL", label: "All" },
    { key: "A", label: "A" },
    { key: "B", label: "B" },
    { key: "C", label: "C" },
];

const normalizeAbcClass = (raw) =>
    String(raw || "")
        .toUpperCase()
        .replace(/^CLASS[_\s-]*/, "")
        .trim();

const qty = (value) => Math.round(Number(value || 0)).toLocaleString();

export const suggestedOrderQty = (item) =>
    Math.max(
        Math.ceil(
            Number(item.monthly_demand || 0) +
            Number(item.effective_min_qty ?? item.branch_min_qty ?? 0) -
            Number(item.current_stock_qty || 0)
        ),
        0
    );

const CriticalStockChart = () => {
    const {
        criticalStockouts = [],
        loadingCriticalStockouts,
        errorCriticalStockouts,
    } = useSelector((state) => state.StockInventory ?? {});

    const [searchTerm, setSearchTerm] = useState("");
    const [abcFilter, setAbcFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [hoverInfo, setHoverInfo] = useState(null);

    const handleCellHover = (e, info) => {
        setHoverInfo({
            ...info,
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleMouseMove = (e) => {
        if (hoverInfo) {
            setHoverInfo((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
        }
    };

    const handleMouseLeave = () => {
        setHoverInfo(null);
    };

    // Search-only filtered items (used to compute counts per ABC class)
    const searchMatchedItems = useMemo(() => {
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

    const abcCounts = useMemo(() => {
        const counts = { ALL: searchMatchedItems.length, A: 0, B: 0, C: 0 };
        searchMatchedItems.forEach((item) => {
            const cls = normalizeAbcClass(item.abc_class);
            if (counts[cls] !== undefined) {
                counts[cls] += 1;
            }
        });
        return counts;
    }, [searchMatchedItems]);

    const filteredItems = useMemo(() => {
        if (abcFilter === "ALL") return searchMatchedItems;
        return searchMatchedItems.filter(
            (item) => normalizeAbcClass(item.abc_class) === abcFilter
        );
    }, [searchMatchedItems, abcFilter]);

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
                (Number(item.days_of_inventory ?? 0) <= 7
                    ? "CRITICAL"
                    : "REORDER"),
            branch: cleanBranchName(item.branch_name || item.branchName),
            insight: item.action_insight,
        }));

        const colors = displayedItems.map((item) => {
            if (
                item.stockout_risk_status === "STOCKED_OUT" ||
                Number(item.days_of_inventory ?? 0) <= 7
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

    const isFiltered = Boolean(searchTerm.trim()) || abcFilter !== "ALL";

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
                        {isFiltered && (
                            <span className="ms-1 text-muted">
                                (filtered from {criticalStockouts.length}
                                {abcFilter !== "ALL" ? ` · Class ${abcFilter}` : ""})
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

    const abcFilterControl = (
        <div className="d-flex align-items-center gap-2">
            <span
                className="text-muted small fw-medium text-nowrap"
                style={{ cursor: "help" }}
                onMouseEnter={(e) =>
                    handleCellHover(e, {
                        title: "ABC Classification",
                        badgeColor: "#405189",
                        subText: ABC_HELP,
                    })
                }
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <i className="ri-filter-3-line me-1 align-middle" />
                ABC Class:
            </span>
            <div
                className="btn-group btn-group-sm"
                role="group"
                aria-label="Filter critical stock by ABC class"
            >
                {ABC_FILTER_OPTIONS.map((opt) => {
                    const isActive = abcFilter === opt.key;
                    const count = abcCounts[opt.key] ?? 0;
                    return (
                        <button
                            key={opt.key}
                            type="button"
                            className={`btn ${
                                isActive ? "btn-caramel" : "btn-outline-caramel"
                            }`}
                            onClick={() => {
                                setAbcFilter(opt.key);
                                setCurrentPage(1);
                            }}
                        >
                            {opt.key === "ALL" ? "All" : `Class ${opt.label}`}
                            <span className="badge bg-light text-body ms-1">
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

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

            {filteredItems.length > 0 ? (
                <>
                    <BarChartOne
                        categories={chartData.categories}
                        data={chartData.data}
                        colors={chartData.colors}
                        metadata={chartData.metadata}
                        reorderLine={7}
                        height={440}
                        toolbarSlot={abcFilterControl}
                        paginationComponent={paginationElement}
                    />

                    <div className="table-responsive mt-4" onMouseLeave={handleMouseLeave}>
                        <table className="table table-sm table-borderless table-nowrap align-middle mb-0">
                            <thead className="text-muted table-light">
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Branch</th>
                                    <th
                                        style={{ cursor: "help" }}
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: "ABC Classification",
                                                badgeColor: "#405189",
                                                subText: ABC_HELP,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        ABC <i className="ri-information-line align-middle" />
                                    </th>
                                    <th className="text-end">Stock</th>
                                    <th className="text-end">Minimum</th>
                                    <th className="text-end">Monthly Demand</th>
                                    <th className="text-end">Days Cover</th>
                                    <th
                                        className="text-end"
                                        style={{ cursor: "help" }}
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: "Suggested Order Quantity",
                                                badgeColor: "#0ab39c",
                                                subText: ORDER_HELP,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        Suggested Order<i className="ri-information-line align-middle" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedItems.map((item, idx) => {
                                    const branchName = cleanBranchName(item.branch_name || item.branchName) || "-";
                                    const isOut = Number(item.current_stock_qty) <= 0;
                                    const daysCover = Number(item.days_of_inventory ?? 0);
                                    const toneColor =
                                        isOut || item.stockout_risk_status === "STOCKED_OUT" || daysCover <= 7
                                            ? "#f06548"
                                            : daysCover <= 14
                                            ? "#f7b84b"
                                            : "#0ab39c";
                                    const orderEst = suggestedOrderQty(item);

                                    return (
                                        <tr
                                            key={`${item.item_code}-${item.branch_id}-${idx}`}
                                            onMouseEnter={(e) =>
                                                handleCellHover(e, {
                                                    title: item.item_name || "Unknown",
                                                    badgeColor: toneColor,
                                                    mainValue: isOut
                                                        ? `Out of Stock · ${daysCover.toFixed(1)}d cover`
                                                        : `${qty(item.current_stock_qty)} in stock · ${daysCover.toFixed(1)}d cover`,
                                                    mainColor: toneColor,
                                                    subText: `Branch: ${branchName} · Min: ${qty(item.effective_min_qty ?? item.branch_min_qty)} · Monthly Demand: ${qty(item.monthly_demand)}`,
                                                    extraText:
                                                        item.action_insight ||
                                                        `Suggested Order: ${qty(orderEst)} units (Class ${normalizeAbcClass(item.abc_class) || "-"})`,
                                                })
                                            }
                                            onMouseMove={handleMouseMove}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <td className="fw-medium">
                                                {item.item_name || "Unknown"}
                                                <small className="text-muted d-block">{item.item_code}</small>
                                            </td>
                                            <td className="text-muted">
                                                {item.item_group || "-"}
                                                <small className="text-muted d-block">
                                                    {item.item_subgroup === "Unassigned" ? "-" :
                                                        item.item_subgroup || "-"
                                                    }
                                                </small>
                                            </td>
                                            <td>{branchName}</td>
                                            <td>{normalizeAbcClass(item.abc_class) || "-"}</td>
                                            <td className={`text-end ${isOut ? "text-danger fw-semibold" : ""}`}>
                                                {qty(item.current_stock_qty)}
                                            </td>
                                            <td className="text-end">{qty(item.effective_min_qty ?? item.branch_min_qty)}</td>
                                            <td className="text-end">{qty(item.monthly_demand)}</td>
                                            <td className="text-end">{daysCover.toFixed(1)}</td>
                                            <td className="text-end fw-semibold">{qty(orderEst)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <div
                        className="d-flex flex-column justify-content-center align-items-center py-5 my-3 text-center"
                        style={{ height: "320px" }}
                    >
                        <i className="ri-search-eye-line text-muted display-4 mb-2"></i>
                        <div className="text-muted fw-medium">
                            No critical items matched
                            {searchTerm ? ` "${searchTerm}"` : ""}
                            {abcFilter !== "ALL" ? ` in Class ${abcFilter}` : ""}
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-link text-primary mt-2"
                            onClick={() => {
                                setSearchTerm("");
                                setAbcFilter("ALL");
                                setCurrentPage(1);
                            }}
                        >
                            Reset filters
                        </button>
                    </div>

                    <div className="px-2 pt-3 mt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="text-muted small">
                            <strong>Threshold:</strong> Vertical Line = Reorder @ 7 days of cover.
                        </div>
                        <div className="ms-auto">
                            {abcFilterControl}
                        </div>
                    </div>
                </>
            )}
            <FloatingTooltip hoverInfo={hoverInfo} />
        </div>
    );
};

export default CriticalStockChart;