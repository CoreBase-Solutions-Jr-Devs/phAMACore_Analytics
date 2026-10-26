import React, { Fragment, useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Spinner,
  Alert,
   Badge,
  CardBody,
  Col,
  Row,
  Table,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardHeader,
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
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
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
const MarginDrilldownTable = ({ columns, data,  activeBand = "ALL",
  onBandChange,   globalFilter,  loading = false,
  error = null,
  setGlobalFilter,
}) => {
  // const [globalFilter, setGlobalFilter] = useState("");

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
  setPageSize,
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
    totalResults,
  );

  // Reset pagination when the selected tab or search results change
  useEffect(() => {
    table.setPageIndex(0);
  }, [data, globalFilter]);

  return (
    <Fragment>
      

      <div className="table-responsive">
      
<Table hover bordered striped className="table align-middle">
  <thead className="table-light">
    {getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th
            key={header.id}
            onClick={header.column.getToggleSortingHandler()}
            style={{
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
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
        <td colSpan={columns.length} className="text-center py-4">
          <Spinner size="sm" /> Loading drill-down records...
        </td>
      </tr>
    ) : error ? (
      <tr>
        <td colSpan={columns.length} className="text-center py-4">
          <Alert color="danger" className="mb-0">
            Failed to load drill-down records.
          </Alert>
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
            Showing{" "}
            <span className="fw-semibold">{startResult}</span>
            {" - "}
            <span className="fw-semibold">{endResult}</span>
            {" of "}
            <span className="fw-semibold">{totalResults}</span>
            {" Results"}
          </div>
        </Col>

        {/* Rows per page */}
  <Col sm>
    <div className="d-flex align-items-center justify-content-center gap-2">
      <label
        htmlFor="margin-drilldown-page-size"
        className="text-muted mb-0 text-nowrap"
      >
        Rows per page
      </label>

      <select
        id="margin-drilldown-page-size"
        className="form-select form-select-sm"
        style={{ width: "85px" }}
        value={pageSize}
        onChange={(event) => {
          setPageSize(Number(event.target.value));
          setPageIndex(0);
        }}
      >
        {[5, 10, 20, 30].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  </Col>
<Col sm="auto">
  <ul className="pagination pagination-separated pagination-md justify-content-center mb-0">
    <li
      className={
        !getCanPreviousPage()
          ? "page-item disabled"
          : "page-item"
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

          if (getCanPreviousPage()) {
            previousPage();
          }
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
            Math.min(
              getPageOptions().length - 1,
              pageIndex + 1,
            ),
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
        !getCanNextPage()
          ? "page-item disabled"
          : "page-item"
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

          if (getCanNextPage()) {
            nextPage();
          }
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

const getBadgeColor = (percentage) => {
  if (percentage == null || Number.isNaN(Number(percentage))) {
    return "bg-danger-subtle text-danger";
  }

  if (percentage < 0) {
    return "bg-danger-subtle text-danger";
  }

  if (percentage < 10) {
    return "bg-warning-subtle text-warning-emphasis";
  }

  return "bg-success-subtle text-success";
};

// Main Drilldown Table with Margin Band Tabs
const Drilldown = ({
  data = [],
  loading = false,
  error = null,
  activeBand = "ALL",
  onBandChange = () => {},
}) => {
  // const [activeBand, setActiveBand] = useState("ALL");
const [globalFilter, setGlobalFilter] = useState("");
  const tabs = [
    { label: "All", value: "ALL" },
    { label: "Below 25%", value: "<25%" },
    { label: "25% to 30%", value: "25% to 30%" },
    { label: "30% to 45%", value: "30% to 45%" },
    { label: "Above 45%", value: ">45%" },
  ];

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
  cell: ({ getValue }) => (
    <span className="text-muted small">
      {getValue() ?? "-"}
    </span>
  ),
},
{
  header: "Item",
  accessorKey: "item_name",
  cell: ({ getValue }) => (
    <div style={{ minWidth: "200px", fontWeight: 500 }}>
      {getValue() ?? "-"}
    </div>
  ),
},
{
  header: "Transaction",
  accessorKey: "transaction_id",
  cell: ({ getValue }) => (
    <span className="text-muted">
      {getValue() ?? "-"}
    </span>
  ),
},
{
  header: "Date",
  accessorKey: "transaction_date",
  cell: ({ getValue }) => (
    <span className="text-muted small">
      {formatDate(getValue())}
    </span>
  ),
},
{
  header: "Quantity",
  accessorKey: "quantity_sold",
  cell: ({ getValue }) => (
    <span className="fw-semibold">
      {Number(getValue() ?? 0).toLocaleString("en-KE")}
    </span>
  ),
},
{
  header: "Selling Price",
  accessorKey: "selling_price_unit",
  cell: ({ getValue }) => (
    <span className="fw-semibold">
      {formatAmount(getValue())}
    </span>
  ),
},
{
  header: "Cost Price",
  accessorKey: "cost_price_unit",
  cell: ({ getValue }) => (
    <span className="text-muted">
      {formatAmount(getValue())}
    </span>
  ),
},
{
  header: "Sales Value (Excl.)",
  accessorKey: "sales_value_excl",
  cell: ({ getValue }) => (
    <span style={{ color: "#9a6b35", fontWeight: 600 }}>
      {formatAmount(getValue())}
    </span>
  ),
},
{
  header: "Gross Profit",
  accessorKey: "gross_profit",
  cell: ({ getValue }) => {
    const profit = Number(getValue() ?? 0);

    return (
      <span
        className="fw-semibold"
        style={{
          color: profit < 0 ? "#dc3545" : "#198754",
        }}
      >
        {formatAmount(profit)}
      </span>
    );
  },
},
{
  header: "Margin %",
  accessorKey: "gross_margin_perc",
  cell: ({ getValue }) => {
    const value = getValue();
    const percentage =
      value == null || value === "" ? null : Number(value);

    return (
      <Badge
        className={getBadgeColor(percentage)}
        pill
      >
        {percentage == null || Number.isNaN(percentage)
          ? "N/A"
          : `${percentage.toFixed(1)}%`}
      </Badge>
    );
  },
},
{
  header: "Branch ID",
  accessorKey: "branch_id",
  cell: ({ getValue }) => (
    <span className="text-muted small">
      {getValue() ?? "-"}
    </span>
  ),
},
{
  header: "Branch",
  accessorKey: "branch_name",
  cell: ({ getValue }) => {
    const branchName = getValue() ?? "-";

    return (
      <div style={{ minWidth: "160px", fontWeight: 500 }}>
        {branchName.replace(/^AXCESS PHARMACY\s*-\s*/i, "")}
      </div>
    );
  },
},
{
  header: "Staff",
  accessorKey: "staff_member",
  cell: ({ getValue }) => (
    <span className="text-muted">
      {getValue() ?? "-"}
    </span>
  ),
},

  ],
  [],
);


  // Filter records according to the selected margin band
  const filteredData = useMemo(() => {
    if (activeBand === "ALL") {
      return data;
    }

    return data.filter(
      (item) => item.margin_band === activeBand,
    );
  }, [data, activeBand]);

  const handleExportExcel = () => {
  const rows = filteredData.map((item) => ({
    SKU: item.item_code ?? "",
    Item: item.item_name ?? "",
    Transaction: item.transaction_id ?? "",
    Date: formatDate(item.transaction_date),
    Quantity: Number(item.quantity_sold ?? 0),
    "Selling Price (KES)": Number(item.selling_price_unit ?? 0),
    "Cost Price (KES)": Number(item.cost_price_unit ?? 0),
    "Sales Value Excl. (KES)": Number(item.sales_value_excl ?? 0),
    "Gross Profit (KES)": Number(item.gross_profit ?? 0),
    "Margin (%)":
      item.gross_margin_perc == null
        ? ""
        : Number(item.gross_margin_perc),
    "Branch ID": item.branch_id ?? "",
    Branch: (item.branch_name ?? "").replace(
      /^AXCESS PHARMACY\s*-\s*/i,
      ""
    ),
    Staff: item.staff_member ?? "",
  }));

  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  const safeBandName = activeBand.replace(/[^a-z0-9_-]/gi, "_");

  exportToExcel(
    rows,
    `Margin_Drilldown_${safeBandName}_${todayStr}`
  );
};

  return (
        <Card className="card-animate w-100">
  <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-0">
  <div>
    <h5 className="card-title mb-1">Margin Drilldown</h5>
    <p className="text-muted mb-0">
      Detailed sales and profitability records by gross margin band
    </p>
  </div>

  <div className="ms-auto">
    <CardExportButtons
      targetId="margin-drilldown-card"
      title="Margin Drilldown"
      onExport={handleExportExcel}
    />
  </div>
</CardHeader>
      <CardBody className="pt-1">
    
          <>
         
<Row className="align-items-center justify-content-between g-3 mb-2">
  {/* Search on the left */}
  <Col lg={4} md={5}>
    <div className="search-box">
      <DebouncedInput
        value={globalFilter ?? ""}
        onChange={setGlobalFilter}
        placeholder="Search SKU, Transaction, Branch or Staff"
      />
      <i className="bx bx-search-alt search-icon" />
    </div>
  </Col>

  {/* Margin band buttons on the right */}
  <Col lg={8} md={7} className="d-flex justify-content-md-end">
 <Nav
      tabs
      className="nav-tabs-custom justify-content-md-end flex-wrap"
    >
      {tabs.map((tab) => (
        <NavItem key={tab.value}>
          <NavLink
            href="#"
            active={activeBand === tab.value}
            onClick={(event) => {
              event.preventDefault();
              if (activeBand !== tab.value) {
                onBandChange(tab.value);
              }
            }}
            className="px-2 py-1"
            style={{
              whiteSpace: "nowrap",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            {tab.label}
          </NavLink>
        </NavItem>
      ))}
    </Nav>
  </Col>
</Row>


            <MarginDrilldownTable
              columns={columns}
              data={filteredData}
  globalFilter={globalFilter}
   setGlobalFilter={setGlobalFilter}
     loading={loading}
  error={error}
            />
{/* 
            <div className="text-muted mt-2">
              Total records: {filteredData.length}
            </div> */}
          </>
     
      </CardBody>
    </Card>
  );
};

Drilldown.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  activeBand: PropTypes.string,
  onBandChange: PropTypes.func,
};

export default Drilldown;