import React, { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import TanstackTable from "../../../Components/Common/TanstackTable";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import { useSelector } from "react-redux";

const formatAmount = (value) =>
  value == null
    ? "-"
    : Number(value).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const formatPercentage = (value) =>
  value == null ? "-" : `${Number(value).toFixed(2)}%`;

const numericSort = (rowA, rowB, columnId) => {
  const a = Number(rowA.getValue(columnId) || 0);
  const b = Number(rowB.getValue(columnId) || 0);
  return a - b;
};

const getBadgeColor = (percentage) => {
  if (percentage == null || Number.isNaN(Number(percentage))) {
    return "bg-warning-subtle text-warning";
  }

  if (percentage < 10) {
    return "bg-danger-subtle text-danger-emphasis";
  }

  if (percentage < 50) {
    return "bg-primary-subtle text-primary-emphasis";
  }

  return "bg-success-subtle text-success";
};

const columns = [
  {
    header: "Period",
    accessorKey: "period",
    size: 110,
    enableSorting: true,
    meta: {
      sticky: "period",
      tdStyle: {
        minWidth: "110px",
        width: "110px",
        maxWidth: "110px",
        boxShadow: "2px 0 3px -3px rgba(0,0,0,0.35)",
      },
    },
    cell: ({ getValue }) => <span className="fw-medium">{getValue()}</span>,
  },
  {
    header: "CashSales",
    accessorKey: "cash_sales_incl",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className="text-caramel fw-medium">{formatAmount(getValue())}</span>
    ),
  },
  {
    header: "CashInvoices",
    accessorKey: "cash_invoices_incl",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className="fw-medium text-danger">{formatAmount(getValue())}</span>
    ),
  },
  {
    header: "InsuranceSales",
    accessorKey: "insurance_sales_incl",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className="text-success fw-medium">{formatAmount(getValue())}</span>
    ),
  },
  {
    header: "GlovoSales",
    accessorKey: "glovo_sales_incl",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className="fw-medium text-secondary">{formatAmount(getValue())}</span>
    ),
  },
  {
    header: "OtherSales",
    accessorKey: "other_sales_incl",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className="fw-medium text-warning">
        {formatAmount(getValue())}
      </span>
    ),
  },
  {
    header: "CreditNotes",
    accessorKey: "credit_notes_incl",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className=" fw-medium">{formatAmount(getValue())}</span>
    ),
  },
  {
    header: "Total Sales Incl.",
    accessorKey: "total_sales_incl",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className="fw-medium text-success">{formatAmount(getValue())}</span>
    ),
  },
  {
    header: "Total Tax",
    accessorKey: "total_tax",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className="fw-medium">{formatAmount(getValue())}</span>
    ),
  },
  {
    header: "Total Sales Excl.",
    accessorKey: "total_sales_excl",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className="fw-medium text-danger">{formatAmount(getValue())}</span>
    ),
  },
  {
    header: "Clients Served",
    accessorKey: "clients_served",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span >
        {Number(getValue() || 0).toLocaleString("en-GB")}
      </span>
    ),
  },
  {
    header: "Gross Margin",
    accessorKey: "gross_margin_perc",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span className={`badge ${getBadgeColor(getValue())}`}>
        {formatPercentage(getValue())}
      </span>
    ),
  },
  {
    header: "Avg. Basket Value",
    accessorKey: "avg_basket_value",
    enableSorting: true,
    sortingFn: numericSort,
    cell: ({ getValue }) => (
      <span >{formatAmount(getValue())}</span>
    ),
  },
];

const SummaryTable = ({
  salesPeriodicBreakdownData = [],
  loading,
  error,
}) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredData = useMemo(() => {
    const search = globalFilter.trim().toLowerCase();

    if (!search) return salesPeriodicBreakdownData;

    return salesPeriodicBreakdownData.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      )
    );
  }, [salesPeriodicBreakdownData, globalFilter]);

  const handleExportExcel = () => {
    const rows = (filteredData ?? []).map((original) => ({
      Period: original.period ?? "—",
      "Cash Sales": Number(original.cash_sales_incl ?? 0),
      "Cash Invoices": Number(original.cash_invoices_incl ?? 0),
      "Insurance Sales": Number(original.insurance_sales_incl ?? 0),
      "Glovo Sales": Number(original.glovo_sales_incl ?? 0),
      "Other Sales": Number(original.other_sales_incl ?? 0),
      "Credit Notes": Number(original.credit_notes_incl ?? 0),
      "Total Sales Incl.": Number(original.total_sales_incl ?? 0),
      "Total Tax": Number(original.total_tax ?? 0),
      "Total Sales Excl.": Number(original.total_sales_excl ?? 0),
      "Clients Served": Number(original.clients_served ?? 0),
      "Gross Margin (%)": Number(original.gross_margin_perc ?? 0),
      "Avg. Basket Value": Number(original.avg_basket_value ?? 0),
    }));

    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    exportToExcel(rows, `Sales_Periodic_Breakdown_${todayStr}`);
  };
  return (
    <React.Fragment>
      <Card id="sales-periodic-breakdown-card" className="card-animate w-100">
        {" "}
        <CardHeader className="d-flex justify-content-between align-items-center flex-wrap pb-1 gap-2">
          {" "}
          <div>
            <h5 className="card-title mb-1">Sales Breakdown by Period</h5>
            <p className="text-muted mb-0">
              Year to date, monthly and weekly sales by payment type, 
              clients served and average basket.{" "}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <CardExportButtons
              targetId="sales-periodic-breakdown-card"
              title="Sales Breakdown by Period"
              onExport={handleExportExcel}
            />
          </div>
        </CardHeader>
        <CardBody>
          <TanstackTable
            columns={columns}
            data={filteredData}
            
            isGlobalFilter={true}
            isColumnFilter={false}
              globalFilter={globalFilter}
  onGlobalFilterChange={setGlobalFilter}

            searchInputWidth="450px"
            loading={loading}
            error={error}
            customPageSize={10}
            pageSizeOptions={[5, 10, 20, 30, 50]}
            showPagination={true}
            showPageSize={true}
            SearchPlaceholder="Search sales periodic breakdown..."
            tableStyle={{ minWidth: "1500px" }}
          />
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default SummaryTable;
