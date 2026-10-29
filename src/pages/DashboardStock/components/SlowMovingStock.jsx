import React, { useMemo, useState } from "react";
import { Spinner } from "reactstrap";
import { useSelector } from "react-redux";
import FloatingTooltip from "../../../Components/Common/FloatingTooltip";
import {
    buildSlowMovingRows,
    formatSlowDaysCover,
    getLookbackDays,
    sortSlowMovingRows,
} from "../../utils/StockInventoryUtils";

const MAX_ROWS = 100;

const SlowMovingStock = ({
    items,
    searchTerm = "",
    sortField = "tiedUpCapital",
    sortDesc = true,
    onSort,
}) => {
    const [hoverInfo, setHoverInfo] = useState(null);

    const {
        slowMovingStock = [],
        loadingSlowMovingStock = false,
        errorSlowMovingStock = null,
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;
    const lookbackDays = getLookbackDays(activeFilters.startDate, activeFilters.endDate);

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

    const processed = useMemo(() => {
        // 1. Determine data source: prop items -> Redux slowMovingStock
        const rawList = Array.isArray(items) && items.length > 0 ? items : slowMovingStock;

        // 2. Normalize items to uniform shape
        const normalized = buildSlowMovingRows(rawList);

        // 3. Filter by search term (item name, code, category, or branch)
        const term = (searchTerm || "").trim().toLowerCase();
        const filtered = term
            ? normalized.filter((item) =>
                  [item.name, item.itemCode, item.group, item.subGroup, item.branch].some((field) =>
                      String(field || "").toLowerCase().includes(term)
                  )
              )
            : normalized;

        // 4. Sort by the selected column (default: most capital tied up first)
        return sortSlowMovingRows(filtered, sortField, sortDesc);
    }, [items, slowMovingStock, searchTerm, sortField, sortDesc]);

    const renderSortIcon = (field) => {
        if (sortField !== field) return null;
        return <i className={`ms-1 text-primary ${sortDesc ? "ri-arrow-down-line" : "ri-arrow-up-line"}`}></i>;
    };

    const renderSortableHeader = (field, label, className = "") => (
        <th
            scope="col"
            className={className}
            role={onSort ? "button" : undefined}
            onClick={onSort ? () => onSort(field) : undefined}
            style={onSort ? { cursor: "pointer", userSelect: "none" } : undefined}
        >
            {label}
            {renderSortIcon(field)}
        </th>
    );

    if (loadingSlowMovingStock && (!processed || processed.length === 0)) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center"
                style={{ minHeight: "180px" }}
            >
                <Spinner size="sm" color="primary" className="mb-2" />
                <small className="text-muted">Loading slow moving stock...</small>
            </div>
        );
    }

    if (errorSlowMovingStock && (!processed || processed.length === 0)) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-danger"
                style={{ minHeight: "180px" }}
            >
                <i className="ri-error-warning-line display-6 mb-2"></i>
                <small>{errorSlowMovingStock}</small>
            </div>
        );
    }

    if (!processed.length) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted"
                style={{ minHeight: "180px" }}
            >
                <i className="ri-inbox-line display-6 mb-2"></i>
                <div className="fw-medium">No slow moving items found</div>
                <small className="text-muted">
                    {searchTerm ? "Try adjusting your search query." : "All stock within this scope is moving well."}
                </small>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <div
                className="table-responsive"
                style={{ maxHeight: "400px", overflowY: "auto" }}
                onMouseLeave={handleMouseLeave}
            >
                <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                    <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                        <tr>
                            {renderSortableHeader("name", "Product")}
                            <th scope="col">Branch</th>
                            {renderSortableHeader("stockQty", "Stock Qty", "text-end")}
                            <th scope="col" className="text-end">Sold ({lookbackDays}D)</th>
                            {renderSortableHeader("daysCover", "Days Cover", "text-end")}
                            {renderSortableHeader("tiedUpCapital", "Tied-Up Capital", "text-end")}
                            <th scope="col" className="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processed.slice(0, MAX_ROWS).map((item, idx) => {
                            const tone = item.isDead ? "danger" : "warning";
                            const toneColor = item.isDead ? "#f06548" : "#f7b84b";

                            return (
                                <tr key={item.id} data-id={idx}>
                                    <th
                                        scope="row"
                                        className="fw-medium"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: item.name,
                                                badgeColor: toneColor,
                                                mainValue: item.itemCode ? `SKU: ${item.itemCode}` : item.name,
                                                mainColor: "#299cdb",
                                                subText: `Category: ${item.category} · Branch: ${item.branch}`,
                                                extraText: item.actionInsight || undefined,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.name}
                                        <small className="text-muted d-block fw-normal">
                                            {[item.itemCode, item.category].filter(Boolean).join(" · ")}
                                        </small>
                                    </th>
                                    <td
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: item.branch || "Branch Location",
                                                badgeColor: "#405189",
                                                mainValue: `${item.stockQty.toLocaleString()} units on hand`,
                                                mainColor: "#00e396",
                                                subText: `${item.unitsSold.toLocaleString()} units sold in ${lookbackDays} days`,
                                                extraText: `Movement status: ${item.statusLabel}`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.branch || "-"}
                                    </td>
                                    <td
                                        className="text-end fw-semibold"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: "Current Stock On Hand",
                                                badgeColor: "#299cdb",
                                                mainValue: `${item.stockQty.toLocaleString()} units`,
                                                mainColor: "#299cdb",
                                                subText: `Sold in window: ${item.unitsSold.toLocaleString()} units`,
                                                extraText: `Days of Inventory Cover: ${formatSlowDaysCover(item.daysCover)}`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.stockQty.toLocaleString()}
                                    </td>
                                    <td
                                        className="text-end text-muted"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: `Units Sold (${lookbackDays} Days)`,
                                                badgeColor: "#0ab39c",
                                                mainValue: `${item.unitsSold.toLocaleString()} units sold`,
                                                mainColor: "#0ab39c",
                                                subText: `Current stock: ${item.stockQty.toLocaleString()} units`,
                                                extraText: item.unitsSold === 0 ? "Zero movement in the selected lookback period" : undefined,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.unitsSold.toLocaleString()}
                                    </td>
                                    <td
                                        className="text-end text-muted"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: "Days of Inventory Cover",
                                                badgeColor: toneColor,
                                                mainValue: formatSlowDaysCover(item.daysCover),
                                                mainColor: toneColor,
                                                subText: `Stock: ${item.stockQty.toLocaleString()} · Sold: ${item.unitsSold.toLocaleString()}`,
                                                extraText: item.daysCover >= 999 ? "Extremely high cover / zero sales recorded" : undefined,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {formatSlowDaysCover(item.daysCover)}
                                    </td>
                                    <td
                                        className="text-end fw-semibold"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: "Tied-Up Capital Valuation",
                                                badgeColor: "#00e396",
                                                mainValue: `KES ${item.tiedUpCapital.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`,
                                                mainColor: "#00e396",
                                                subText: `Unit Avg Cost: KES ${item.unitAvgCost.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`,
                                                extraText: `Holding ${item.stockQty.toLocaleString()} units at ${item.branch}`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span>
                                            KES {item.tiedUpCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </td>
                                    <td
                                        className="text-center"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: item.statusLabel,
                                                badgeColor: toneColor,
                                                mainValue: item.statusLabel,
                                                mainColor: toneColor,
                                                subText: item.actionInsight || (item.isDead ? "No sales in lookback period" : "High days of inventory cover"),
                                                extraText: `Tied-up Capital: KES ${item.tiedUpCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span
                                            className={`badge rounded-pill border border-${tone} text-${tone} bg-${tone}-subtle fs-11 fw-normal px-2 py-1`}
                                        >
                                            {item.statusLabel}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Custom Floating Hover Tooltip matching Stock Value By Branch (BarChartTwo) */}
            <FloatingTooltip hoverInfo={hoverInfo} />

            {processed.length > MAX_ROWS && (
                <p className="text-muted fs-12 text-center mt-2 mb-0">
                    Showing {MAX_ROWS} of {processed.length.toLocaleString()} items. Search to narrow the
                    list, or export for all of them.
                </p>
            )}
        </div>
    );
};

export default SlowMovingStock;
