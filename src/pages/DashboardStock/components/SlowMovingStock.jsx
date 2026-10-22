import React, { useMemo } from "react";
import { Spinner } from "reactstrap";
import { useSelector } from "react-redux";
import { cleanBranchName } from "../../../helpers/branch_helper";
import { getLookbackDays } from "../../utils/StockInventoryUtils";

const MAX_ROWS = 100;

const formatDaysCover = (item) => {
    if (item.daysOfInventory !== null && !isNaN(item.daysOfInventory)) {
        if (item.daysOfInventory >= 9999) return "No sales";
        return `${Math.round(item.daysOfInventory).toLocaleString()}d`;
    }
    if (item.daysSince !== null) {
        return `${item.daysSince}d inactive`;
    }
    return "-";
};

const SlowMovingStock = ({
    items,
    searchTerm = "",
    sortAscending = true,
}) => {
    const {
        slowMovingStock = [],
        loadingSlowMovingStock = false,
        errorSlowMovingStock = null,
        filters = {},
    } = useSelector((state) => state.StockInventory ?? {});

    const lookbackDays = getLookbackDays(filters.startDate, filters.endDate);

    const processed = useMemo(() => {
        // 1. Determine data source: prop items -> Redux slowMovingStock
        let rawList = [];

        if (Array.isArray(items) && items.length > 0) {
            rawList = items;
        } else if (Array.isArray(slowMovingStock) && slowMovingStock.length > 0) {
            rawList = slowMovingStock;
        }

        // 2. Normalize items to uniform shape
        const normalized = rawList.map((item) => {
            const itemName = item.item_name || item.item_Name || "Unknown Item";
            const itemCode = item.item_code || item.item_Code || "";
            const itemGroup = item.item_group || "-";
            const itemSubGroup = item.item_subgroup || "-";
            const category = item.movement_category || item.status || "SLOW_MOVER";

            let statusLabel = "Slow";
            let badgeClass = "warning";

            if (category === "DEAD_STOCK" || category === "Dead Stock") {
                statusLabel = "Dead Stock";
                badgeClass = "danger";
            } else if (category === "SLOW_MOVER" || category === "Slow Mover" || category === "Slow") {
                statusLabel = "Slow";
                badgeClass = "warning";
            } else if (category === "Moderate") {
                statusLabel = "Moderate";
                badgeClass = "info";
            } else {
                statusLabel = category;
                badgeClass = "secondary";
            }

            return {
                ...item,
                itemName,
                itemCode,
                itemGroup,
                itemSubGroup,
                statusLabel,
                badgeClass,
                unitsSold: item.units_sold_window !== undefined ? Number(item.units_sold_window) : (item.totalQty ?? 0),
                currentStock: item.current_stock_qty !== undefined ? Number(item.current_stock_qty) : undefined,
                tiedUpCapital: item.tied_up_capital !== undefined ? Number(item.tied_up_capital) : undefined,
                daysOfInventory: item.days_of_inventory !== undefined ? Number(item.days_of_inventory) : null,
                branchName: cleanBranchName(item.branch_name || item.branchName),
                daysSince: item.daysSince !== undefined ? item.daysSince : null,
                actionInsight: item.action_insight,
            };
        });

        // 3. Filter by search term (item name, code, category, or branch)
        const term = (searchTerm || "").trim().toLowerCase();
        const filtered = term
            ? normalized.filter((item) => {
                  return (
                      item.itemName.toLowerCase().includes(term) ||
                      item.itemCode.toLowerCase().includes(term) ||
                      item.itemGroup.toLowerCase().includes(term) ||
                      item.itemSubGroup.toLowerCase().includes(term) ||
                      (item.branchName && item.branchName.toLowerCase().includes(term))
                  );
              })
            : normalized;

        // 4. Sort alphabetically by itemName (null keeps the API order: most capital tied up first)
        if (sortAscending === null) return filtered;
        return [...filtered].sort((a, b) => {
            return sortAscending
                ? a.itemName.localeCompare(b.itemName)
                : b.itemName.localeCompare(a.itemName);
        });
    }, [items, slowMovingStock, searchTerm, sortAscending]);

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
        <div>
            <div className="table-responsive">
                <table className="table table-sm table-hover table-borderless table-nowrap align-middle mb-0">
                    <thead
                        className="text-muted table-light"
                        style={{ position: "sticky", top: 0, zIndex: 1 }}
                    >
                        <tr>
                            <th scope="col">Product</th>
                            <th scope="col">Category</th>
                            <th scope="col">Branch</th>
                            <th scope="col" className="text-end">Stock</th>
                            <th scope="col" className="text-end">Sold ({lookbackDays}d)</th>
                            <th scope="col" className="text-end">Days Cover</th>
                            <th scope="col" className="text-end">Tied-Up Capital (KES)</th>
                            <th scope="col" className="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processed.slice(0, MAX_ROWS).map((item, idx) => (
                            <tr
                                key={`${item.itemCode}-${item.branchName}-${idx}`}
                                data-id={idx}
                                title={item.actionInsight || undefined}
                            >
                                <th scope="row" className="fw-medium">
                                    {item.itemName}
                                    {item.itemCode && (
                                        <small className="text-muted d-block fw-normal">
                                            {item.itemCode}
                                        </small>
                                    )}
                                </th>
                                <td className="text-muted">
                                    {item.itemGroup || "-"}
                                    <small className="text-muted d-block">
                                        {item.itemSubGroup === "Unassigned" ? "-" :
                                            item.itemSubGroup || "-"
                                        }
                                    </small>
                                </td>
                                <td>{item.branchName || "-"}</td>
                                <td className="text-end">
                                    {item.currentStock !== undefined
                                        ? item.currentStock.toLocaleString()
                                        : "-"}
                                </td>
                                <td className="text-end">{item.unitsSold.toLocaleString()}</td>
                                <td className="text-end">{formatDaysCover(item)}</td>
                                <td className="text-end fw-medium">
                                    {item.tiedUpCapital !== undefined
                                        ? item.tiedUpCapital.toLocaleString(undefined, {
                                              maximumFractionDigits: 0,
                                          })
                                        : "-"}
                                </td>
                                <td className="text-center">
                                    <span
                                        className={`badge rounded-pill border border-${item.badgeClass} text-${item.badgeClass} bg-${item.badgeClass}-subtle fs-11 fw-normal px-2 py-1`}
                                    >
                                        {item.statusLabel}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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