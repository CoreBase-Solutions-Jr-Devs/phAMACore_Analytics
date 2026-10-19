import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Input } from "reactstrap";
import TableContainer from "../../../../Components/Common/TableContainerReactTable";
import { useSelector } from "react-redux";
import { exportToExcel } from "../../../../helpers/export_helper";
import { getExpiryRows } from "../../../utils/StockInventoryUtils";

const CustomTableOne = () => {
    const { batchExpiryNeo, loadingBatchExpiryNeo, errorBatchExpiryNeo } = useSelector(
        (state) => state.StockInventory
    );

    const [searchValue, setSearchValue] = useState("");

    // Expired batches are listed first; they used to be dropped from the table entirely
    const paginationTable = useMemo(
        () =>
            getExpiryRows(batchExpiryNeo).map((row) => ({
                product: row.product,
                batch: row.batch,
                branch: row.branch,
                date: row.expiry.toLocaleDateString("en-GB"),
                days: row.daysRemaining,
                total: row.qty.toLocaleString(),
                status: row.action,
                value: row.value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
            })),
        [batchExpiryNeo]
    );

    const hasBatch = useMemo(() => paginationTable.some((row) => row.batch), [paginationTable]);

    const filteredTable = useMemo(() => {
        const term = searchValue.trim().toLowerCase();
        if (!term) return paginationTable;

        return paginationTable.filter((row) =>
            [row.product, row.batch, row.branch, row.date, row.total, row.status, row.value]
                .some((field) => String(field ?? "").toLowerCase().includes(term))
        );
    }, [paginationTable, searchValue]);

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
                header: "Days Left",
                accessorKey: "days",
                enableColumnFilter: false,
                cell: (cell) =>
                    cell.getValue() < 0 ? (
                        <span className="text-danger fw-medium">Expired {Math.abs(cell.getValue())}d ago</span>
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
                cell: (cell) => {
                    const value = cell.getValue();

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
                },
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
        [hasBatch]
    );

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

    const handleExportTable = () => {
        const rows = (filteredTable || []).map((r) => ({
            "Product": r.product,
            "Batch": r.batch || "-",
            "Branch": r.branch,
            "Expiry Date": r.date,
            "Days Remaining": r.days,
            "Qty Balance": r.total,
            "Action": r.status,
            "Cost Value (KES)": r.value,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `ExpiryWatch_Stock_${todayStr}`);
    };

    return (
        <React.Fragment>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <div className="app-search d-block p-0 flex-grow-1" style={{ maxWidth: "320px" }}>
                    <div className="position-relative">
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="Search Products..."
                            id="table-search-options"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span
                            className={`mdi mdi-close-circle search-widget-icon search-widget-icon-close ${searchValue ? "" : "d-none"}`}
                            id="table-search-close-options"
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
                columns={(columns || [])}
                data={(filteredTable || [])}
                customPageSize={8}
                isGlobalFilter={false}
                isLoading={loadingBatchExpiryNeo}
                tableClass="table-centered align-middle table-nowrap mb-0"
                theadClass="text-muted table-light"
            />
        </React.Fragment>
    );
};

export default CustomTableOne;