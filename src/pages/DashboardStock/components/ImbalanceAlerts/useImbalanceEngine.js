/**
 * useImbalanceEngine.js
 * 
 * Dynamic detection engine for inter-branch inventory imbalances and replenishment alerts.
 * Identifies:
 * 1. Inter-branch transfers (Donor branch surplus -> Receiver branch low/stockout)
 * 2. Network-wide replenishment candidates (Low/depleted stock in all branches)
 * 3. Near-expiry stock promotions (Batches expiring soon needing urgent promotion)
 */

export const useImbalanceEngine = (stock = [], movements = [], expiry = []) => {
    if (!Array.isArray(stock) || !stock.length) {
        return [];
    }

    // Step 1: Deduplicate multi-day snapshots, preserving latest record per (item, branch)
    const itemBranchMap = new Map();

    stock.forEach((row) => {
        const itemCode =
            row.item_code || row.item_Code || row.invCode || row.itemcode || row.id;
        if (!itemCode) return;

        const itemName =
            row.item_Name || row.item_name || row.invName || row.name || itemCode;
        const branchName =
            row.branch_Name ||
            row.branch_name ||
            row.branchName ||
            (row.branch_id ? `Branch ${row.branch_id}` : "Main Branch");

        const qty = Number(
            row.closing_qty ??
            row.closing_Stock ??
            row.closingStock ??
            row.stockInNo ??
            row.qtyBal ??
            row.current_stock_qty ??
            0
        );

        const reorderLevel = Number(
            row.reorder_level ??
            row.effective_min_qty ??
            row.branch_min_qty ??
            row.min_qty ??
            0
        );

        const date = row.snapshot_date ? new Date(row.snapshot_date) : null;
        const key = `${itemCode}__${branchName}`;
        const existing = itemBranchMap.get(key);

        if (!existing || (date && existing.date && date > existing.date) || (!existing.date && date)) {
            itemBranchMap.set(key, {
                itemCode,
                itemName,
                branchName,
                qty,
                reorderLevel,
                date,
            });
        }
    });

    // Step 2: Group by item
    const products = new Map();

    for (const entry of itemBranchMap.values()) {
        if (!products.has(entry.itemCode)) {
            products.set(entry.itemCode, {
                itemCode: entry.itemCode,
                itemName: entry.itemName,
                branches: [],
                totalStock: 0,
                totalReorder: 0,
            });
        }
        const p = products.get(entry.itemCode);
        p.branches.push(entry);
        p.totalStock += entry.qty;
        p.totalReorder += entry.reorderLevel;
    }

    // Step 3: Track near-expiry stock from expiry (batchExpiryNeo)
    const nearExpiryMap = new Map();
    if (Array.isArray(expiry) && expiry.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        expiry.forEach((row) => {
            if (!row.expirydate) return;
            const expDate = new Date(row.expirydate);
            if (isNaN(expDate.getTime())) return;

            const days = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
            if (days >= 0 && days <= 90) {
                const code = row.item_code || row.item_Code || row.invCode || row.itemcode;
                const name = row.item_Name || row.item_name || row.invName || row.name;
                const branch = row.branch_Name || row.branch_name || row.branchName || "Main Branch";
                const qty = Number(row.qtyBal ?? row.closing_qty ?? 0);

                const key = code || name;
                if (key) {
                    if (!nearExpiryMap.has(key)) {
                        nearExpiryMap.set(key, { code, name, branch, qty, days });
                    } else {
                        const curr = nearExpiryMap.get(key);
                        curr.qty += qty;
                        if (days < curr.days) {
                            curr.days = days;
                            curr.branch = branch;
                        }
                    }
                }
            }
        });
    }

    const result = [];

    // Step 4: Analyze imbalances per product
    products.forEach((prod) => {
        // Skip items that have no stock in the entire network (covered by Out of Stock KPI)
        if (prod.totalStock <= 0) return;

        const { branches } = prod;

        if (branches.length >= 2) {
            // Sort branches descending by current stock
            const sorted = [...branches].sort((a, b) => b.qty - a.qty);
            const donor = sorted[0];
            const receiver = sorted[sorted.length - 1];
            const diff = donor.qty - receiver.qty;

            // Check if all branches are low on stock
            const allBranchesLow = branches.every((b) =>
                b.reorderLevel > 0 ? b.qty <= b.reorderLevel : b.qty <= 5
            );

            if (allBranchesLow) {
                result.push({
                    id: `replenish_${prod.itemCode}`,
                    itemCode: prod.itemCode,
                    product: prod.itemName,
                    from: `Network: ${prod.totalStock.toLocaleString()}u`,
                    to: "All Branches",
                    fromBranch: "Network Total",
                    fromQty: prod.totalStock,
                    toBranch: "All Branches",
                    toQty: 0,
                    status: "replenish",
                    statusLabel: "Replenish all",
                    badgeClass: "primary",
                    diff: prod.totalReorder > prod.totalStock ? prod.totalReorder - prod.totalStock : 0,
                    type: "replenish_all",
                });
                return;
            }

            // Check if an inter-branch transfer is needed:
            // 1. Donor has stock (donor.qty > receiver.qty and donor.qty > 0)
            // 2. AND Receiver is out of stock OR below reorder level OR branch deviation > 20%
            const receiverOutOrCrit = receiver.qty <= 0;
            const receiverBelowReorder =
                receiver.reorderLevel > 0 && receiver.qty <= receiver.reorderLevel;
            const significantDeviation =
                donor.qty > receiver.qty &&
                donor.qty > 0 &&
                (donor.qty - receiver.qty) / donor.qty > 0.2;

            if (donor.qty > receiver.qty && (receiverOutOrCrit || receiverBelowReorder || significantDeviation)) {
                let status = "queued";
                let statusLabel = "Transfer queued";
                let badgeClass = "warning";

                if (
                    receiverOutOrCrit ||
                    (receiver.reorderLevel > 0 && receiver.qty <= receiver.reorderLevel * 0.25)
                ) {
                    status = "urgent";
                    statusLabel = "Transfer urgent";
                    badgeClass = "danger";
                }

                const suggestedTransfer = Math.max(
                    1,
                    Math.floor(diff / 2)
                );

                result.push({
                    id: `transfer_${prod.itemCode}`,
                    itemCode: prod.itemCode,
                    product: prod.itemName,
                    from: `${donor.branchName} (${donor.qty.toLocaleString()}u)`,
                    to: `${receiver.branchName} (${receiver.qty.toLocaleString()}u)`,
                    fromBranch: donor.branchName,
                    fromQty: donor.qty,
                    toBranch: receiver.branchName,
                    toQty: receiver.qty,
                    status,
                    statusLabel,
                    badgeClass,
                    diff,
                    suggestedTransfer,
                    type: "inter_branch",
                });
            }
        } else if (branches.length === 1) {
            // Single branch scenario: if low or below reorder level, candidate for supplier replenishment
            const single = branches[0];
            const isLow =
                single.reorderLevel > 0
                    ? single.qty <= single.reorderLevel
                    : single.qty <= 5;

            if (isLow && single.qty > 0) {
                result.push({
                    id: `replenish_${prod.itemCode}`,
                    itemCode: prod.itemCode,
                    product: prod.itemName,
                    from: `${single.branchName} (${single.qty.toLocaleString()}u)`,
                    to: "Replenish / Supplier",
                    fromBranch: single.branchName,
                    fromQty: single.qty,
                    toBranch: "All Branches",
                    toQty: 0,
                    status: "replenish",
                    statusLabel: "Replenish stock",
                    badgeClass: "primary",
                    diff: single.reorderLevel > single.qty ? single.reorderLevel - single.qty : 0,
                    type: "replenish_all",
                });
            }
        }
    });

    // Step 5: Incorporate near-expiry items that require urgent promotion/transfer
    nearExpiryMap.forEach((expItem) => {
        const alreadyIncluded = result.some(
            (r) => r.itemCode === expItem.code || r.product === expItem.name
        );
        if (!alreadyIncluded && expItem.qty > 0) {
            result.push({
                id: `promote_${expItem.code || expItem.name}`,
                itemCode: expItem.code,
                product: expItem.name || expItem.code,
                from: `${expItem.branch} (${expItem.qty.toLocaleString()}u • ${expItem.days}d expiry)`,
                to: "All Branches",
                fromBranch: expItem.branch,
                fromQty: expItem.qty,
                toBranch: "All Branches",
                toQty: 0,
                status: "promote",
                statusLabel: "Promote urgently",
                badgeClass: "info",
                diff: 0,
                type: "near_expiry",
            });
        }
    });

    // Step 6: Order by urgency priority: urgent -> replenish -> queued -> promote
    const priorityMap = { urgent: 0, replenish: 1, queued: 2, promote: 3 };

    return result.sort((a, b) => {
        const pA = priorityMap[a.status] ?? 99;
        const pB = priorityMap[b.status] ?? 99;
        if (pA !== pB) return pA - pB;
        return (b.diff || 0) - (a.diff || 0);
    });
};