
import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { createColumnHelper } from "@tanstack/react-table";
import TanstackTable from "../../Components/Common/TanstackTable";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const columnHelper = createColumnHelper();

const SalesmanRevenue = ({ data = [], loading, error }) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("staff_Name", {
        header: "Salesperson",
        
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold text-dark">
              {row.original.staff_Name || "Unknown Staff"}
            </div>
            {/* <small className="text-muted">
              ID: {row.original.staff_ID || "N/A"}
            </small> */}
          </div>
        ),
      }),
columnHelper.accessor("item_Name", {
  header: "Item",
  cell: (info) => (
    <span className="fw-medium text-dark ">
      {info.getValue() || "N/A"}
    </span>
  ),
}),

      columnHelper.accessor("brancch_Name", {
        header: "Branch",
       
        cell: (info) => (
          <span className="badge bg-info-subtle text-info px-2 py-2">
            {info.getValue() || "N/A"}
          </span>
        ),
      }),

      columnHelper.accessor("totalSalesExcl", {
        header: "SalesExcl.",
       
        cell: (info) => (
          <span className="fw-semibold text-caramel">
            {Number(info.getValue() || 0).toLocaleString("en-KE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      }),

      columnHelper.accessor("quantity_Sold", {
        header: "Qty",
      
        cell: (info) => (
          <span className="badge bg-primary-subtle text-primary">
            {info.getValue() ?? 0}
          </span>
        ),
      }),

      columnHelper.accessor("gross_Profit", {
        header: "Profit",
       
        cell: (info) => (
          <span className="text-success fw-semibold">
            {Number(info.getValue() || 0).toLocaleString("en-KE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      }),

      // columnHelper.accessor("transaction_IDs", {
      //   header: "TransID",
        
      //   cell: (info) => (
      //     <span className="text-muted small">
      //       {info.getValue() || "N/A"}
      //     </span>
      //   ),
      // }),

      columnHelper.accessor("invoice_Number", {
        header: "InvNum",
       
      }),

      columnHelper.accessor("invoice_Date", {
        header: "InvDate",
      
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleDateString("en-GB")
            : "N/A",
      }),
    ],
    [],
  );
const handleExportExcel = () => {
  const rows = data.map((item) => ({
    Salesperson: item.staff_Name || "Unknown Staff",
    Item: item.item_Name || "N/A",
    Branch: item.brancch_Name || "N/A",
    "Sales Excl. (KES)": Number(item.totalSalesExcl || 0),
    Qty: Number(item.quantity_Sold || 0),
    "Gross Profit (KES)": Number(item.gross_Profit || 0),
    // "Transaction ID": item.transaction_IDs || "N/A",
    "Invoice Number": item.invoice_Number || "N/A",
    "Invoice Date": item.invoice_Date
      ? new Date(item.invoice_Date).toLocaleDateString("en-GB")
      : "N/A",
  }));

  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  exportToExcel(rows, `Salesperson_Revenue_${todayStr}`);
};

  return (
    <Card className="card-height-100" id="sales-salesman-revenue-card">
      <CardHeader className="align-items-center d-flex justify-content-between">
        <h4 className="card-title mb-0">
          Sales by Salesperson 
        </h4>
            <CardExportButtons
                  targetId="sales-salesman-revenue-card"
                  title="SalesPerson Sales Details"
                  onExport={handleExportExcel}
                />
      </CardHeader>

      <CardBody>
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          ></div>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <h6 className="text-danger mb-2">{error}</h6>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-2">
            No Customer Sales Details data available
          </p>
        </div>
      ) : (
        <TanstackTable
          columns={columns}
          data={data}
          loading={loading}
          error={error}
            searchInputWidth = "450px"
          isGlobalFilter={true}
          isColumnFilter={false}
          customPageSize={10}
          showPagination={true}
          showPageSize={true}
          SearchPlaceholder="Search salesperson..."
          emptyMessage="No salesman revenue data available"
        />
         )}
      </CardBody>
    </Card>
  );
};

export default SalesmanRevenue;
