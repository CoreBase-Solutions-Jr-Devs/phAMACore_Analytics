import React, { useMemo, useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";


const GROUP_WIDTH = 170;
const SUBGROUP_WIDTH = 200;

// Debounced search input
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <input
      {...props}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
};

// Fuzzy search filter
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const cellValue = String(row.getValue(columnId) ?? "");
  const itemRank = rankItem(cellValue, value);

  addMeta({ itemRank });

  return itemRank.passed;
};

const formatNumber = (value) => {
  const number = Number(value);
  return (
    value == null || value === "" || !Number.isFinite(number) ? 0 : number
  ).toLocaleString("en-KE");
};

const formatAmount = (value) => {
  const number = Number(value);
  return (
    value == null || value === "" || !Number.isFinite(number) ? 0 : number
  ).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Percentage badges using Bootstrap classes
const getPercentageBadge = (value, type = "margin") => {
  const percentage = Number(value ?? 0);

  let badgeClass = "bg-secondary-subtle text-secondary";

  if (!Number.isFinite(percentage)) {
    return <span className="badge bg-secondary-subtle text-secondary">—</span>;
  }

  if (percentage < 0) {
    badgeClass = "bg-danger-subtle text-danger";
  } else if (type === "margin") {
    if (percentage < 25) {
      badgeClass = "bg-warning-subtle text-warning-emphasis";
    } else if (percentage < 45) {
      badgeClass = "bg-success-subtle text-success";
    } else {
      badgeClass = "bg-primary-subtle text-primary";
    }
  } else {
    if (percentage < 10) {
      badgeClass = "bg-warning-subtle text-warning-emphasis";
    } else if (percentage < 25) {
      badgeClass = "bg-info-subtle text-info-emphasis";
    } else {
      badgeClass = "bg-success-subtle text-success";
    }
  }

  return (
    <span
      className={`badge ${badgeClass} px-2 py-1`}
      style={{ fontSize: "0.78rem", fontWeight: 600 }}
    >
      {formatAmount(percentage)}%
    </span>
  );
};

const Products = ({
  selectedBranchName,
  loading,
  error,
  rightClickBtn,
  categoryPerformance,
}) => {
  const [globalFilter, setGlobalFilter] = useState("");

  // Inline sticky styles
  const stickyGroupStyle = {
    position: "sticky",
    left: 0,
    minWidth: `${GROUP_WIDTH}px`,
    width: `${GROUP_WIDTH}px`,
    maxWidth: `${GROUP_WIDTH}px`,
    backgroundColor: "var(--vz-card-bg, #fff)",
    zIndex: 2,
    boxShadow: "2px 0 3px -3px rgba(0,0,0,0.35)",
  };

  const stickySubgroupStyle = {
    position: "sticky",
    left: `${GROUP_WIDTH}px`,
    minWidth: `${SUBGROUP_WIDTH}px`,
    width: `${SUBGROUP_WIDTH}px`,
    maxWidth: `${SUBGROUP_WIDTH}px`,
    backgroundColor: "var(--vz-card-bg, #fff)",
    zIndex: 2,
    boxShadow: "3px 0 5px -4px rgba(0,0,0,0.4)",
  };

  const getStickyStyle = (sticky, isHeader = false) => {
    const baseStyle =
      sticky === "group"
        ? stickyGroupStyle
        : sticky === "subgroup"
          ? stickySubgroupStyle
          : {};

    if (!isHeader || !sticky) return baseStyle;

    return {
      ...baseStyle,
      zIndex: 5,
      backgroundColor: "var(--vz-light, #f3f6f9)",
    };
  };

  const columns = useMemo(
    () => [
      {
        header: "Group",
        accessorKey: "group_name",
        meta: { sticky: "group" },
        cell: ({ getValue }) => (
          <span className="fw-semibold text-primary">{getValue() ?? 0}</span>
        ),
      },
      {
        header: "Subgroup Name",
        accessorKey: "subgroup_name",
        meta: { sticky: "subgroup" },
        cell: ({ getValue }) => (
          <span className="fw-semibold text-body">{getValue() ?? 0}</span>
        ),
      },
      {
        header: "Subgroup Code",
        accessorKey: "subgroup_code",
        cell: ({ getValue }) => (
          <span className="text-muted small">{getValue() ?? 0}</span>
        ),
      },
      {
        header: "Active Items",
        accessorKey: "active_items_count",
        cell: ({ getValue }) => (
          <span className="text-info fw-semibold">
            {formatNumber(getValue() ?? 0)}
          </span>
        ),
      },
      {
        header: "Transactions",
        accessorKey: "transaction_count",
        cell: ({ getValue }) => (
          <span className="text-primary fw-semibold">
            {formatNumber(getValue() ?? 0)}
          </span>
        ),
      },
      {
        header: "Line Items",
        accessorKey: "total_line_items",
        cell: ({ getValue }) => (
          <span className="text-body">{formatNumber(getValue() ?? 0)}</span>
        ),
      },
      {
        header: "Unique Clients",
        accessorKey: "unique_clients",
        cell: ({ getValue }) => (
          <span className="text-success fw-semibold">
            {formatNumber(getValue() ?? 0)}
          </span>
        ),
      },
      {
        header: "Units Sold",
        accessorKey: "total_units_sold",
        cell: ({ getValue }) => (
          <span className="text-info fw-semibold">
            {formatNumber(getValue() ?? 0)}
          </span>
        ),
      },
      {
        header: "Total Sales (Excl.)",
        accessorKey: "total_sales_excl",
        cell: ({ getValue }) => (
          <span className="text-primary fw-semibold">
            {formatAmount(getValue() ?? 0)}
          </span>
        ),
      },
      {
        header: "Tax",
        accessorKey: "total_tax",
        cell: ({ getValue }) => (
          <span className="text-muted">{formatAmount(getValue() ?? 0)}</span>
        ),
      },
      {
        header: "Total Sales (Incl.)",
        accessorKey: "total_sales_incl",
        cell: ({ getValue }) => (
          <span className="text-primary fw-bold">
            {formatAmount(getValue() ?? 0)}
          </span>
        ),
      },
      {
        header: "Total COGS",
        accessorKey: "total_cogs",
        cell: ({ getValue }) => (
          <span className="text-danger">{formatAmount(getValue() ?? 0)}</span>
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
        cell: ({ getValue }) => getPercentageBadge(getValue(), "margin"),
      },
      {
        header: "Avg Order Value",
        accessorKey: "avg_order_value",
        cell: ({ getValue }) => (
          <span className="text-body fw-semibold">
            {formatAmount(getValue() ?? 0)}
          </span>
        ),
      },
      {
        header: "Sales Share (%)",
        accessorKey: "sales_share_perc",
        cell: ({ getValue }) => getPercentageBadge(getValue(), "share"),
      },
      // {
      //   header: "Action",
      //   accessorKey: "action_insight",
      //   cell: ({ getValue }) => (
      //     <div
      //       className="text-body"
      //       style={{ minWidth: "250px", whiteSpace: "normal" }}
      //     >
      //       {getValue() || "—"}
      //     </div>
      //   ),
      // },
    ],
    [],
  );

  const table = useReactTable({
    data: categoryPerformance ?? [],
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    getPageOptions,
    setPageIndex,
    nextPage,
    previousPage,
    getState,
  } = table;

  const { pageIndex, pageSize } = getState().pagination;
  const totalResults = table.getFilteredRowModel().rows.length;

  const startResult = totalResults === 0 ? 0 : pageIndex * pageSize + 1;

  const endResult = Math.min((pageIndex + 1) * pageSize, totalResults);

  const visiblePages = getPageOptions().filter(
    (page) =>
      page >= Math.max(0, pageIndex - 1) &&
      page <= Math.min(getPageOptions().length - 1, pageIndex + 1),
  );
const handleExportExcel = () => {
  // Export all filtered records, not only the current page.
  const rows = table.getFilteredRowModel().rows.map(({ original }) => ({
    Group: original.group_name ?? 0,
    "Subgroup Name": original.subgroup_name ?? 0,
    "Subgroup Code": original.subgroup_code ?? 0,
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

  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  exportToExcel(
    rows,
    `Product_Performance_${todayStr}`
  );
};
  return (
    <Card className="card-animate w-100">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 gap-2">
        <div>
          <h4 className="card-title mb-1">Product Performance</h4>

          <p className="text-muted mb-0">
            Analyze sales, profitability, customer activity, and performance
            across product groups and subgroups.
          </p>
        </div>
        <CardExportButtons
          targetId="branch-target-performance-card"
          title="Branch Sales and Target Performance"
          onExport={handleExportExcel}
        />
      </CardHeader>
      <CardBody className="p-2">
        <Row className="mb-3 align-items-center">
          <Col sm={12} md={6}>
            <div className="search-box">
              <DebouncedInput
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder="Search group, subgroup or code..."
                className="form-control search"
              />
              <i className="ri-search-line search-icon" />
            </div>
          </Col>

          {/* <Col sm={12} md={6} className="text-md-end mt-2 mt-md-0">
            <span className="text-muted">
              {totalResults.toLocaleString()} Results
            </span>
          </Col> */}
        </Row>

        <div
          className="table-responsive"
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "70vh",
            position: "relative",
            isolation: "isolate",
          }}
        >
          <Table
            hover
            bordered
            striped
            className="table align-middle mb-0"
            style={{
              minWidth: "1800px",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead className="table-light">
              {getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sticky = header.column.columnDef.meta?.sticky;

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        className={`text-nowrap ${
                          sticky ? `sticky-${sticky}` : ""
                        }`}
                        style={{
                          ...getStickyStyle(sticky, true),
                          position: sticky ? "sticky" : "sticky",
                          top: 0,
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : "default",
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}

                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted()] ?? null}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Loading product performance...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center text-danger py-4"
                  >
                    Failed to load product performance.
                    {typeof error === "string" ? ` ${error}` : ""}
                  </td>
                </tr>
              ) : getRowModel().rows.length > 0 ? (
                getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const sticky = cell.column.columnDef.meta?.sticky;

                      return (
                        <td
                          key={cell.id}
                          className={sticky ? `sticky-${sticky}` : undefined}
                          style={getStickyStyle(sticky)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          ) ?? "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    No matching product records found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination and rows per page */}
        <Row className="align-items-center mt-3">
          <Col sm={12} lg={4}>
            <div className="text-muted small">
              Showing {startResult} - {endResult} of {totalResults} Results
            </div>
          </Col>

          <Col sm={12} lg={8}>
            <div className="d-flex flex-wrap align-items-center justify-content-lg-end justify-content-center gap-3 mt-2 mt-lg-0">
              <div className="d-flex align-items-center gap-2">
                <label
                  htmlFor="rowsPerPage"
                  className="text-muted small mb-0 text-nowrap"
                >
                  Rows per page:
                </label>

                <select
                  id="rowsPerPage"
                  className="form-select form-select-sm"
                  style={{ width: "80px" }}
                  value={pageSize}
                  onChange={(event) =>
                    table.setPageSize(Number(event.target.value))
                  }
                >
                  {[5, 10, 20, 30].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <ul className="pagination pagination-separated mb-0">
                <li
                  className={`page-item ${
                    !getCanPreviousPage() ? "disabled" : ""
                  }`}
                >
                  <Link
                    to="#"
                    className="page-link text-caramel border-caramel"
                    onClick={(event) => {
                      event.preventDefault();
                      if (getCanPreviousPage()) previousPage();
                    }}
                  >
                    Previous
                  </Link>
                </li>

                {visiblePages.map((page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      pageIndex === page ? "active" : ""
                    }`}
                  >
                    <Link
                      to="#"
                      className={
                        pageIndex === page
                          ? "page-link border border-caramel bg-caramel text-white"
                          : "page-link border border-caramel text-caramel bg-white"
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        setPageIndex(page);
                      }}
                    >
                      {page + 1}
                    </Link>
                  </li>
                ))}

                <li
                  className={`page-item ${!getCanNextPage() ? "disabled" : ""}`}
                >
                  <Link
                    to="#"
                    className="page-link text-caramel border-caramel"
                    onClick={(event) => {
                      event.preventDefault();
                      if (getCanNextPage()) nextPage();
                    }}
                  >
                    Next
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default Products;
