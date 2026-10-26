import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Input } from "reactstrap";
import TableContainer from "../../../../Components/Common/TableContainerReactTable";
import { useSelector } from "react-redux";
import { exportToExcel } from "../../../../helpers/export_helper";
import { getExpiryRows } from "../../../utils/StockInventoryUtils";
import { formatCompact } from "../../../utils/formatHelper";

const mapRowForTable = (row) => ({
    product: row.product,
    batch: row.batch,
    branch: row.branch,
    date: row.expiry.toLocaleDateString("en-GB"),
    days: row.daysRemaining,
    total: row.qty.toLocaleString(),
    status: row.action,
    rawValue: row.value,
    value: row.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }),
});

const renderActionBadge = (value) => {
    const badge = (color) => (
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <span className={`badge ${color} text-white text-uppercase`}>
                {value}
            </span>
        </div>
    );

    switch (value) {
        case "Quarantine / write off":
            return badge("bg-dark");
        case "Prioritise Sales":
            return badge("bg-info");
        case "Transfer/Promote":
            return badge("bg-warning");
        case "Promote now":
            return badge("bg-danger");
        default:
            return badge("bg-secondary");
    }
};

const ExpiryProductTable = ({
    title,
    subtitle,
    badgeColor = "dark",
    rows = [],
    isExpiredTable = false,
    isLoading = false,
    exportPrefix = "ExpiryWatch_Stock",
    searchPlaceholder = "Search Products...",
    searchIdPrefix = "table-search",
}) => {
    const [searchValue, setSearchValue] = useState("");

    const hasBatch = useMemo(() => rows.some((row) => row.batch), [rows]);

    const totalCostValue = useMemo(
        () => rows.reduce((sum, row) => sum + (row.rawValue || 0), 0),
        [rows]
    );

    const filteredTable = useMemo(() => {
        const term = searchValue.trim().toLowerCase();
        if (!term) return rows;

        return rows.filter((row) =>
            [row.product, row.batch, row.branch, row.date, row.total, row.status, row.value]
                .some((field) => String(field ?? "").toLowerCase().includes(term))
        );
    }, [rows, searchValue]);

    const columns = useMemo(
        () => [
            {
                header: "Product",
                accessorKey: "product",
                enableColumnFilter: false,
                cell: (cell) => (
                    <Link to="#" className="fw-medium">
                        {cell.getValue()}
                    </Link>
                ),
            },
            ...(hasBatch
                ? [{ header: "Batch", accessorKey: "batch", enableColumnFilter: false }]
                : []),
            {
                header: "Branch",
                accessorKey: "branch",
                enableColumnFilter: false,
            },
            {
                header: "Expiry",
                accessorKey: "date",
                enableColumnFilter: false,
            },
            {
                header: isExpiredTable ? "Expired" : "Days Left",
                accessorKey: "days",
                enableColumnFilter: false,
                cell: (cell) =>
                    cell.getValue() < 0 ? (
                        <span className="text-danger fw-medium">
                            Expired {Math.abs(cell.getValue())}d ago
                        </span>
                    ) : (
                        cell.getValue()
                    ),
            },
            {
                header: "Qty",
                accessorKey: "total",
                enableColumnFilter: false,
            },
            {
                header: () => (
                    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                        Action
                    </div>
                ),
                accessorKey: "status",
                enableColumnFilter: false,
                cell: (cell) => renderActionBadge(cell.getValue()),
            },
            {
                header: () => (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        Value (KES)
                    </div>
                ),
                accessorKey: "value",
                enableColumnFilter: false,
                cell: (cell) => (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        {cell.getValue()}
                    </div>
                ),
            },
        ],
        [hasBatch, isExpiredTable]
    );

    const handleExportTable = () => {
        const exportRows = (filteredTable || []).map((r) => ({
            "Product": r.product,
            "Batch": r.batch || "-",
            "Branch": r.branch,
            "Expiry Date": r.date,
            [isExpiredTable ? "Days Expired" : "Days Remaining"]: isExpiredTable
                ? Math.abs(r.days)
                : r.days,
            "Qty Balance": r.total,
            "Action": r.status,
            "Cost Value (KES)": r.value,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(exportRows, `${exportPrefix}_${todayStr}`);
    };

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="card-title mb-0 fs-14 text-uppercase">{title}</h5>
                        <span className={`badge bg-${badgeColor}-subtle text-${badgeColor} fs-12`}>
                            {rows.length.toLocaleString()} {rows.length === 1 ? "batch" : "batches"} · KES {formatCompact(totalCostValue)} at cost
                        </span>
                    </div>
                    {subtitle && <p className="text-muted mb-0 small mt-1">{subtitle}</p>}
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <div className="app-search d-block p-0 flex-grow-1" style={{ maxWidth: "320px" }}>
                    <div className="position-relative">
                        <Input
                            type="text"
                            className="form-control"
                            placeholder={searchPlaceholder}
                            id={`${searchIdPrefix}-options`}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span
                            className={`mdi mdi-close-circle search-widget-icon search-widget-icon-close ${searchValue ? "" : "d-none"}`}
                            id={`${searchIdPrefix}-close-options`}
                            role="button"
                            onClick={() => setSearchValue("")}
                        ></span>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn btn-sm btn-soft-success btn-export-excel d-flex align-items-center gap-1 no-print"
                    onClick={handleExportTable}
                    title="Export this table to Excel"
                >
                    <i className="ri-file-excel-2-line align-middle"></i>
                    <span>Export Table</span>
                </button>
            </div>

            <TableContainer
                columns={columns || []}
                data={filteredTable || []}
                customPageSize={8}
                isGlobalFilter={false}
                isLoading={isLoading}
                tableClass="table-centered align-middle table-nowrap mb-0"
                theadClass="text-muted table-light"
            />
        </div>
    );
};

const CustomTableOne = () => {
    const {
        batchExpiryNeo,
        loadingBatchExpiryNeo,
        errorBatchExpiryNeo,
        branches = [],
        filters = {},
    } = useSelector((state) => state.StockInventory);

    const { expiredTableRows, writeOffRiskTableRows } = useMemo(() => {
        const allRows = getExpiryRows(batchExpiryNeo, {
            branchCode: filters.branch,
            branches,
            asOfDate: filters.endDate,
        });
        const expired = [];
        const writeOffRisk = [];

        allRows.forEach((row) => {
            const mapped = mapRowForTable(row);
            if (row.daysRemaining < 0) {
                expired.push(mapped);
            } else {
                writeOffRisk.push(mapped);
            }
        });

        return {
            expiredTableRows: expired,
            writeOffRiskTableRows: writeOffRisk,
        };
    }, [batchExpiryNeo, filters.branch, branches, filters.endDate]);

    if (errorBatchExpiryNeo) {
        return (
            <Alert color="danger" className="mb-0">
                <strong>Batch Expiry Error:</strong>{" "}
                {typeof errorBatchExpiryNeo === "string"
                    ? errorBatchExpiryNeo
                    : "Unable to load batch expiry records."}
            </Alert>
        );
    }

    return (
        <React.Fragment>
            <ExpiryProductTable
                title="Write-Off Risk Products (0 - 90 Days)"
                subtitle="Batches expiring within the next 90 days requiring promotion, sales prioritisation, or transfer."
                badgeColor="danger"
                rows={writeOffRiskTableRows}
                isExpiredTable={false}
                isLoading={loadingBatchExpiryNeo}
                exportPrefix="WriteOff_Risk_Stock"
                searchPlaceholder="Search Write-Off Risk Products..."
                searchIdPrefix="writeoff-table-search"
            />

            <hr className="my-4" />

            <ExpiryProductTable
                title="Expired Products"
                subtitle="Batches with remaining stock on hand that have already passed their expiry date."
                badgeColor="dark"
                rows={expiredTableRows}
                isExpiredTable={true}
                isLoading={loadingBatchExpiryNeo}
                exportPrefix="Expired_Products_Stock"
                searchPlaceholder="Search Expired Products..."
                searchIdPrefix="expired-table-search"
            />
        </React.Fragment>
    );
};

export default CustomTableOne;