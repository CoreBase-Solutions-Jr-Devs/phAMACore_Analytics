import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Alert } from "reactstrap";
import TableContainer from "../../../../Components/Common/TableContainerReactTable";
import { useSelector } from "react-redux";

const CustomTableOne = () => {
    const { batchExpiryNeo, loadingBatchExpiryNeo, errorBatchExpiryNeo } = useSelector(
        (state) => state.StockInventory
    );

    const currentYear = new Date().getFullYear();

    const paginationTable = useMemo(() => {
        return (batchExpiryNeo || [])
            .filter((item) => {
                if (!item.expirydate) return false;

                const year = new Date(item.expirydate).getFullYear();
                return year === currentYear;
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
            <TableContainer
                columns={(columns || [])}
                data={(paginationTable || [])}
                customPageSize={5}
                isGlobalFilter={true}
                isLoading={loadingBatchExpiryNeo}
                tableClass="table-centered align-middle table-nowrap mb-0"
                theadClass="text-muted table-light"
                SearchPlaceholder="Search Products..."
            />
        </React.Fragment>
    );
};

export default CustomTableOne;