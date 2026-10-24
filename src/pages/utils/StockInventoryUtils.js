import { cleanBranchName } from "../../helpers/branch_helper";
import { getInclusiveDays } from "./dateHelper";
import { pick, num } from "./apiRow";

// FETCH SIZES (0 = everything). Kept here so they are easy to tune against live data.
export const CRITICAL_TOP_N = 0;      // Class A items only, so the full list stays small
export const SLOW_MOVER_TOP_N = 500;  // ranked by capital tied up; the KPI card carries the full count
export const IMBALANCE_TOP_N = 300;   // ranked by imbalance severity

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Sales-velocity window for the stock health calls. It follows the date filter but never
 * drops below 30 days: early in the month a Month-to-Date window would be a few days long
 * and nearly every SKU would be classed as dead stock.
 */
export const getLookbackDays = (startDate, endDate) =>
    Math.min(Math.max(getInclusiveDays(startDate, endDate), 30), 365);

// KPI CARD METADATA

export const KPI_META = [
    { id: 3, label: "Items below Reorder Level", subtitle: "Below safety minimum" },
    { id: 4, label: "Class A Items Out of Stock", subtitle: "Top revenue items at zero stock" },
    { id: 5, label: "Near Expiry (≤ 90 days)", subtitle: "Products at risk" },
    { id: 6, label: "Slow Movers & Dead Stock", subtitle: "Low velocity in the window" },
    { id: 7, label: "Overstocked Items", subtitle: "> Target max cover" },
    { id: 8, label: "Branch Imbalances (> 20%)", subtitle: "Transfer candidates" },
];

export const getKPIMeta = ({ lookbackDays = 30, imbalanceCapped = false } = {}) =>
    KPI_META.map((widget) => {
        if (widget.id === 6) return { ...widget, subtitle: `Low or no sales in ${lookbackDays} days` };
        if (widget.id === 8 && imbalanceCapped) return { ...widget, suffix: "+", subtitle: "Top transfer candidates" };
        return widget;
    });

// EXPIRY

export const EXPIRY_BUCKETS = [
    { id: "expired", label: "Expired", action: "Quarantine / write off", color: "dark" },
    { id: "0-30", label: "0 - 30 Days (Critical)", action: "Promote now", color: "danger" },
    { id: "31-60", label: "31 - 60 Days (Warning)", action: "Transfer/Promote", color: "warning" },
    { id: "61-90", label: "61 - 90 Days (Watch)", action: "Prioritise Sales", color: "info" },
];

const bucketFor = (days) => {
    if (days < 0) return EXPIRY_BUCKETS[0];
    if (days <= 30) return EXPIRY_BUCKETS[1];
    if (days <= 60) return EXPIRY_BUCKETS[2];
    return EXPIRY_BUCKETS[3];
};

/**
 * Batches with stock on hand that have already expired or expire within 90 days.
 * One row per batch, so the widgets, the table and the exports all reconcile.
 */
export const getExpiryRows = (batchRows = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (Array.isArray(batchRows) ? batchRows : [])
        .map((item) => {
            const expiry = item?.expirydate ? new Date(item.expirydate) : null;
            if (!expiry || isNaN(expiry.getTime())) return null;
            expiry.setHours(0, 0, 0, 0);

            const qty = num(pick(item, "qtyBal", "closing_qty"));
            const daysRemaining = Math.round((expiry - today) / MS_PER_DAY);
            if (qty <= 0 || daysRemaining > 90) return null;

            const bucket = bucketFor(daysRemaining);
            return {
                code: pick(item, "invCode", "item_code") || "",
                product: pick(item, "invName", "itemName", "item_name") || "",
                batch: pick(item, "batchNo", "batch_no", "batch", "batchNumber", "lotNo") || "",
                branch: cleanBranchName(pick(item, "branchName", "branch_name") || ""),
                expiry,
                daysRemaining,
                qty,
                value: num(pick(item, "costValue")),
                bucket: bucket.id,
                action: bucket.action,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);
};

// SLOW MOVING STOCK (PowerBIKPIStockHealth, GroupBy = SLOW_MOVERS)

/**
 * Normalises the slow mover rows into the shape shown in the table and the export.
 * Status is binary: Dead Stock (flagged as dead or nothing sold in the window) or Slow Mover.
 */
export const buildSlowMovingRows = (slowMovingStock = []) =>
    (Array.isArray(slowMovingStock) ? slowMovingStock : []).map((row, index) => {
        const unitsSold = num(row.units_sold_window ?? row.totalQty);
        const category = String(row.movement_category || row.status || "").toUpperCase();
        const isDead = category.includes("DEAD") || unitsSold === 0;
        const itemCode = String(row.item_code || row.item_Code || "");
        const subGroup = row.item_subgroup && row.item_subgroup !== "Unassigned" ? row.item_subgroup : "";

        return {
            id: `${itemCode || index}-${row.branch_id ?? row.branch_code ?? index}-${index}`,
            itemCode,
            name: String(row.item_name || row.item_Name || row.item_code || "Unknown Item"),
            category: String(subGroup || row.item_group || "General"),
            group: String(row.item_group || ""),
            subGroup: String(subGroup),
            branch: cleanBranchName(row.branch_name || row.branchName || (row.branch_id ? `Branch ${row.branch_id}` : "All Branches")),
            stockQty: num(row.current_stock_qty),
            unitsSold,
            daysCover: Math.round(num(row.days_of_inventory)),
            unitAvgCost: num(row.unit_avg_cost),
            tiedUpCapital: num(row.tied_up_capital),
            isDead,
            statusLabel: isDead ? "Dead Stock" : "Slow Mover",
            actionInsight: String(row.action_insight || ""),
        };
    });

/** Sorts slow mover rows by name (alphabetical) or by one of the numeric columns. */
export const sortSlowMovingRows = (rows = [], sortField = "tiedUpCapital", sortDesc = true) =>
    [...rows].sort((a, b) => {
        if (sortField === "name") {
            return sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
        }
        const av = a[sortField] ?? 0;
        const bv = b[sortField] ?? 0;
        return sortDesc ? bv - av : av - bv;
    });

export const formatSlowDaysCover = (days) =>
    days >= 999 ? "999+ days" : `${Number(days || 0).toLocaleString()} days`;

// TRANSFER SUGGESTIONS (PowerBIKPIStockHealth, GroupBy = IMBALANCES)

const coverDays = (stock, sales, lookbackDays) =>
    sales > 0 ? Math.round(Math.max(stock, 0) / (sales / lookbackDays)) : null;

export const buildTransferSuggestions = (imbalances = [], lookbackDays = 30) =>
    (Array.isArray(imbalances) ? imbalances : []).map((row, index) => {
        const deficit = String(row.imbalance_status || "").toUpperCase().includes("DEFICIT");
        const stock = num(row.branch_stock);
        const sales = num(row.branch_sales);
        const qty = Math.abs(num(row.recommended_transfer_qty));

        return {
            id: `${row.item_code}-${row.branch_id}-${index}`,
            itemCode: row.item_code || "",
            product: row.item_name || row.item_code || "Unknown item",
            group: row.item_group || "-",
            branch: cleanBranchName(row.branch_name || `Branch ${row.branch_id ?? ""}`),
            deficit,
            stock,
            sales,
            stockShare: num(row.branch_stock_perc),
            salesShare: num(row.branch_sales_perc),
            gap: num(row.imbalance_gap_perc),
            qty,
            coverBefore: coverDays(stock, sales, lookbackDays),
            coverAfter: coverDays(deficit ? stock + qty : stock - qty, sales, lookbackDays),
            insight: [row.action_insight, row.network_context].filter(Boolean).join(" "),
            rankPos: num(row.rank_pos) || index + 1,
            companyStock: num(row.company_stock),
            companySales: num(row.company_sales),
            actionInsight: row.action_insight || (deficit ? "Urgent transfer required from surplus branch" : "Transfer excess stock to deficit branches"),
            networkContext: row.network_context || "—",
        };
    });

// KPI COMPUTATION

export const IMBALANCE_STATUS_FILTERS = [
    { key: "ALL", label: "All" },
    { key: "DEFICIT", label: "Deficit" },
    { key: "SURPLUS", label: "Surplus" },
];

/** Keeps the API's severity ranking (rank_pos) and applies the Deficit / Surplus filter. */
export const filterTransferSuggestions = (suggestions = [], statusFilter = "ALL") =>
    suggestions
        .filter((item) => {
            if (statusFilter === "DEFICIT") return item.deficit;
            if (statusFilter === "SURPLUS") return !item.deficit;
            return true;
        })
        .sort((a, b) => a.rankPos - b.rankPos);

// KPI COMPUTATION

export const computeKPIs = (batchExpiryRows = [], stockHealth = [], imbalances = []) => {
    const health = (Array.isArray(stockHealth) ? stockHealth[0] : stockHealth) || {};
    const nearExpiry = new Set(
        getExpiryRows(batchExpiryRows)
            .filter((row) => row.daysRemaining >= 0)
            .map((row) => row.code || row.product)
    );

    return {
        3: num(health.min_breached_skus),
        // critical_stocked_out_skus is what the summary actually returns; the old
        // out_of_stock_skus field never existed and fell back to the whole catalogue.
        4: num(health.critical_stocked_out_skus),
        5: nearExpiry.size,
        6: num(health.slow_mover_skus) + num(health.dead_stock_skus),
        7: num(health.overstocked_skus),
        8: (imbalances || []).length,
    };
};
