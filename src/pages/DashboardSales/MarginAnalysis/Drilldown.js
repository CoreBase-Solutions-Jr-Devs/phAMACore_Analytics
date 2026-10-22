import React, { Fragment, useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
  Alert,
  CardBody,
  Col,
  Row,
  Table,
} from "reactstrap";
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

// Global Search Input
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
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className={`form-control ${props.className || ""}`}
    />
  );
};

// Margin Drilldown Table
const MarginDrilldownTable = ({ columns, data }) => {
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
  const startResult = totalResults === 0 ? 0 : pageIndex * pageSize + 1;
  const endResult = Math.min((pageIndex + 1) * pageSize, totalResults);

  return (
    <Fragment>
      <Row className="mb-3">
        <Col sm={6}>
          <div className="search-box">
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={setGlobalFilter}
              placeholder="Search SKU,Transaction,Branch or Staff"
            />
            <i className="bx bx-search-alt search-icon" />
          </div>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table hover bordered striped className="table align-middle">
          <thead className="table-light">
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
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
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {getRowModel().rows.length > 0 ? (
              getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
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
                <td colSpan={columns.length} className="text-center py-4">
                  No matching drill-down records found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Row className="align-items-center mt-2 g-3 text-center text-sm-start">
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
                onClick={(event) => {
                  event.preventDefault();
                  previousPage();
                }}
              >
                Previous
              </Link>
            </li>

            {getPageOptions()
              .filter(
                (page) =>
                  page >= Math.max(0, pageIndex - 1) &&
                  page <= Math.min(getPageOptions().length - 1, pageIndex + 1),
              )
              .map((page) => (
                <li className="page-item" key={page}>
                  <Link
                    to="#"
                    className={
                      pageIndex === page ? "page-link active" : "page-link"
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
              className={!getCanNextPage() ? "page-item disabled" : "page-item"}
            >
              <Link
                to="#"
                className="page-link"
                onClick={(event) => {
                  event.preventDefault();
                  nextPage();
                }}
              >
                Next
              </Link>
            </li>
          </ul>
        </Col>
      </Row>
    </Fragment>
  );
};

// Main Modal
const Drilldown = ({
  show,
  onCloseClick,
  data = [],
  marginBand,
  loading = false,
  error = null,
}) => {
  const formatAmount = (value) =>
    Number(value ?? 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-GB") : "-";

  const columns = useMemo(
    () => [
      {
        header: "SKU",
        accessorKey: "item_code",
        cell: ({ getValue }) => getValue() ?? "-",
      },
      {
        header: "Transaction",
        accessorKey: "transaction_id",
        cell: ({ getValue }) => getValue() ?? "-",
      },
      {
        header: "Date",
        accessorKey: "transaction_date",
        cell: ({ getValue }) => formatDate(getValue()),
      },

      // {
      //   header: "Product",
      //   accessorKey: "item_name",
      //   cell: ({ getValue }) => (
      //     <div style={{ minWidth: "250px" }}>
      //       {getValue() ?? "-"}
      //     </div>
      //   ),
      // },
      // {
      //   header: "Qty",
      //   accessorKey: "quantity_sold",
      //   cell: ({ getValue }) => formatAmount(getValue()),
      // },
      {
        header: "Selling Price",
        accessorKey: "selling_price_unit",
        cell: ({ getValue }) => formatAmount(getValue()),
      },
      {
        header: "Cost Price",
        accessorKey: "cost_price_unit",
        cell: ({ getValue }) => formatAmount(getValue()),
      },
      // {
      //   header: "Sales Value",
      //   accessorKey: "sales_value_excl",
      //   cell: ({ getValue }) => formatAmount(getValue()),
      // },
      // {
      //   header: "Gross Profit",
      //   accessorKey: "gross_profit",
      //   cell: ({ getValue }) => {
      //     const value = Number(getValue() ?? 0);

      //     return (
      //       <span
      //         className={
      //           value < 0 ? "text-danger" : "text-success"
      //         }
      //       >
      //         {formatAmount(value)}
      //       </span>
      //     );
      //   },
      // },
      {
        header: "Margin %",
        accessorKey: "gross_margin_perc",
        cell: ({ getValue }) => `${formatAmount(getValue())}%`,
      },
      {
        header: "Branch",
        accessorKey: "branch_name",
        cell: ({ getValue }) => (
          <div style={{ minWidth: "220px" }}>{getValue() ?? "-"}</div>
        ),
      },
      {
        header: "Staff Member",
        accessorKey: "staff_member",
        cell: ({ getValue }) => getValue() ?? "-",
      },
    ],
    [],
  );

  return (
    <Modal isOpen={show} toggle={onCloseClick} centered size="xl" scrollable>
      <ModalHeader toggle={onCloseClick}>
        <div>
          <h5 className="mb-1">Margin Drilldown — {marginBand}</h5>
          <p className="text-muted  mb-0 fs-6">
            Transactions with margin {marginBand}
          </p>
        </div>
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="text-center py-4">
            <Spinner size="sm" /> Loading drill-down records...
          </div>
        ) : error ? (
          <Alert color="danger">Failed to load drill-down records.</Alert>
        ) : data.length > 0 ? (
          <>
            <MarginDrilldownTable columns={columns} data={data} />

            <div className="text-muted mt-2">Total records: {data.length}</div>
          </>
        ) : (
          <div className="text-center text-muted py-4">
            No drill-down records found for this margin band.
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

Drilldown.propTypes = {
  show: PropTypes.bool,
  onCloseClick: PropTypes.func,
  data: PropTypes.array,
  marginBand: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.any,
};

export default Drilldown;
