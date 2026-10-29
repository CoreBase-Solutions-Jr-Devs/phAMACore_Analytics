import React, { Fragment, useEffect, useState } from "react";
import { Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";

// Debounced Search Input
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
  }, [debounce, onChange, value]);

  return (
    <input
      {...props}
      value={value ?? ""}
      onChange={(event) => setValue(event.target.value)}
      className={`form-control ${props.className ?? ""}`}
    />
  );
};

// Column Filter
const ColumnFilter = ({ column }) => {
  const columnFilterValue = column.getFilterValue();

  return (
    <DebouncedInput
      type="text"
      value={columnFilterValue ?? ""}
      onChange={(value) => column.setFilterValue(value)}
      placeholder="Filter..."
      className="form-control form-control-sm mt-2"
    />
  );
};

// Reusable TanStack Table
const TanstackTable = ({
  columns = [],
  data = [],
  customHeader = null,
  isGlobalFilter = true,
  isColumnFilter = false,
  customPageSize = 10,
  pageSizeOptions = [5, 10, 20, 30, 50],
  tableClass = "table align-middle table-hover",
  theadClass = "table-light",
  trClass = "",
  thClass = "",
  divClass = "",
  containerStyle = {},
  tableStyle = {},
  searchContainerClass = "mb-3",
  toolbarContent = null,
  searchInputWidth = "100%",
  SearchPlaceholder = "Search...",
  showPagination = true,
  showPageSize = true,
  loading = false,
  error = null,
  emptyMessage = "No records found.",
}) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
  };

  const table = useReactTable({
    columns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    getPageOptions,
    setPageIndex,
    setPageSize,
    previousPage,
    nextPage,
    getState,
  } = table;

  useEffect(() => {
    setPageSize(Number(customPageSize) || 10);
  }, [customPageSize, setPageSize]);

  // Reset to the first page when filters change.
  useEffect(() => {
    setPageIndex(0);
  }, [globalFilter, columnFilters, setPageIndex]);

  const { pageIndex, pageSize } = getState().pagination;
  const totalResults = table.getFilteredRowModel().rows.length;
  const startResult = totalResults === 0 ? 0 : pageIndex * pageSize + 1;
  const endResult = Math.min((pageIndex + 1) * pageSize, totalResults);

  return (
    <Fragment>
      {(isGlobalFilter || toolbarContent) && (
        <Row className={`align-items-center g-3 ${searchContainerClass}`}>
          {isGlobalFilter && (
            <Col xs={12} md={toolbarContent ? 5 : 12}>
              <div className="search-box">
                <DebouncedInput
                  value={globalFilter}
                  onChange={setGlobalFilter}
                  placeholder={SearchPlaceholder}
                  aria-label="Search table"
                  style={{ width: searchInputWidth, maxWidth: "100%" }}
                />
                <i className="bx bx-search-alt search-icon" />
              </div>
            </Col>
          )}

          {toolbarContent && (
            <Col
              xs={12}
              md={isGlobalFilter ? 7 : 12}
              className="d-flex justify-content-md-end flex-wrap"
            >
              {toolbarContent}
            </Col>
          )}
        </Row>
      )}

      <div
        className={`table-responsive ${divClass}`}
        style={{
          overflowX: "auto",
          ...containerStyle,
        }}
      >
        <Table className={tableClass} style={tableStyle}>
          <thead className={theadClass}>
            {customHeader ??
              getHeaderGroups().map((headerGroup) => (
                <tr className={trClass} key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    const sticky = header.column.columnDef.meta?.sticky;

                    const stickyStyle =
                      sticky === "group"
                        ? {
                            left: 0,
                            minWidth: "140px",
                            width: "140px",
                            maxWidth: "140px",
                          }
                        : sticky === "subgroup"
                          ? {
                              left: "140px",
                              minWidth: "150px",
                              width: "150px",
                              maxWidth: "150px",
                            }
                          : {};

                    return (
                      <th
                        key={header.id}
                        className={thClass}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        style={{
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : "default",
                          whiteSpace: "nowrap",
                          position: sticky ? "sticky" : undefined,
                          ...stickyStyle,
                          zIndex: sticky ? 5 : undefined,
                          backgroundColor: sticky
                            ? "var(--vz-light, #f3f6f9)"
                            : undefined,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}

                        {{ asc: " ↑", desc: " ↓" }[sorted] ?? null}

                        {isColumnFilter && header.column.getCanFilter() && (
                          <div onClick={(event) => event.stopPropagation()}>
                            <ColumnFilter column={header.column} />
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="text-center py-4"
                >
                  Loading records...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="text-center text-danger py-4"
                >
                  Failed to load records.
                </td>
              </tr>
            ) : getRowModel().rows.length > 0 ? (
              getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cell.column.columnDef.meta?.tdClassName ?? ""}
                      style={{
                        ...cell.column.columnDef.meta?.tdStyle,
                        ...(cell.column.columnDef.meta?.sticky
                          ? {
                              position: "sticky",
                              left:
                                cell.column.columnDef.meta.sticky === "group"
                                  ? 0
                                  : "170px",
                              zIndex: 2,
                              backgroundColor: "var(--vz-card-bg, #fff)",
                              boxShadow: "2px 0 3px -3px rgba(0,0,0,0.35)",
                            }
                          : {}),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="text-center py-4"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Row className="align-items-center mt-3 g-3">
        <Col sm>
          <div className="text-muted">
            Showing <span className="fw-semibold">{startResult}</span>
            {" - "}
            <span className="fw-semibold">{endResult}</span>
            {" of "}
            <span className="fw-semibold">{totalResults}</span>
            {" Results"}
          </div>
        </Col>

        {showPageSize && (
          <Col sm="auto">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <label
                htmlFor="tanstack-page-size"
                className="text-muted mb-0 text-nowrap"
              >
                Rows per page
              </label>

              <select
                id="tanstack-page-size"
                className="form-select form-select-sm"
                style={{ width: "85px" }}
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </Col>
        )}

        {showPagination && (
          <Col sm="auto">
            <ul className="pagination pagination-separated pagination-md justify-content-center mb-0">
              <li
                className={
                  !getCanPreviousPage() ? "page-item disabled" : "page-item"
                }
              >
                <Link
                  to="#"
                  className="page-link"
                  style={{
                    color: getCanPreviousPage() ? "#c68e54" : undefined,
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    if (getCanPreviousPage()) previousPage();
                  }}
                >
                  Previous
                </Link>
              </li>

              {getPageOptions()
                .filter(
                  (page) =>
                    page >= Math.max(0, pageIndex - 1) &&
                    page <=
                      Math.min(getPageOptions().length - 1, pageIndex + 1),
                )
                .map((page) => {
                  const isActive = pageIndex === page;

                  return (
                    <li className="page-item" key={page}>
                      <Link
                        to="#"
                        className={isActive ? "page-link active" : "page-link"}
                        style={
                          isActive
                            ? {
                                backgroundColor: "#c68e54",
                                borderColor: "#c68e54",
                                color: "#ffffff",
                              }
                            : {
                                color: "#c68e54",
                              }
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          setPageIndex(page);
                        }}
                      >
                        {page + 1}
                      </Link>
                    </li>
                  );
                })}

              <li
                className={
                  !getCanNextPage() ? "page-item disabled" : "page-item"
                }
              >
                <Link
                  to="#"
                  className="page-link"
                  style={{
                    color: getCanNextPage() ? "#c68e54" : undefined,
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    if (getCanNextPage()) nextPage();
                  }}
                >
                  Next
                </Link>
              </li>
            </ul>
          </Col>
        )}
      </Row>
    </Fragment>
  );
};

export default TanstackTable;
