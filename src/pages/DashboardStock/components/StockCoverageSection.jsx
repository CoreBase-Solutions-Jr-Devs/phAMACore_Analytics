import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "reactstrap";
import { useSelector } from "react-redux";
import FloatingTooltip from "../../../Components/Common/FloatingTooltip";
import TablePagination from "../../../Components/Common/TablePagination";
import {
    normalizeItemMovementRows,
    transformStockVsMovement,
} from "../Charts/Custom/util/chartTransforms";
import { getLookbackDays } from "../../utils/StockInventoryUtils";

const MAX_ROWS = 50;

export const STOCK_COVERAGE_VIEW_MODES = [
    { key: "CHART", label: "Coverage Chart" },
    { key: "STOCK_VS_MOVEMENT", label: "Branch Summary" },
    { key: "ITEM_MOVEMENT", label: "Item Movement" },
];

export const ITEM_MOVEMENT_STATUS_FILTERS = [
    { key: "ALL", label: "All Items" },
    { key: "ACTIVE", label: "Active / Moving" },
    { key: "OVERSTOCKED", label: "Overstocked" },
    { key: "SLOW_MOVER", label: "Slow Movers" },
    { key: "DEAD_STOCK", label: "Dead Stock" },
];

const getHealthBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s.includes("DEAD")) return { tone: "danger", label: "DEAD STOCK", color: "#f06548" };
    if (s.includes("UNDERSTOCK")) return { tone: "danger", label: "UNDERSTOCKED", color: "#f06548" };
    if (s.includes("OVERSTOCK")) return { tone: "warning", label: "OVERSTOCKED", color: "#f7b84b" };
    if (s.includes("SLOW")) return { tone: "warning", label: "SLOW MOVER", color: "#f7b84b" };
    return { tone: "success", label: s || "HEALTHY", color: "#0ab39c" };
};

const formatCoverDays = (days) => {
    const n = Number(days || 0);
    if (n >= 999) return "999+ days";
    if (n <= 0) return "0 days";
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })} days`;
};

const StockCoverageSection = ({
    viewMode = "STOCK_VS_MOVEMENT",
    searchTerm = "",
    branchFilter = "",
    statusFilter = "ALL",
    onSelectBranch,
}) => {
    const [hoverInfo, setHoverInfo] = useState(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [branchSortField, setBranchSortField] = useState("rawStock");
    const [branchSortDesc, setBranchSortDesc] = useState(true);
    const [itemSortField, setItemSortField] = useState("stockAtCost");
    const [itemSortDesc, setItemSortDesc] = useState(true);

    const {
        stockVsMovement = [],
        itemMovement = [],
        loadingStockVsMovement = false,
        loadingItemMovement = false,
        errorStockVsMovement = null,
        errorItemMovement = null,
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;
    const lookbackDays = getLookbackDays(activeFilters.startDate, activeFilters.endDate);

    const branchRows = useMemo(() => {
        const transformed = transformStockVsMovement(stockVsMovement);
        const list = (transformed.categories || []).map((name, idx) => ({
            id: `branch-${transformed.branchIds?.[idx] ?? idx}-${idx}`,
            branchId: transformed.branchIds?.[idx],
            branchName: name,
            totalCatalogSkus: transformed.totalCatalogSkus?.[idx] ?? 0,
            stockedSkus: transformed.stockedSkus?.[idx] ?? 0,
            totalStockPieces: transformed.totalStockPieces?.[idx] ?? 0,
            rawStock: transformed.rawStock?.[idx] ?? 0,
            monthlyConsumedPieces: transformed.monthlyConsumedPieces?.[idx] ?? 0,
            monthlyConsumption: transformed.monthlyConsumption?.[idx] ?? 0,
            rawDailySales: transformed.rawDailySales?.[idx] ?? 0,
            monthlyNetSales: transformed.monthlyNetSales?.[idx] ?? 0,
            stockCoverMonths: transformed.stockCoverMonths?.[idx] ?? 0,
            daysCover: transformed.daysCover?.[idx] ?? 0,
            deadStockValue: transformed.deadStockValue?.[idx] ?? 0,
            excessStockValue: transformed.excessStockValue?.[idx] ?? 0,
            stockHealthStatus: transformed.stockHealthStatus?.[idx] ?? "HEALTHY",
            actionInsight: transformed.actionInsights?.[idx] ?? "",
        }));

        const term = (searchTerm || "").trim().toLowerCase();
        const filtered = term
            ? list.filter((r) =>
                  [r.branchName, r.stockHealthStatus, r.actionInsight].some((f) =>
                      String(f || "").toLowerCase().includes(term)
                  )
              )
            : list;

        return [...filtered].sort((a, b) => {
            if (branchSortField === "branchName") {
                return branchSortDesc
                    ? b.branchName.localeCompare(a.branchName)
                    : a.branchName.localeCompare(b.branchName);
            }
            const av = a[branchSortField] ?? 0;
            const bv = b[branchSortField] ?? 0;
            return branchSortDesc ? bv - av : av - bv;
        });
    }, [stockVsMovement, searchTerm, branchSortField, branchSortDesc]);

    const itemRows = useMemo(() => {
        const normalized = normalizeItemMovementRows(itemMovement);

        const byBranch =
            branchFilter && branchFilter !== "ALL"
                ? normalized.filter((r) => r.branchName.toLowerCase() === branchFilter.toLowerCase())
                : normalized;

        const byStatus =
            statusFilter === "ALL"
                ? byBranch
                : byBranch.filter((r) => {
                      if (statusFilter === "ACTIVE") {
                          return r.monthlyCostOfSales > 0 || r.monthlyConsumptionQty > 0;
                      }
                      return (
                          r.movementCategory.includes(statusFilter) ||
                          r.stockHealthStatus.includes(statusFilter)
                      );
                  });

        const term = (searchTerm || "").trim().toLowerCase();
        const searched = term
            ? byStatus.filter((r) =>
                  [
                      r.itemName,
                      r.itemCode,
                      r.branchName,
                      r.itemGroup,
                      r.itemSubgroup,
                      r.movementCategory,
                      r.stockHealthStatus,
                  ].some((f) => String(f || "").toLowerCase().includes(term))
              )
            : byStatus;

        return [...searched].sort((a, b) => {
            if (itemSortField === "itemName" || itemSortField === "branchName") {
                return itemSortDesc
                    ? String(b[itemSortField] || "").localeCompare(String(a[itemSortField] || ""))
                    : String(a[itemSortField] || "").localeCompare(String(b[itemSortField] || ""));
            }
            const av = a[itemSortField] ?? 0;
            const bv = b[itemSortField] ?? 0;
            return itemSortDesc ? bv - av : av - bv;
        });
    }, [itemMovement, branchFilter, statusFilter, searchTerm, itemSortField, itemSortDesc]);

    useEffect(() => {
        setPageIndex(0);
    }, [viewMode, searchTerm, branchFilter, statusFilter, branchSortField, branchSortDesc, itemSortField, itemSortDesc]);

    const handleBranchSort = (field) => {
        if (branchSortField === field) {
            setBranchSortDesc((prev) => !prev);
        } else {
            setBranchSortField(field);
            setBranchSortDesc(field !== "branchName");
        }
    };

    const handleItemSort = (field) => {
        if (itemSortField === field) {
            setItemSortDesc((prev) => !prev);
        } else {
            setItemSortField(field);
            setItemSortDesc(field !== "itemName" && field !== "branchName");
        }
    };

    const activeRows = viewMode === "ITEM_MOVEMENT" ? itemRows : branchRows;
    const pageCount = Math.max(Math.ceil(activeRows.length / MAX_ROWS), 1);
    const safePageIndex = Math.min(pageIndex, pageCount - 1);
    const pageRows = useMemo(
        () => activeRows.slice(safePageIndex * MAX_ROWS, (safePageIndex + 1) * MAX_ROWS),
        [activeRows, safePageIndex]
    );

    const renderBranchSortHeader = (field, label, className = "") => (
        <th
            scope="col"
            className={className}
            role="button"
            onClick={() => handleBranchSort(field)}
            style={{ cursor: "pointer", userSelect: "none" }}
        >
            {label}
            {branchSortField === field && (
                <i className={`ms-1 text-primary ${branchSortDesc ? "ri-arrow-down-line" : "ri-arrow-up-line"}`}></i>
            )}
        </th>
    );

    const renderItemSortHeader = (field, label, className = "") => (
        <th
            scope="col"
            className={className}
            role="button"
            onClick={() => handleItemSort(field)}
            style={{ cursor: "pointer", userSelect: "none" }}
        >
            {label}
            {itemSortField === field && (
                <i className={`ms-1 text-primary ${itemSortDesc ? "ri-arrow-down-line" : "ri-arrow-up-line"}`}></i>
            )}
        </th>
    );

    const isLoading = viewMode === "ITEM_MOVEMENT" ? loadingItemMovement : loadingStockVsMovement;
    const errorMsg = viewMode === "ITEM_MOVEMENT" ? errorItemMovement : errorStockVsMovement;

    if (isLoading && !activeRows.length) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center" style={{ minHeight: "260px" }}>
                <Spinner size="sm" color="primary" className="mb-2" />
                <small className="text-muted">
                    {viewMode === "ITEM_MOVEMENT"
                        ? "Loading SKU-level stock vs movement breakdown..."
                        : "Loading branch stock vs cost of sales coverage..."}
                </small>
            </div>
        );
    }

    if (errorMsg && !activeRows.length) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-danger" style={{ minHeight: "260px" }}>
                <i className="ri-error-warning-line display-6 mb-2"></i>
                <small>{String(errorMsg)}</small>
            </div>
        );
    }

    if (!activeRows.length) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted" style={{ minHeight: "260px" }}>
                <i className="ri-inbox-line display-6 mb-2"></i>
                <div className="fw-medium">No records found for this filter</div>
                <small className="text-muted">Try adjusting the search query, status filter, or date range.</small>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <div
                tabIndex={0}
                role="region"
                aria-label="Stock vs Cost of Sales coverage table"
                className="table-responsive"
                style={{ maxHeight: "365px", overflowY: "auto" }}
                onMouseLeave={() => setHoverInfo(null)}
            >
                {viewMode === "STOCK_VS_MOVEMENT" ? (
                    <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                        <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                            <tr>
                                {renderBranchSortHeader("branchName", "Branch")}
                                {renderBranchSortHeader("stockedSkus", "Stocked SKUs", "text-end")}
                                {renderBranchSortHeader("rawStock", "Stock at Cost (KES)", "text-end")}
                                {renderBranchSortHeader("monthlyConsumption", "30d Cost of Sales", "text-end")}
                                {renderBranchSortHeader("rawDailySales", "Daily COGS", "text-end")}
                                {renderBranchSortHeader("daysCover", "Stock Cover", "text-end")}
                                <th scope="col" className="text-center">Health</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((row) => {
                                const badge = getHealthBadge(row.stockHealthStatus);
                                return (
                                    <tr key={row.id}>
                                        <th
                                            scope="row"
                                            className="fw-medium"
                                            style={{ cursor: onSelectBranch ? "pointer" : "default" }}
                                            onClick={() => onSelectBranch && onSelectBranch(row.branchName)}
                                            onMouseEnter={(e) =>
                                                setHoverInfo({
                                                    title: row.branchName,
                                                    badgeColor: badge.color,
                                                    mainValue: `Stock at Cost: KES ${row.rawStock.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}`,
                                                    mainColor: "#00e396",
                                                    subText: `30d COGS: KES ${row.monthlyConsumption.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })} · Net Sales: KES ${row.monthlyNetSales.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}`,
                                                    extraText:
                                                        row.actionInsight ||
                                                        (onSelectBranch ? "Click branch to inspect SKU movement" : undefined),
                                                    x: e.clientX,
                                                    y: e.clientY,
                                                })
                                            }
                                            onMouseMove={(e) =>
                                                setHoverInfo((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
                                            }
                                        >
                                            <span className={onSelectBranch ? "text-primary" : ""}>{row.branchName}</span>
                                            <small className="text-muted d-block fw-normal">
                                                {row.totalStockPieces.toLocaleString()} pcs · {row.monthlyConsumedPieces.toLocaleString()} consumed ({lookbackDays}d)
                                            </small>
                                        </th>
                                        <td className="text-end">
                                            <span className="fw-semibold">{row.stockedSkus}</span>
                                            <small className="text-muted"> / {row.totalCatalogSkus}</small>
                                        </td>
                                        <td className="text-end fw-semibold">
                                            {row.rawStock.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="text-end text-success fw-medium">
                                            {row.monthlyConsumption.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="text-end text-muted">
                                            {row.rawDailySales.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="text-end">
                                            <span className="fw-semibold">{formatCoverDays(row.daysCover)}</span>
                                            {row.stockCoverMonths > 0 && row.stockCoverMonths < 999 && (
                                                <small className="text-muted d-block">
                                                    {row.stockCoverMonths.toFixed(2)} mo
                                                </small>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <span
                                                className={`badge rounded-pill border border-${badge.tone} text-${badge.tone} bg-${badge.tone}-subtle fs-11 fw-normal px-2 py-1`}
                                            >
                                                {badge.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <table className="table table-borderless table-centered table-nowrap mb-0 w-100">
                        <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                            <tr>
                                {renderItemSortHeader("itemName", "Product / SKU")}
                                {renderItemSortHeader("branchName", "Branch")}
                                {renderItemSortHeader("currentStockQty", "Stock (W/P)", "text-end")}
                                {renderItemSortHeader("stockAtCost", "Stock at Cost", "text-end")}
                                {renderItemSortHeader("monthlyConsumptionQty", "30d Consumed", "text-end")}
                                {renderItemSortHeader("monthlyCostOfSales", "30d COGS", "text-end")}
                                {renderItemSortHeader("stockCoverDays", "Cover", "text-end")}
                                <th scope="col" className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((item) => {
                                const badge = getHealthBadge(item.stockHealthStatus || item.movementCategory);
                                return (
                                    <tr key={item.id}>
                                        <th
                                            scope="row"
                                            className="fw-medium"
                                            onMouseEnter={(e) =>
                                                setHoverInfo({
                                                    title: item.itemName,
                                                    badgeColor: badge.color,
                                                    mainValue: `SKU: ${item.itemCode} · Pack of ${item.packQty} (KES ${item.packCost.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}/pack)`,
                                                    mainColor: "#299cdb",
                                                    subText: `Stock: ${item.currentStockQty.toLocaleString()} pcs (${item.stockWholesPieces}) · 30d Consumed: ${item.monthlyConsumptionQty.toLocaleString()} pcs (${item.consumptionWholesPieces})`,
                                                    extraText: item.actionInsight || undefined,
                                                    x: e.clientX,
                                                    y: e.clientY,
                                                })
                                            }
                                            onMouseMove={(e) =>
                                                setHoverInfo((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
                                            }
                                        >
                                            {item.itemName}
                                            <small className="text-muted d-block fw-normal">
                                                {item.itemCode} · Pack of {item.packQty}
                                                {item.itemGroup && item.itemGroup !== "Unassigned" ? ` · ${item.itemGroup}` : ""}
                                            </small>
                                        </th>
                                        <td>{item.branchName}</td>
                                        <td className="text-end">
                                            <span className="fw-semibold">{item.stockWholesPieces}</span>
                                            <small className="text-muted d-block">
                                                {item.currentStockQty.toLocaleString()} pcs
                                            </small>
                                        </td>
                                        <td className="text-end fw-semibold">
                                            KES {item.stockAtCost.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="text-end">
                                            <span className="fw-medium">{item.consumptionWholesPieces}</span>
                                            <small className="text-muted d-block">
                                                {item.monthlyConsumptionQty.toLocaleString()} pcs
                                            </small>
                                        </td>
                                        <td className="text-end text-success fw-medium">
                                            KES {item.monthlyCostOfSales.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="text-end">
                                            <span className="fw-semibold">{formatCoverDays(item.stockCoverDays)}</span>
                                            {item.stockCoverMonths > 0 && item.stockCoverMonths < 999 && (
                                                <small className="text-muted d-block">
                                                    {item.stockCoverMonths.toFixed(2)} mo
                                                </small>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <span
                                                className={`badge rounded-pill border border-${badge.tone} text-${badge.tone} bg-${badge.tone}-subtle fs-11 fw-normal px-2 py-1`}
                                            >
                                                {badge.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <FloatingTooltip hoverInfo={hoverInfo} />

            <TablePagination
                pageIndex={safePageIndex}
                pageCount={pageCount}
                totalResults={activeRows.length}
                pageSize={MAX_ROWS}
                onPageChange={setPageIndex}
            />
        </div>
    );
};

export default StockCoverageSection;
