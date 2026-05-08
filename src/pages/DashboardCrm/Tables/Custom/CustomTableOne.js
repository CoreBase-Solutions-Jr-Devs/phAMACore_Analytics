import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import TableContainer from '../../../../Components/Common/TableContainerReactTable';

const CustomTableOne = () => {
    const paginationTable =
        [{ product: "Ciproflacin 500mg", branch: "Eldoret", date: "07 Oct, 2021", total: "1,200", status: "Promote now", value: "96,000" },
        { product: "Vitamin C 500mg", branch: "Mombasa", date: "07 Oct, 2021", total: "3,400", status: "Transfer/Promote", value: "96,000" },
        { product: "Dextrose IV 5%", branch: "Nakuru", date: "06 Oct, 2021", total: "480", status: "Prioritise Sales", value: "96,000" },
        { product: "Antifungal  Cream 2%", branch: "Kisumu", date: "05 Oct, 2021", total: "620", status: "Prioritise Sales", value: "96,000" },
        { product: "Mutlivitamin Syrup", branch: "Thika", date: "05 Oct, 2021", total: "900", status: "Prioritise Sales", value: "96,000" },
        // { product: "#VL2106", branch: "Traci", date: "04 Oct, 2021", total: "$24.05", status: "Prioritise Sales", value: "96,000" },
        // { product: "#VL2105", branch: "Kerry", date: "04 Oct, 2021", total: "$26.15", status: "Paid", value: "96,000" },
        // { product: "#VL2104", branch: "Patsy", date: "04 Oct, 2021", total: "$21.25", status: "Prioritise Sales", value: "96,000" },
        // { product: "#VL2103", branch: "Cathy", date: "03 Oct, 2021", total: "$22.61", status: "Paid", value: "96,000" },
        // { product: "#VL2102", branch: "Tyrone", date: "03 Oct, 2021", total: "$25.03", status: "Paid", value: "96,000" }
        ];

    const columns = useMemo(
        () => [
            {
                header: "Product",
                cell: (cell) => {
                    return (
                        <Link to="#" className="fw-medium">{cell.getValue()}</Link>
                    );
                },
                accessorKey: "product",
                enableColumnFilter: false,
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
                header: "Action",
                enableColumnFilter: false,
                accessorKey: "status",
                cell: (cell) => {
                    switch (cell.getValue()) {
                        case "Paid":
                            return (<span className="badge bg-success-subtle text-success text-uppercase"> {cell.getValue()}</span>);
                        case "Prioritise Sales":
                            return (<span className="badge bg-warning text-white text-uppercase"> {cell.getValue()}</span>);
                        case "Transfer/Promote":
                            return (<span className="badge bg-danger  text-black text-uppercase"> {cell.getValue()}</span>);
                        case "Promote now":
                            return (<span className="badge bg-danger  text-black text-uppercase"> {cell.getValue()}</span>);
                        default:
                            return (<span className="badge bg-danger-subtle  text-danger text-uppercase"> {cell.getValue()}</span>);
                    }
                },
            },
            {
                header: "Value(KES)",
                accessorKey: "value",
                enableColumnFilter: false,
            },
            // {
            //     header: "Actions",
            //     enableColumnFilter: false,
            //     cell: (cell) => {
            //         return (
            //             <React.Fragment>
            //                 Details
            //             </React.Fragment>
            //         );
            //     },
            // },
        ],
        []
    );

    return (
        <React.Fragment >
            <TableContainer
                columns={(columns || [])}
                data={(paginationTable || [])}
                customPageSize={5}
                tableClass="table-centered align-middle table-nowrap mb-0"
                theadClass="text-muted table-light"
                SearchPlaceholder='Search Products...'
            />
        </React.Fragment >
    );
}

export default CustomTableOne;
