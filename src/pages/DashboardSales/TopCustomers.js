
import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { createColumnHelper } from "@tanstack/react-table";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import TanstackTable from "../../Components/Common/TanstackTable";

const columnHelper = createColumnHelper();

const TopCustomers = ({ data = [], loading, error }) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("client_Name", {
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold text-dark">
              {row.original.client_Name || "Unknown Customer"}
            </div>
            <small className="text-muted">
               {row.original.client_ID || "N/A"}
            </small>
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
          <span className="fw-bold text-caramel">
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
          <span className="fw-semibold text-success">
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
      Customer: item.client_Name || "",
      "Customer ID": item.client_ID || "",
      Item: item.item_Name || "",
      Branch: item.brancch_Name || "",
      "Sales Excl. (KES)": Number(item.totalSalesExcl || 0),
      "Quantity Sold": item.quantity_Sold || 0,
      "Gross Profit": item.gross_Profit || 0,
      // "Transaction ID": item.transaction_IDs || "",
      "Invoice Number": item.invoice_Number || "",
      "Invoice Date": item.invoice_Date || "",
    }));

    const todayStr = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    exportToExcel(rows, `Customer_Revenue_${todayStr}`);
  };

return (
  <Card className="card-height-100" id="sales-top-customers-card">
    <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
      <h4 className="card-title mb-0 flex-grow-1">
Sales by Customer
      </h4>

      <CardExportButtons
        targetId="sales-top-customers-card"
        title="Customer Sales Details"
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
           

          searchInputWidth="450px"
          isGlobalFilter={true}
          isColumnFilter={false}
          customPageSize={10}
          showPagination={true}
          showPageSize={true}
          SearchPlaceholder="Search customer..."
          emptyMessage="No customer revenue data available"
        />
      )}
    </CardBody>
  </Card>
);
};

export default TopCustomers;
