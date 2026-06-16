export const useImbalanceEngine = (stock) => {
    if (!Array.isArray(stock)) return [];

    const map = {};

    stock.forEach((row) => {
        const key = row.invCode;

        if (!map[key]) {
            map[key] = {
                name: row.invName,
                branches: {},
            };
        }

        map[key].branches[row.branchName] = Number(
            row.closingStock || row.stockInNo || 0
        );
    });

    const result = [];

    Object.keys(map).forEach((key) => {
        const product = map[key];
        const branches = Object.entries(product.branches);

        if (branches.length < 2) return;

        const sorted = branches.sort((a, b) => b[1] - a[1]);

        const donor = sorted[0];
        const receiver = sorted[sorted.length - 1];

        const diff = donor[1] - receiver[1];

        if (diff < 200) return;

        const status =
            receiver[1] < 300 ? "urgent" : "queued";

        result.push({
            id: key,
            product: product.name,
            from: `${donor[0]} ${donor[1]}u`,
            to: `${receiver[0]} ${receiver[1]}u`,
            status,
        });
    });

    return result;
};