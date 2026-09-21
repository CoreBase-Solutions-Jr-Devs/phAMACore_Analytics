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
    { id: 2, label: "Total Stock Value", subtitle: "KES - all branches", icon: "ri-money-dollar-circle-line text-success", decimals: 2, prefix: "KES ", suffix: "m", separator: "," },
    { id: 3, label: "Items below Reorder Level", subtitle: "Need action now", icon: "ri-arrow-down-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 4, label: "Out of Stock Items", subtitle: "Units out of stock", icon: "ri-error-warning-line text-danger", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 5, label: "Near Expiry (\u2264 90 days)", subtitle: "Products at risk", icon: "ri-time-line text-danger", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 6, label: "Slow Movers (30d)", subtitle: "Low velocity & dead stock", icon: "ri-hourglass-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 7, label: "Overstocked Items", subtitle: ">120 days cover", icon: "ri-stack-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 8, label: "Branch Imbalances (> 20%)", subtitle: "Transfer candidates", icon: "ri-git-branch-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
];

// KPI COMPUTATION HELPERS

const OVERSTOCK_MULTIPLIER = 2;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const parseExpiry = (val) => {
    if (!val || typeof val !== "string" || !val.trim()) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
};

// One row per item_code — whichever has the latest snapshot_date
const latestRowPerItem = (rows) => {
    const map = new Map();
    for (const row of rows) {
        const existing = map.get(row.item_code);
        if (!existing || new Date(row.snapshot_date) > new Date(existing.snapshot_date))
            map.set(row.item_code, row);
    }
    return Array.from(map.values());
};

export const computeKPIs = (stockRows = [], movementsRows = [], batchExpiryRows = [], stockValueByBranch = [], stockHealth = [], slowMovingStock = [], imbalanceAlerts = []) => {
    if (!stockRows.length && !stockValueByBranch.length && !stockHealth.length && !slowMovingStock.length && !imbalanceAlerts.length) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };

    const items = latestRowPerItem(stockRows);
    const today = new Date();
    const in90d = new Date(today.getTime() + NINETY_DAYS_MS);

    const healthObj = Array.isArray(stockHealth) && stockHealth.length > 0 ? stockHealth[0] : null;

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
        : items.filter(r => Number(r.reorder_level) > 0 && Number(r.closing_qty) < Number(r.reorder_level)).length;

    // Out of Stock
    const outOfStock = healthObj?.out_of_stock_skus !== undefined && healthObj?.out_of_stock_skus !== null
        ? healthObj.out_of_stock_skus
        : items.filter(r => Number(r.closing_qty) <= 0).length;

    // Near Expiry
    const nearExpiry = batchExpiryRows.reduce((count, item) => {
        if (!item.expirydate) return count;

        const expiryDate = new Date(item.expirydate);
        const daysToExpiry = Math.ceil(
            (expiryDate - today) / (1000 * 60 * 60 * 24)
        );

        if (daysToExpiry >= 0 && daysToExpiry <= 90) {
            return count + 1;
        }

        return count;
    }, 0);

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

    // Overstocked
    const overstocked = healthObj?.overstocked_skus !== undefined && healthObj?.overstocked_skus !== null
        ? healthObj.overstocked_skus
        : items.filter(r => Number(r.reorder_level) > 0 && Number(r.closing_qty) > OVERSTOCK_MULTIPLIER * Number(r.reorder_level)).length;

    // Branch Imbalances (> 20% deviation or replenishment / transfer candidates)
    const branchImbalances = (() => {
        if (healthObj && (healthObj.branch_imbalance_skus !== undefined || healthObj.imbalance_skus !== undefined)) {
            return Number(healthObj.branch_imbalance_skus ?? healthObj.imbalance_skus ?? 0);
        }
        if (Array.isArray(imbalanceAlerts) && imbalanceAlerts.length > 0) {
            return imbalanceAlerts.length;
        }

        // Deduplicate latest snapshot per item per branch
        const itemBranchMap = new Map();
        for (const row of stockRows) {
            const itemCode = row.item_code || row.item_Code || row.invCode || row.itemcode;
            const branch = row.branch_Name || row.branch_name || row.branchName || row.branch_id;
            if (!itemCode || !branch) continue;

            const qty = Number(row.closing_qty ?? row.closing_Stock ?? row.closingStock ?? row.stockInNo ?? row.qtyBal ?? 0);
            const reorderLevel = Number(row.reorder_level ?? row.effective_min_qty ?? 0);
            const date = row.snapshot_date ? new Date(row.snapshot_date) : null;
            const key = `${itemCode}__${branch}`;
            const existing = itemBranchMap.get(key);

            if (!existing || (date && existing.date && date > existing.date) || (!existing.date && date)) {
                itemBranchMap.set(key, { itemCode, branch, qty, reorderLevel, date });
            }
        }

        // Group by item
        const byItem = new Map();
        for (const entry of itemBranchMap.values()) {
            if (!byItem.has(entry.itemCode)) byItem.set(entry.itemCode, []);
            byItem.get(entry.itemCode).push(entry);
        }

        let count = 0;
        for (const branches of byItem.values()) {
            const qtys = branches.map((b) => b.qty);
            const totalStock = qtys.reduce((a, b) => a + b, 0);
            if (totalStock <= 0) continue; // Completely out of stock network-wide

            if (branches.length >= 2) {
                const max = Math.max(...qtys);
                const min = Math.min(...qtys);
                const avg = totalStock / branches.length;
                const allLow = branches.every((b) =>
                    b.reorderLevel > 0 ? b.qty <= b.reorderLevel : b.qty <= 5
                );

                if (allLow) {
                    count++;
                } else if (max > min && (min === 0 || (avg > 0 && (max - min) / max > 0.2))) {
                    count++;
                }
            } else if (branches.length === 1) {
                const single = branches[0];
                if ((single.reorderLevel > 0 && single.qty <= single.reorderLevel) || single.qty <= 5) {
                    count++;
                }
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