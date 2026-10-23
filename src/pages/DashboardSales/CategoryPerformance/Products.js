
import React, { Fragment, useMemo, useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import { rankItem } from "@tanstack/match-sorter-utils";

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

const Products = ({
  selectedBranchName,
  loading,
  error,
  rightClickBtn,
  categoryPerformance,
}) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const { startDate, endDate } = useSelector(
    (state) => state.powerbi.filters
  );

  // Product performance columns
  const columns = useMemo(
    () => [
      {
        header: "Item Code",
        accessorKey: "item_Code",
      },
      {
        header: "Item Name",
        accessorKey: "item_Name",
      },
      {
        header: "Group",
        accessorKey: "group",
      },
      {
        header: "Sub Group",
        accessorKey: "sub_Group",
      },
      {
        header: "Quantity Sold",
        accessorKey: "quantity_Sold",
        cell: ({ getValue }) =>
          Number(getValue() ?? 0).toLocaleString(),
      },
      {
        header: "Selling Price",
        accessorKey: "selling_Price_Unit",
        cell: ({ getValue }) =>
          Number(getValue() ?? 0).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      },
      {
        header: "Total Sales (Excl.)",
        accessorKey: "totalSalesExcl",
        cell: ({ getValue }) =>
          Number(getValue() ?? 0).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      },
      {
        header: "Cost Price",
        accessorKey: "cost_Price_Unit",
        cell: ({ getValue }) =>
          Number(getValue() ?? 0).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      },
      {
        header: "Gross Profit",
        accessorKey: "gross_Profit",
        cell: ({ getValue }) =>
          Number(getValue() ?? 0).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      },
      {
        header: "Branch",
        accessorKey: "brancch_Name",
      },
      {
        header: "Staff",
        accessorKey: "staff_Name",
      },
      {
        header: "Customer",
        accessorKey: "client_Name",
      },
    ],
    []
  );

  // Configure table
  const table = useReactTable({
    data: categoryPerformance ?? [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
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

  const startResult =
    totalResults === 0 ? 0 : pageIndex * pageSize + 1;

  const endResult = Math.min(
    (pageIndex + 1) * pageSize,
    totalResults
  );

  // Display only nearby page numbers
  const visiblePages = getPageOptions().filter(
    (page) =>
      page >= Math.max(0, pageIndex - 1) &&
      page <= Math.min(getPageOptions().length - 1, pageIndex + 1)
  );

  return (
    <Fragment>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h5 className="card-title mb-0">KEY METRICS</h5>

        <div className="d-flex align-items-center gap-2 ">
          <span>Filtered From:</span>
          <strong>{startDate}</strong> to{" "}
          <strong>{endDate}</strong>
        </div>
           <div className="d-flex align-items-center gap-2 ">
          <span>Selected Branch:</span>
          <strong>{selectedBranchName}</strong>
   
        </div>

        <div className="d-flex align-items-center gap-2 no-print">
          {/* <button
            type="button"
            className="btn btn-soft-success btn-export-excel d-flex align-items-center gap-1"
            onClick={handleExportExcel}
            title="Export Key Metrics to Excel"
          >
            <i className="ri-file-excel-2-line align-bottom"></i>
            <span>Export Excel</span>
          </button> */}

          {/* <button
            type="button"
            className="btn btn-soft-info btn-export-print d-flex align-items-center gap-1"
            onClick={handlePrint}
            title="Print Dashboard"
          >
            <i className="ri-printer-line align-bottom"></i>
            <span>Print</span>
          </button> */}

          <button
            type="button"
            className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
            onClick={rightClickBtn}
          >
            <i className="ri-filter-fill"></i>
            Filter
          </button>
        </div>
      </div>

      <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 ">
          <Row className="mb-3 align-items-center">
            <Col sm={12} md={6}>
              <div className="search-box">
                <DebouncedInput
                  value={globalFilter ?? ""}
                  onChange={setGlobalFilter}
                  placeholder="Search SKU, Product, Branch or Staff"
                  className="form-control search"
                />

                <i className="ri-search-line search-icon" />
              </div>
            </Col>

            <Col sm={12} md={6} className="text-md-end mt-2 mt-md-0">
              <span className="text-muted">
                {totalResults.toLocaleString()} Results
              </span>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table
              hover
              bordered
              striped
              className="table align-middle mb-0"
            >
              <thead className="table-light">
                {getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="text-nowrap"
                        style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}

                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted()] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-4"
                    >
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
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          ) ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-4"
                    >
                      No matching product records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <Row className="align-items-center mt-3">
            <Col sm={12} md={5}>
              <div className="text-muted small">
                Showing {startResult} - {endResult} of {totalResults} Results
              </div>
            </Col>

            <Col sm={12} md={7}>
              <div className="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
                <ul className="pagination pagination-separated mb-0">
                  <li
                    className={`page-item ${
                      !getCanPreviousPage() ? "disabled" : ""
                    }`}
                  >
                    <Link
                      to="#"
                      className="page-link"
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
                        className="page-link"
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
                    className={`page-item ${
                      !getCanNextPage() ? "disabled" : ""
                    }`}
                  >
                    <Link
                      to="#"
                      className="page-link"
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
    </Fragment>
  );
};

export default Products;
