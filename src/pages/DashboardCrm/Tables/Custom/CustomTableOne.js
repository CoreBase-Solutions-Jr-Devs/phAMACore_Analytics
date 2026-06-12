import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Input } from "reactstrap";
import TableContainer from "../../../../Components/Common/TableContainerReactTable";
import { useSelector } from "react-redux";

const CustomTableOne = () => {
    const { batchExpiryNeo, loadingBatchExpiryNeo, errorBatchExpiryNeo } = useSelector(
        (state) => state.StockInventory
    );
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

    const [searchValue, setSearchValue] = useState("");

    const today = new Date();
    const cutoff = new Date(today.getTime() + NINETY_DAYS_MS);
    const currentYear = new Date().getFullYear();

    const paginationTable = useMemo(() => {
        return (batchExpiryNeo || [])
            .filter((item) => {
                if (!item.expirydate) return false;

                const expiryDate = new Date(item.expirydate);
                if (isNaN(expiryDate.getTime())) return false;

                return expiryDate >= today && expiryDate <= cutoff;
            })
            .map((item) => {
                const qty = Number(item.qtyBal || 0);
                const value = Number(item.costValue || 0);

                const expiryDate = item.expirydate;

                const daysRemaining = expiryDate
                    ? Math.ceil(
                        (new Date(expiryDate) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )
                    : 999;

                let action = "Prioritise Sales";

                if (daysRemaining <= 30) {
                    action = "Promote now";
                } else if (daysRemaining <= 60) {
                    action = "Transfer/Promote";
                } else if (daysRemaining <= 90) {
                    action = "Prioritise Sales";
                }

                return {
                    product: item.invName,
                    branch: item.branchName,
                    date: expiryDate
                        ? new Date(expiryDate).toLocaleDateString()
                        : "-",
                    total: qty.toLocaleString(),
                    status: action,
                    value: value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                };
            });
    }, [batchExpiryNeo]);

    const filteredTable = useMemo(() => {
        const term = searchValue.trim().toLowerCase();
        if (!term) return paginationTable;

        return paginationTable.filter((row) =>
            [row.product, row.branch, row.date, row.total, row.status, row.value]
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
                        case "Prioritise Sales":
                            return badge("bg-warning");

                        case "Transfer/Promote":
                            return badge("bg-info");

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
        []
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

    return (
        <React.Fragment>
            <div className="app-search d-block p-0 mb-2">
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

            <TableContainer
                columns={(columns || [])}
                data={(filteredTable || [])}
                customPageSize={5}
                isGlobalFilter={false}
                isLoading={loadingBatchExpiryNeo}
                tableClass="table-centered align-middle table-nowrap mb-0"
                theadClass="text-muted table-light"
            />
        </React.Fragment>
    );
};

export default CustomTableOne;