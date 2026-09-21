import React, { useMemo } from "react";
import { ListGroup, ListGroupItem, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";

const SlowMovingStock = ({
    items,
    movements = [],
    searchTerm = "",
    sortAscending = true,
}) => {
    const {
        slowMovingStock = [],
        loadingSlowMovingStock = false,
        errorSlowMovingStock = null,
    } = useSelector((state) => state.StockInventory ?? {});

    const processed = useMemo(() => {
        // 1. Determine data source: prop items -> Redux slowMovingStock -> legacy movements fallback
        let rawList = [];

        if (Array.isArray(items) && items.length > 0) {
            rawList = items;
        } else if (Array.isArray(slowMovingStock) && slowMovingStock.length > 0) {
            rawList = slowMovingStock;
        } else if (Array.isArray(movements) && movements.length > 0) {
            // Legacy client-side fallback from movements
            const now = moment();
            const DAYS_WINDOW = 30;
            const last30Days = movements.filter((m) =>
                moment(m.movement_date).isAfter(now.clone().subtract(DAYS_WINDOW, "days"))
            );

            const grouped = {};
            last30Days.forEach((m) => {
                const key = m.item_Code || m.item_code;
                if (!grouped[key]) {
                    grouped[key] = {
                        item_code: key,
                        item_name: m.item_Name || m.item_name,
                        units_sold_window: 0,
                        lastMovement: m.movement_date,
                    };
                }
                grouped[key].units_sold_window += Math.abs(Number(m.quantity || 0));
                if (moment(m.movement_date).isAfter(moment(grouped[key].lastMovement))) {
                    grouped[key].lastMovement = m.movement_date;
                }
            });

            rawList = Object.values(grouped).map((item) => {
                const daysSince = now.diff(moment(item.lastMovement), "days");
                let movement_category = "SLOW_MOVER";
                if (item.units_sold_window === 0 || daysSince > 30) {
                    movement_category = "DEAD_STOCK";
                }
                return {
                    ...item,
                    daysSince,
                    movement_category,
                };
            });
        }

        // 2. Normalize items to uniform shape
        const normalized = rawList.map((item) => {
            const itemName = item.item_name || item.item_Name || "Unknown Item";
            const itemCode = item.item_code || item.item_Code || "";
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
                statusLabel,
                badgeClass,
                unitsSold: item.units_sold_window !== undefined ? Number(item.units_sold_window) : (item.totalQty ?? 0),
                currentStock: item.current_stock_qty !== undefined ? Number(item.current_stock_qty) : undefined,
                tiedUpCapital: item.tied_up_capital !== undefined ? Number(item.tied_up_capital) : undefined,
                branchName: item.branch_name,
                daysSince: item.daysSince !== undefined ? item.daysSince : null,
                actionInsight: item.action_insight,
            };
        });

        // 3. Filter by search term (item name, code, or branch)
        const term = (searchTerm || "").trim().toLowerCase();
        const filtered = term
            ? normalized.filter((item) => {
                  return (
                      item.itemName.toLowerCase().includes(term) ||
                      item.itemCode.toLowerCase().includes(term) ||
                      (item.branchName && item.branchName.toLowerCase().includes(term))
                  );
              })
            : normalized;

        // 4. Sort alphabetically by itemName
        return [...filtered].sort((a, b) => {
            return sortAscending
                ? a.itemName.localeCompare(b.itemName)
                : b.itemName.localeCompare(a.itemName);
        });
    }, [items, slowMovingStock, movements, searchTerm, sortAscending]);

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
        <ListGroup className="list mb-0" flush>
            {processed.map((item, idx) => (
                <ListGroupItem
                    key={idx}
                    data-id={idx}
                    className="px-3 py-2"
                    title={item.actionInsight || undefined}
                >
                    <div className="d-flex align-items-center">
                        <div className="flex-grow-1 min-w-0 me-2">
                            <h5 className="fs-13 mb-1 text-truncate">
                                <Link to="#" className="link name text-body">
                                    {item.itemName}
                                </Link>
                            </h5>

                            <p className="text-muted mb-0 fs-12 text-truncate">
                                <span>Code: {item.itemCode}</span>
                                {item.branchName && (
                                    <span> • <span className="fw-medium text-dark">{item.branchName}</span></span>
                                )}
                                <span> • {item.unitsSold} sold (30d)</span>
                                {item.currentStock !== undefined && (
                                    <span> • Stock: {item.currentStock.toLocaleString()}</span>
                                )}
                                {item.tiedUpCapital !== undefined && item.tiedUpCapital > 0 && (
                                    <span> • KES {item.tiedUpCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                )}
                                {item.daysSince !== null && (
                                    <span> • {item.daysSince}d inactive</span>
                                )}
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            <span
                                className={`badge rounded-pill border border-${item.badgeClass} text-${item.badgeClass} fs-11 fw-normal px-2 py-1`}
                            >
                                {item.statusLabel}
                            </span>
                        </div>
                    </div>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default SlowMovingStock;