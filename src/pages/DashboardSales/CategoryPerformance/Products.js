import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import TanstackTable from "../../../Components/Common/TanstackTable";

const GROUP_WIDTH = 170;
const SUBGROUP_WIDTH = 200;

const formatAmount = (value) => Number(value ?? 0).toLocaleString("en-KE");

const formatNumber = (value) => Number(value ?? 0).toLocaleString("en-KE");

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

const Products = ({
  selectedBranchName,
  loading = true,
  error = true,
  rightClickBtn,
  categoryPerformance = [],
}) => {
  const columns = useMemo(
    () => [
      {
        header: "Group",
        accessorKey: "group_name",
        size: GROUP_WIDTH,
        meta: {
          sticky: "group",
          tdStyle: {
            minWidth: `${GROUP_WIDTH}px`,
            width: `${GROUP_WIDTH}px`,
            maxWidth: `${GROUP_WIDTH}px`,
            boxShadow: "2px 0 3px -3px rgba(0,0,0,0.35)",
          },
        },
        cell: ({ getValue }) => (
          <span className="fw-semibold text-body">{getValue() ?? "—"}</span>
        ),
      },
      {
        header: "Subgroup Name",
        accessorKey: "subgroup_name",
        size: SUBGROUP_WIDTH,
        meta: {
          sticky: "subgroup",
          tdStyle: {
            minWidth: `${SUBGROUP_WIDTH}px`,
            width: `${SUBGROUP_WIDTH}px`,
            maxWidth: `${SUBGROUP_WIDTH}px`,
            boxShadow: "3px 0 5px -4px rgba(0,0,0,0.4)",
          },
        },
        cell: ({ row }) => (
          <div className="d-flex flex-column">
            <span className="fw-semibold text-body">
              {row.original.subgroup_name ?? "—"}
            </span>
            <span className="text-muted small">
              {row.original.subgroup_code ?? "—"}
            </span>
          </div>
        ),
      },
      // {
      //   header: "Subgroup Code",
      //   accessorKey: "subgroup_code",
      //   cell: ({ getValue }) => (
      //     <span className="text-muted small">
      //       {getValue() ?? "—"}
      //     </span>
      //   ),
      // },
      {
        header: "Active Items",
        accessorKey: "active_items_count",
        cell: ({ getValue }) => (
          <span className="text-info fw-semibold">
            {formatNumber(getValue())}
          </span>
        ),
      },
      {
        header: "Transactions",
        accessorKey: "transaction_count",
        cell: ({ getValue }) => (
          <span className="text-primary fw-semibold">
            {formatNumber(getValue())}
          </span>
        ),
      },
      {
        header: "Line Items",
        accessorKey: "total_line_items",
        cell: ({ getValue }) => (
          <span className="text-body">{formatNumber(getValue())}</span>
        ),
      },
      {
        header: "Unique Clients",
        accessorKey: "unique_clients",
        cell: ({ getValue }) => (
          <span className="text-success fw-semibold">
            {formatNumber(getValue())}
          </span>
        ),
      },
      {
        header: "Units Sold",
        accessorKey: "total_units_sold",
        cell: ({ getValue }) => (
          <span className="text-info fw-semibold">
            {formatNumber(getValue())}
          </span>
        ),
      },
      {
        header: "Total Sales (Excl.)",
        accessorKey: "total_sales_excl",
        cell: ({ getValue }) => (
          <span className="text-primary fw-semibold">
            {formatAmount(getValue())}
          </span>
        ),
      },
      {
        header: "Tax",
        accessorKey: "total_tax",
        cell: ({ getValue }) => (
          <span className="text-muted">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "Total Sales (Incl.)",
        accessorKey: "total_sales_incl",
        cell: ({ getValue }) => (
          <span className="text-primary fw-bold">
            {formatAmount(getValue())}
          </span>
        ),
      },
      {
        header: "Total COGS",
        accessorKey: "total_cogs",
        cell: ({ getValue }) => (
          <span className="text-danger">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "Gross Profit",
        accessorKey: "gross_profit",
        cell: ({ getValue }) => {
          const profit = Number(getValue() ?? 0);

          return (
            <span
              className={`fw-bold ${
                profit < 0 ? "text-danger" : "text-success"
              }`}
            >
              {formatAmount(profit)}
            </span>
          );
        },
      },
      {
        header: "Gross Margin (%)",
        accessorKey: "gross_margin_perc",
        cell: ({ getValue }) => {
          const percentage = getValue();
          const value =
            percentage == null || percentage === "" ? null : Number(percentage);

          return (
            <Badge pill className={getBadgeColor(value)}>
              {value == null || Number.isNaN(value)
                ? "N/A"
                : `${value.toFixed(1)}%`}
            </Badge>
          );
        },
      },
      {
        header: "Avg Order Value",
        accessorKey: "avg_order_value",
        cell: ({ getValue }) => (
          <span className="text-body fw-semibold">
            {formatAmount(getValue())}
          </span>
        ),
      },
      {
        header: "Sales Share (%)",
        accessorKey: "sales_share_perc",
        cell: ({ getValue }) => {
          const percentage = getValue();
          const value =
            percentage == null || percentage === "" ? null : Number(percentage);

          return (
            <Badge pill className={getBadgeColor(value)}>
              {value == null || Number.isNaN(value)
                ? "N/A"
                : `${value.toFixed(1)}%`}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  const handleExportExcel = () => {
    // Export all records supplied to the component.
    const rows = (categoryPerformance ?? []).map((original) => ({
      Group: original.group_name ?? "—",
      "Subgroup Name": original.subgroup_name ?? "—",
      "Subgroup Code": original.subgroup_code ?? "—",
      "Active Items": Number(original.active_items_count ?? 0),
      Transactions: Number(original.transaction_count ?? 0),
      "Line Items": Number(original.total_line_items ?? 0),
      "Unique Clients": Number(original.unique_clients ?? 0),
      "Units Sold": Number(original.total_units_sold ?? 0),
      "Total Sales (Excl.)": Number(original.total_sales_excl ?? 0),
      Tax: Number(original.total_tax ?? 0),
      "Total Sales (Incl.)": Number(original.total_sales_incl ?? 0),
      "Total COGS": Number(original.total_cogs ?? 0),
      "Gross Profit": Number(original.gross_profit ?? 0),
      "Gross Margin (%)": Number(original.gross_margin_perc ?? 0),
      "Avg Order Value": Number(original.avg_order_value ?? 0),
      "Sales Share (%)": Number(original.sales_share_perc ?? 0),
    }));

    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    exportToExcel(rows, `Product_Performance_${todayStr}`);
  };

  return (
    <Card id="product-performance-card" className="card-animate w-100">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
        <div>
          <h4 className="card-title mb-1">Product Performance</h4>

          <p className="text-muted mb-0">
            Analyze sales, profitability, customer activity, and performance
            across product groups and subgroups.
          </p>

          {/* {selectedBranchName && (
            <small className="text-muted">
              Branch: {selectedBranchName}
            </small>
          )} */}
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {rightClickBtn}

          <CardExportButtons
            targetId="product-performance-card"
            title="Product Performance"
            onExport={handleExportExcel}
          />
        </div>
      </CardHeader>

      <CardBody className="p-2">
        <TanstackTable
          columns={columns}
          data={categoryPerformance ?? []}
          loading={loading}
          error={error}
          searchInputWidth="450px"
          customPageSize={10}
          pageSizeOptions={[5, 10, 20, 30]}
          isGlobalFilter={true}
          isColumnFilter={false}
          showPagination={true}
          showPageSize={true}
          SearchPlaceholder="Search group, subgroup or code..."
          tableClass="table align-middle table-hover table-bordered table-striped mb-0"
          theadClass="table-light"
          divClass="product-performance-scroll"
          emptyMessage="No matching product records found."
          containerStyle={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "70vh",
            position: "relative",
            isolation: "isolate",
          }}
          tableStyle={{
            minWidth: "1800px",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        />
      </CardBody>
    </Card>
  );
};

export default Products;
