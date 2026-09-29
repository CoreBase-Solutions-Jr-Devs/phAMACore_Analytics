// DATE HELPERS

const formatToApiDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

export const getTodayApi = () => formatToApiDate(new Date());

export const getNDaysAgoApi = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return formatToApiDate(d);
};

// KPI CARD METADATA

export const KPI_META = [
    { id: 1, label: "Total SKUs", subtitle: "Across all branches", icon: "ri-medicine-bottle-line text-primary", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 2, label: "Total Stock Value", subtitle: "KES - all branches", icon: "ri-coins-line text-success", decimals: 2, prefix: "KES ", suffix: "m", separator: "," },
    { id: 3, label: "Items below Reorder Level", subtitle: "Need action now", icon: "ri-arrow-down-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 4, label: "Out of Stock Items", subtitle: "SKUs out of stock", icon: "ri-error-warning-line text-danger", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 5, label: "Near Expiry (\u2264 90 days)", subtitle: "Products at risk", icon: "ri-time-line text-danger", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 6, label: "Slow Movers (30d)", subtitle: "Low velocity & dead stock", icon: "ri-hourglass-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 7, label: "Overstocked Items", subtitle: "> Target max cover", icon: "ri-stack-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 8, label: "Branch Imbalances (> 20%)", subtitle: "Transfer candidates", icon: "ri-git-branch-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
];

/**
 * Returns dynamic KPI metadata tailored to current branch filter context
 */
export const getKPIMeta = ({ branchName = "All Branches", isBranchView = false, healthObj = null } = {}) => {
    return KPI_META.map((widget) => {
        if (widget.id === 1) {
            const stockedCount = healthObj?.stocked_skus;
            const branchSub = stockedCount !== undefined && stockedCount !== null
                ? `Branch: ${branchName} (${stockedCount} stocked)`
                : `Branch: ${branchName}`;
            return {
                ...widget,
                subtitle: isBranchView ? branchSub : "Across all branches",
            };
        }
        if (widget.id === 2) {
            return {
                ...widget,
                subtitle: isBranchView ? `KES - ${branchName}` : "KES - all branches",
            };
        }
        return widget;
    });
};

// KPI COMPUTATION HELPERS

const OVERSTOCK_MULTIPLIER = 2;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const parseExpiry = (val) => {
    if (!val || typeof val !== "string" || !val.trim()) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
};

// Deduplicate rows per item per branch to get the latest snapshot date
const latestRowPerItemBranch = (rows = []) => {
    const map = new Map();
    for (const row of rows) {
        const itemCode = row.item_code || row.item_Code || row.invCode || row.itemcode;
        const branch = row.branch_id || row.branch_Name || row.branch_name || row.branchName || "1";
        if (!itemCode) continue;

        const key = `${itemCode}__${branch}`;
        const existing = map.get(key);
        const rowDate = row.snapshot_date ? new Date(row.snapshot_date) : null;
        const existDate = existing?.snapshot_date ? new Date(existing.snapshot_date) : null;

        if (!existing || (rowDate && existDate && rowDate > existDate) || (!existDate && rowDate)) {
            map.set(key, row);
        }
    }
    return Array.from(map.values());
};

// Aggregate items across all branches from deduplicated branch-level rows
const aggregateItemsAcrossBranches = (branchRows = []) => {
    const itemMap = new Map();
    for (const row of branchRows) {
        const itemCode = row.item_code || row.item_Code || row.invCode || row.itemcode;
        if (!itemCode) continue;

        const closingQty = Number(row.closing_qty ?? row.closing_Stock ?? row.closingStock ?? row.stockInNo ?? row.qtyBal ?? 0);
        const unitCost = Number(row.unit_avg_cost ?? row.avgCost ?? 0);
        const closingValue = Number(
            row.closing_value ?? row.costValue ?? (closingQty > 0 && unitCost > 0 ? closingQty * unitCost : 0)
        );
        const reorderLevel = Number(row.reorder_level ?? row.effective_min_qty ?? 0);

        const existing = itemMap.get(itemCode);
        if (!existing) {
            itemMap.set(itemCode, {
                item_code: itemCode,
                item_name: row.item_name || row.invName || itemCode,
                closing_qty: closingQty,
                closing_value: closingValue,
                reorder_level: reorderLevel,
            });
        } else {
            existing.closing_qty += closingQty;
            existing.closing_value += closingValue;
            existing.reorder_level += reorderLevel;
        }
    }
    return Array.from(itemMap.values());
};

export const computeKPIs = (
    stockRows = [],
    movementsRows = [],
    batchExpiryRows = [],
    stockValueByBranch = [],
    stockHealth = [],
    slowMovingStock = [],
    imbalanceAlerts = []
) => {
    if (!stockRows.length && !stockValueByBranch.length && !stockHealth.length && !slowMovingStock.length && !imbalanceAlerts.length) {
        return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    }

    const branchRows = latestRowPerItemBranch(stockRows);
    const items = aggregateItemsAcrossBranches(branchRows);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msPerDay = 1000 * 60 * 60 * 24;

    const healthObj = Array.isArray(stockHealth) && stockHealth.length > 0
        ? stockHealth[0]
        : (stockHealth && typeof stockHealth === "object" && !Array.isArray(stockHealth) ? stockHealth : null);

    // Total SKUs
    const totalSKUs = healthObj?.total_catalog_skus ?? items.length;

    // Total Stock Value (millions)
    let totalStockValueM = 0;
    if (stockValueByBranch && stockValueByBranch.length > 0) {
        totalStockValueM = stockValueByBranch.reduce((sum, item) => sum + (Number(item.total_stock_value) || 0), 0) / 1_000_000;
    } else if (healthObj?.total_stock_value !== undefined && healthObj?.total_stock_value !== null) {
        totalStockValueM = Number(healthObj.total_stock_value || 0) / 1_000_000;
    } else {
        totalStockValueM = items.reduce((sum, r) => sum + (Number(r.closing_value) || 0), 0) / 1_000_000;
    }

    // Below Reorder Level
    const belowReorder = healthObj?.min_breached_skus !== undefined && healthObj?.min_breached_skus !== null
        ? healthObj.min_breached_skus
        : items.filter(r => Number(r.reorder_level) > 0 && Number(r.closing_qty) <= Number(r.reorder_level)).length;

    // Out of Stock Items
    const outOfStock = healthObj?.out_of_stock_skus !== undefined && healthObj?.out_of_stock_skus !== null
        ? healthObj.out_of_stock_skus
        : items.filter(r => Number(r.closing_qty) <= 0).length;

    // Near Expiry (<= 90 days) - distinct active products at risk
    const nearExpiryProducts = new Set();
    if (Array.isArray(batchExpiryRows) && batchExpiryRows.length > 0) {
        batchExpiryRows.forEach((item) => {
            const qty = Number(item.qtyBal ?? item.closing_qty ?? 0);
            if (qty <= 0) return;
            if (!item.expirydate) return;

            const expiryDate = new Date(item.expirydate);
            if (isNaN(expiryDate.getTime())) return;
            expiryDate.setHours(0, 0, 0, 0);

            const daysToExpiry = Math.ceil((expiryDate - today) / msPerDay);
            if (daysToExpiry >= 0 && daysToExpiry <= 90) {
                const code = item.invCode || item.item_code || item.item_Code || item.invName;
                if (code) {
                    nearExpiryProducts.add(code);
                }
            }
        });
    }
    const nearExpiry = nearExpiryProducts.size;

    // Slow Movers (Combines slow moving and dead stock SKUs)
    const slowMovers = (() => {
        if (healthObj && (healthObj.slow_mover_skus !== undefined || healthObj.dead_stock_skus !== undefined)) {
            const slow = Number(healthObj.slow_mover_skus || 0);
            const dead = Number(healthObj.dead_stock_skus || 0);
            return slow + dead;
        }
        if (Array.isArray(slowMovingStock) && slowMovingStock.length > 0) {
            return slowMovingStock.length;
        }
        return 0;
    })();

    // Overstocked Items
    const overstocked = healthObj?.overstocked_skus !== undefined && healthObj?.overstocked_skus !== null
        ? healthObj.overstocked_skus
        : items.filter(r => Number(r.reorder_level) > 0 && Number(r.closing_qty) > OVERSTOCK_MULTIPLIER * Number(r.reorder_level)).length;

    // Branch Imbalances (> 20% deviation - inter-branch transfer candidates)
    const branchImbalances = (() => {
        if (healthObj && (healthObj.branch_imbalance_skus !== undefined || healthObj.imbalance_skus !== undefined)) {
            return Number(healthObj.branch_imbalance_skus ?? healthObj.imbalance_skus ?? 0);
        }
        if (Array.isArray(imbalanceAlerts) && imbalanceAlerts.length > 0) {
            return imbalanceAlerts.filter(a => a.type === "inter_branch").length;
        }

        // Fallback calculation directly from branch-level records
        const byItem = new Map();
        for (const entry of branchRows) {
            const itemCode = entry.item_code || entry.item_Code || entry.invCode || entry.itemcode;
            if (!itemCode) continue;
            if (!byItem.has(itemCode)) byItem.set(itemCode, []);
            byItem.get(itemCode).push({
                branch: entry.branch_id || entry.branch_Name || entry.branch_name || entry.branchName,
                qty: Number(entry.closing_qty ?? entry.closing_Stock ?? entry.qtyBal ?? 0),
                reorderLevel: Number(entry.reorder_level ?? entry.effective_min_qty ?? 0),
            });
        }

        let count = 0;
        for (const branches of byItem.values()) {
            if (branches.length < 2) continue; // Requires at least two branches for an imbalance

            const qtys = branches.map((b) => b.qty);
            const totalStock = qtys.reduce((a, b) => a + b, 0);
            if (totalStock <= 0) continue; // Completely out of stock network-wide

            const max = Math.max(...qtys);
            const min = Math.min(...qtys);
            const avg = totalStock / branches.length;

            if (max > min && (min === 0 || (avg > 0 && (max - min) / max > 0.2))) {
                count++;
            }
        }

        return count;
    })();

    return { 
        1: totalSKUs, 
        2: totalStockValueM, 
        3: belowReorder, 
        4: outOfStock, 
        5: nearExpiry, 
        6: slowMovers, 
        7: overstocked, 
        8: branchImbalances 
    };
};