/**
 * chartTransforms.js
 * Pure transform functions for DashboardCRM bar charts.
 * All three charts derive from Daily Closing Stock (DCS) data only.
 *
 * DCS row shape (relevant fields):
 * {
 *   item_code, item_Name, branch_id, branch_Name,
 *   closing_qty, closing_value, qty_sold,
 *   reorder_level, expiry_date
 * }
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute the number of calendar days between two date strings.
 * Accepts "DD/MM/YYYY" or "MM/DD/YYYY" — use the same format you pass to the API.
 * @param {string} startDate  e.g. "01/01/2026"
 * @param {string} endDate    e.g. "01/06/2026"
 * @returns {number} days in period (minimum 1 to avoid division by zero)
 */
export function getPeriodDays(startDate, endDate) {
    // Parse as DD/MM/YYYY (matches your API params)
    const parse = (str) => {
        const [d, m, y] = str.split('/');
        return new Date(`${y}-${m}-${d}`);
    };
    const diff = parse(endDate) - parse(startDate);
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return Math.max(days, 1);
}

/**
 * Determine bar color based on days-of-cover value.
 * Red  = stockout risk (≤ 6 days)
 * Amber = warning     (7–14 days)
 * Green = safe        (> 14 days)
 */
export function getDaysCoverColor(days) {
    if (days <= 6) return '#f06548';   // --vz-danger
    if (days <= 14) return '#f7b84b';  // --vz-warning
    return '#0ab39c';                   // --vz-success
}

/**
 * Determine bar color for branch coverage ratio.
 * Red  = critical replenishment needed (< 10 days)
 * Amber = warning                      (10–20 days)
 * Green = target zone                  (21–30 days)
 * Blue  = overstocked risk             (> 30 days)
 */
export function getCoverageRatioColor(days) {
    if (days < 10) return '#f06548';   // --vz-danger
    if (days < 21) return '#f7b84b';   // --vz-warning
    if (days <= 30) return '#0ab39c';  // --vz-success
    return '#405189';                   // --vz-primary (overstocked)
}

// ─── BarChartOne — Critical Stock Levels ─────────────────────────────────────

/**
 * Produces chart-ready data for the Critical Stock Levels bar chart.
 * Uses a fixed list of must-not-stockout item codes; filters DCS data to those items.
 *
 * @param {Array}  stockRows   Full DCS API response array
 * @param {number} periodDays  Days in the query period (from getPeriodDays)
 * @param {string[]} watchedCodes  Item codes to display (MUST-NOT-STOCKOUT list)
 * @returns {{ categories: string[], data: number[], colors: string[], reorderLine: number }}
 */
export function transformCriticalStockLevels(stockRows, periodDays, watchedCodes) {
    if (!stockRows?.length) return { categories: [], data: [], colors: [], reorderLine: 6 };

    // Aggregate across branches for the watched items
    const aggregated = {};
    stockRows.forEach((row) => {
        const code = row.item_code || row.item_Code;
        if (!watchedCodes.includes(code)) return;

        if (!aggregated[code]) {
            aggregated[code] = {
                name: row.item_Name,
                closing_qty: 0,
                qty_sold: 0,
            };
        }
        aggregated[code].closing_qty += row.closing_qty || 0;
        aggregated[code].qty_sold    += row.qty_sold    || 0;
    });

    // Compute days of cover per item
    const items = Object.values(aggregated).map((item) => {
        const avgDailySales = item.qty_sold / periodDays;
        // Avoid division by zero — if no sales, treat as very high cover (slow mover)
        const daysCover = avgDailySales > 0
            ? Math.round(item.closing_qty / avgDailySales)
            : item.closing_qty > 0 ? 999 : 0;

        return {
            name: item.name,
            daysCover: Math.min(daysCover, 999), // cap display at 999
        };
    });

    // Sort ascending (most critical first — matches screenshot)
    items.sort((a, b) => a.daysCover - b.daysCover);

    // Cap 999 display at a sensible chart maximum
    const displayData = items.map((i) => i.daysCover === 999 ? 30 : i.daysCover);

    return {
        categories: items.map((i) => i.name),
        data: displayData,
        colors: displayData.map(getDaysCoverColor),
        reorderLine: 6, // 25% of ~24 day target = 6 days
    };
}

// ─── BarChartTwo — Stock Value By Branch ─────────────────────────────────────

/**
 * Produces chart-ready data for the Stock Value by Branch bar chart.
 * Sums closing_value per branch, converts to KES Millions.
 *
 * @param {Array} stockRows  Full DCS API response array
 * @returns {{ categories: string[], data: number[], subtitle: string }}
 */
export function transformStockValueByBranch(stockRows) {
    if (!stockRows?.length) return { categories: [], data: [], subtitle: '' };

    const branchMap = {};
    stockRows.forEach((row) => {
        const branch = row.branch_Name || `Branch ${row.branch_id}`;
        if (!branchMap[branch]) branchMap[branch] = 0;
        branchMap[branch] += row.closing_value || 0;
    });

    // Convert to KES Millions, round to 1dp
    const entries = Object.entries(branchMap)
        .map(([name, value]) => ({ name, valueMn: Math.round((value / 1_000_000) * 10) / 10 }))
        .sort((a, b) => b.valueMn - a.valueMn); // descending

    // Dynamic subtitle — flag branch with lowest value relative to network average
    const avg = entries.reduce((s, e) => s + e.valueMn, 0) / entries.length;
    const outlier = entries[entries.length - 1]; // lowest
    const subtitle = outlier.valueMn < avg * 0.3
        ? `${outlier.name} critically undercapitalised vs its sales territory size.`
        : 'Stock value distribution across branches.';

    return {
        categories: entries.map((e) => e.name),
        data: entries.map((e) => e.valueMn),
        subtitle,
    };
}

// ─── BarChartThree — Branch Coverage Ratio ───────────────────────────────────

/**
 * Produces chart-ready data for the Branch Coverage Ratio chart.
 * Uses DCS qty_sold as proxy for sales velocity (no SM needed).
 * days_cover = sum(closing_qty) / (sum(qty_sold) / periodDays)
 *
 * @param {Array}  stockRows   Full DCS API response array
 * @param {number} periodDays  Days in the query period
 * @returns {{ categories: string[], data: number[], colors: string[] }}
 */
export function transformBranchCoverageRatio(stockRows, periodDays) {
    if (!stockRows?.length) return { categories: [], data: [], colors: [] };

    const branchMap = {};
    stockRows.forEach((row) => {
        const branch = row.branch_Name || `Branch ${row.branch_id}`;
        if (!branchMap[branch]) branchMap[branch] = { closing_qty: 0, qty_sold: 0 };
        branchMap[branch].closing_qty += row.closing_qty || 0;
        branchMap[branch].qty_sold    += row.qty_sold    || 0;
    });

    const entries = Object.entries(branchMap).map(([name, vals]) => {
        const avgDailySales = vals.qty_sold / periodDays;
        const daysCover = avgDailySales > 0
            ? Math.round(vals.closing_qty / avgDailySales)
            : 0;
        return { name, daysCover };
    }).sort((a, b) => b.daysCover - a.daysCover); // descending (highest cover first)

    return {
        categories: entries.map((e) => e.name),
        data: entries.map((e) => e.daysCover),
        colors: entries.map((e) => getCoverageRatioColor(e.daysCover)),
    };
}

// ─── BarChartThree — Stock VS Sales Velocity (Combined Bar & Line) ───────────

/**
 * Produces chart-ready data for the Stock VS Sales Velocity combined chart.
 * Combines branch stock value from KPITotalStockValueByBranch and sales velocity
 * from KPISalesTransactions (GroupBy=BRANCH).
 *
 * @param {Array}  stockRows   Array of branch stock objects (from totalStockValueByBranch)
 * @param {Array}  salesRows   Array of branch sales objects (from kpiSalesTransactions)
 * @param {number} periodDays  Days in the query period (defaults to 1)
 * @returns {{ categories: string[], stock: number[], sales: number[], rawStock: number[], rawDailySales: number[], daysCover: number[] }}
 */
export function transformStockVsSalesVelocity(stockRows = [], salesRows = [], periodDays = 1) {
    const validPeriodDays = Math.max(Number(periodDays) || 1, 1);

    if ((!stockRows || !stockRows.length) && (!salesRows || !salesRows.length)) {
        return {
            categories: [],
            stock: [],
            sales: [],
            rawStock: [],
            rawDailySales: [],
            daysCover: [],
        };
    }

    // Build map for sales by branch_id and normalized branch_name
    const salesMap = new Map();
    (salesRows || []).forEach((row) => {
        if (!row) return;
        const id = row.branch_id != null ? String(row.branch_id) : null;
        const name = (row.branch_name || row.branchName || "").toUpperCase().trim();
        const salesVal = Number(row.net_sales_incl ?? row.net_sales_excl ?? row.cash_sales_excl ?? 0);

        if (id) salesMap.set(id, salesVal);
        if (name) salesMap.set(name, salesVal);
    });

    const branchEntries = new Map();

    // Ingest stock rows
    (stockRows || []).forEach((row) => {
        if (!row) return;
        const id = row.branch_id != null ? String(row.branch_id) : `gen_${Math.random()}`;
        const name = row.branch_name || row.branchName || `Branch ${id}`;
        const rawStock = Number(row.total_stock_value ?? row.closing_value ?? 0);

        branchEntries.set(id, {
            id,
            name,
            rawStock,
            normName: name.toUpperCase().trim(),
        });
    });

    // Also include any branch that made sales but was missing from stock rows
    (salesRows || []).forEach((row) => {
        if (!row) return;
        const id = row.branch_id != null ? String(row.branch_id) : null;
        const name = row.branch_name || row.branchName || (id ? `Branch ${id}` : "Unknown");
        if (id && !branchEntries.has(id)) {
            branchEntries.set(id, {
                id,
                name,
                rawStock: 0,
                normName: name.toUpperCase().trim(),
            });
        }
    });

    const combinedList = Array.from(branchEntries.values()).map((entry) => {
        const rawSales = salesMap.get(entry.id) ?? salesMap.get(entry.normName) ?? 0;
        const rawDailySales = rawSales / validPeriodDays;
        const stockM = entry.rawStock / 1_000_000;
        const salesM = rawDailySales / 1_000_000;
        const daysCover = rawDailySales > 0 ? Math.round(entry.rawStock / rawDailySales) : (entry.rawStock > 0 ? 999 : 0);

        return {
            name: entry.name,
            rawStock: entry.rawStock,
            rawDailySales,
            stockM,
            salesM,
            daysCover,
        };
    });

    // Sort descending by stock value (or sales if stock is 0)
    combinedList.sort((a, b) => b.stockM - a.stockM || b.salesM - a.salesM);

    return {
        categories: combinedList.map((item) => item.name),
        stock: combinedList.map((item) => Number(item.stockM.toFixed(2))),
        sales: combinedList.map((item) => {
            // Keep appropriate precision: if very small (< 0.01M), use 3 or 4 decimals so line doesn't flatten to 0
            if (item.salesM > 0 && item.salesM < 0.01) {
                return Number(item.salesM.toFixed(4));
            }
            return Number(item.salesM.toFixed(2));
        }),
        rawStock: combinedList.map((item) => item.rawStock),
        rawDailySales: combinedList.map((item) => item.rawDailySales),
        daysCover: combinedList.map((item) => item.daysCover),
    };
}