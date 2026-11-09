import React from "react";
import { Card, CardHeader } from "reactstrap";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import TanstackTable from "../../Components/Common/TanstackTable";

const getBadgeColor = (percentage) => {
  if (percentage == null || Number.isNaN(Number(percentage))) {
    return "bg-warning-subtle text-warning";
  }

  // if (percentage < 0) {
  //   return "bg-danger-subtle text-danger";
  // }

  if (percentage < 10) {
    return "bg-danger-subtle text-danger-emphasis";
  }

  if (percentage < 50) {
    return "bg-primary-subtle text-primary-emphasis";
  }
  return "bg-success-subtle text-success";
};

// Format currency
const formatAmount = (value) =>
   Number(value ?? 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Format percentages
const formatPercentage = (value) =>
  `${Number(value ?? 0).toFixed(2)}%`;

const SupplierSpend = ({
  supplierData,
  error,
  loading,
}) => {
  const hasData = Array.isArray(supplierData) && supplierData.length > 0;

  // Table columns
const columns = [
  {
    header: "Rank",
    accessorKey: "rank_pos",
    cell: ({ getValue }) => (
      <span className="badge bg-light text-dark">
        {getValue()}
      </span>
    ),
  },
  {
    header: "Supplier",
    accessorKey: "supplier_name",
    cell: ({ row }) => (
      <div>
        <div className="fw-semibold text-dark">
          {row.original.supplier_name}
        </div>
        <small className="text-muted">
          {row.original.supplier_id}
        </small>
      </div>
    ),
  },
  {
    header: "NetPurch(Incl.)KES",
    accessorKey: "net_purchases_incl",
    cell: ({ getValue }) => (
      <span className="fw-semibold text-caramel">
        {formatAmount(getValue())}
      </span>
    ),
  },
  {
    header: "GrossPurch(Excl.)KES",
    accessorKey: "gross_purchases_excl",
    cell: ({ getValue }) => (
      <span className="text-success fw-semibold">
        {formatAmount(getValue())}
      </span>
    ),
  },
  {
    header: "NetPurch(Excl.)KES",
    accessorKey: "net_purchases_excl",
    cell: ({ getValue }) => (
      <span className="fw-semibold text-secondary">
        {formatAmount(getValue())}
      </span>
    ),
  },
  {
    header: "Returns(Excl.)KES",
    accessorKey: "purchase_returns_excl",
    cell: ({ getValue }) => (
      <span className="text-danger font-semibold">
        {formatAmount(getValue())}
      </span>
    ),
  },
  {
    header: "Tax",
    accessorKey: "total_tax",
    cell: ({ getValue }) => (
      <span className="text-muted">
        {formatAmount(getValue())}
      </span>
    ),
  },
  {
  header: "SpendShare",
  accessorKey: "spend_share_perc",
  cell: ({ getValue }) => (
    <span className={`badge ${getBadgeColor(getValue())}`}>
      {formatPercentage(getValue())}
    </span>
  ),
},
  {
    header: "Invoices",
    accessorKey: "total_invoices_count",
  },
  {
    header: "Returns",
    accessorKey: "total_returns_count",
  },
  {
    header: "LineItems",
    accessorKey: "total_line_items",
  },
  {
    header: "UniqueItems",
    accessorKey: "unique_items",
  },
  {
    header: "NetUnits",
    accessorKey: "net_units_received",
    cell: ({ getValue }) =>
      Number(getValue() ?? 0).toLocaleString("en-KE"),
  },
{
  header: "ReturnRate",
  accessorKey: "return_rate_perc",
  cell: ({ getValue }) => (
    <span className={`badge ${getBadgeColor(getValue())}`}>
      {formatPercentage(getValue())}
    </span>
  ),
},
];

  // Export supplier data
  const handleExportExcel = () => {
    const rows = (supplierData || []).map((item) => ({
      Rank: item.rank_pos,
      "Supplier ID": item.supplier_id,
      "Supplier Name": item.supplier_name,
      "Total Invoices": item.total_invoices_count,
      "Total Returns": item.total_returns_count,
      "Total Line Items": item.total_line_items,
      "Unique Items": item.unique_items,
      "Gross Purchases Excl.": item.gross_purchases_excl,
      "Purchase Returns Excl.": item.purchase_returns_excl,
      "Net Purchases Excl.": item.net_purchases_excl,
      "Total Tax": item.total_tax,
      "Net Purchases Incl.": item.net_purchases_incl,
      "Net Units Received": item.net_units_received,
      "Return Rate (%)": item.return_rate_perc,
      "Spend Share (%)": item.spend_share_perc,
    }));

    const todayStr = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    exportToExcel(rows, `Spend_By_Supplier_${todayStr}`);
  };

  return (
    <Card className="card-height-100" id="purchases-top-suppliers-card">
      <CardHeader className="card-header align-items-center d-flex justify-content-between flex-wrap gap-2">
        <h4 className="card-title mb-0 flex-grow-1">
          Spend by Supplier
        </h4>

        <CardExportButtons
          targetId="purchases-top-suppliers-card"
          title="Spend by Supplier"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <div className="card-body p-3">
      {loading ? (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : error ? (
    <div className="alert alert-danger mb-0">
      {typeof error === "string"
        ? error
        : error.message || "Failed to load supplier spend data."}
    </div>
  ) : hasData ? (
    <TanstackTable
      columns={columns}
      data={supplierData}
      emptyMessage="No supplier spend data available"
      isGlobalFilter={true}
      isColumnFilter={false}
      customPageSize={10}
      pageSizeOptions={[5, 10, 20, 30, 50]}
      showPagination={true}
      showPageSize={true}
      SearchPlaceholder="Search suppliers..."
      tableClass="table align-middle table-hover"
      divClass="table-responsive"
      tableStyle={{ minWidth: "1500px" }}
    />
  ) : (
    <div className="text-center text-muted py-4">
      No supplier spend data available
    </div>
  )}
</div>
    </Card>
  );
};

export default SupplierSpend;