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
    { id: 4, label: "Out of Stock Items", subtitle: "Zero units today", icon: "ri-error-warning-line text-danger", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 5, label: "Near Expiry (\u2264 90 days)", subtitle: "Products at risk", icon: "ri-time-line text-danger", decimals: 0, prefix: "", suffix: "", separator: "," },
    { id: 6, label: "Slow Movers (30d)", subtitle: "Below velocity threshold", icon: "ri-hourglass-line text-warning", decimals: 0, prefix: "", suffix: "", separator: "," },
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

export const computeKPIs = (stockRows = [], movementsRows = [], batchExpiryRows = []) => {
    if (!stockRows.length) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };

    const items = latestRowPerItem(stockRows);
    const today = new Date();
    const in90d = new Date(today.getTime() + NINETY_DAYS_MS);

    // Total SKUs
    const totalSKUs = items.length;

    // Total Stock Value (millions)
    const totalStockValueM = items.reduce((sum, r) => sum + (Number(r.closing_value) || 0), 0) / 1_000_000;

    // Below Reorder Level
    const belowReorder = items.filter(r => Number(r.reorder_level) > 0 && Number(r.closing_qty) < Number(r.reorder_level)).length;

    // Out of Stock
    const outOfStock = items.filter(r => Number(r.closing_qty) <= 0).length;

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

    // Slow Movers
    const slowMovers = (() => {
        const slowItems = new Set();

        movementsRows.forEach((row) => {
            if (!row.receive_date || !row.movement_date) return;

            const receiveDate = new Date(row.receive_date);
            const movementDate = new Date(row.movement_date);

            const daysToMove =
                (movementDate - receiveDate) / (1000 * 60 * 60 * 24);

            if (daysToMove > 30) {
                slowItems.add(row.item_Code || row.item_code);
            }
        });

        return slowItems.size;
    })();

    // Overstocked
    const overstocked = items.filter(r => Number(r.reorder_level) > 0 && Number(r.closing_qty) > OVERSTOCK_MULTIPLIER * Number(r.reorder_level)).length;

    // Branch Imbalances (> 20% deviation from per-item network average)
    const byItem = new Map();
    for (const row of stockRows) {
        if (!byItem.has(row.item_code)) byItem.set(row.item_code, []);
        byItem.get(row.item_code).push(Number(row.closing_qty) || 0);
    }
    let branchImbalances = 0;
    for (const qtys of byItem.values()) {
        if (qtys.length < 2) continue;
        const avg = qtys.reduce((a, b) => a + b, 0) / qtys.length;
        if (avg > 0 && qtys.some(q => Math.abs(q - avg) / avg > 0.2)) branchImbalances++;
    }

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