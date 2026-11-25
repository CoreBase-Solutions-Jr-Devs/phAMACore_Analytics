import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavItem,
  NavLink,
} from "reactstrap";

import TanstackTable from "../../../Components/Common/TanstackTable";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";

const MarginBandTabs = [
  {
    label: "All",
    value: "ALL",
    className: "bg-primary-subtle text-primary",
    activeClass: "bg-primary text-white",
    badgeClass: "bg-primary",
  },
  {
    label: "Below 25%",
    value: "<25%",
    className: "bg-success-subtle text-success",
    activeClass: "bg-success text-white",
    badgeClass: "bg-success",
  },
  {
    label: "25% to 30%",
    value: "25% to 30%",
    className: "bg-info-subtle text-info",
    activeClass: "bg-info text-white",
    badgeClass: "bg-info",
  },
  {
    label: "30% to 45%",
    value: "30% to 45%",
    className: "bg-warning-subtle text-warning",
    activeClass: "bg-warning text-dark",
    badgeClass: "bg-warning",
  },
  {
    label: "Above 45%",
    value: ">45%",
    className: "bg-danger-subtle text-danger",
    activeClass: "bg-danger text-white",
    badgeClass: "bg-danger",
  },
];

const MarginAnalysisTabs = [
  { label: "Drilldown Analysis", value: "drilldown" },
  { label: "SKU Analysis", value: "sku" },
];

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

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("en-KE", {
    maximumFractionDigits: 2,
  });

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "-";

const formatPercentage = (value) => {
  const percentage = value == null || value === "" ? null : Number(value);

  return percentage == null || Number.isNaN(percentage)
    ? "N/A"
    : `${percentage.toFixed(2)}%`;
};

const MarginBadge = ({ value }) => (
  <Badge className={getBadgeColor(value)} pill>
    {formatPercentage(value)}
  </Badge>
);

const Drilldown = ({
  marginDrilldownData = [],
  marginAnalysisSKUData = [],
  loading = false,
  error = null,
  activeBand = "ALL",
  onBandChange = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("drilldown");
const [globalFilter, setGlobalFilter] = useState("");

const drilldownColumns = useMemo(
  () => [
    {
      header: "Margin Band",
      accessorKey: "margin_band",
      meta: { sticky: "period" },
      enableSorting: true,
      cell: ({ getValue }) => (
        <Badge className="bg-primary-subtle text-primary-emphasis">
          {getValue() ?? "-"}
        </Badge>
      ),
    },
    {
      header: "Item",
      accessorKey: "item_name",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="d-flex flex-column">
          <span className="fw-medium">
            {row.original.item_name ?? "-"}
          </span>
          <small className="text-muted">
            {row.original.item_code ?? "-"}
          </small>
        </div>
      ),
    },
    {
      header: "Transaction",
      accessorKey: "transaction_id",
      enableSorting: true,
      cell: ({ getValue }) => getValue() ?? "-",
    },
    {
      header: "Date",
      accessorKey: "transaction_date",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-danger">
          {formatDate(getValue())}
        </span>
      ),
    },
    {
      header: "Quantity",
      accessorKey: "quantity_sold",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className=" text-info">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "SellingPrice(KES)",
      accessorKey: "selling_price_unit",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="fw-medium text-success">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "CostPrice(KES)",
      accessorKey: "cost_price_unit",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="fw-medium text-caramel">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "SalesExcl.Tax(KES)",
      accessorKey: "sales_value_excl",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="fw-medium text-secondary">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "GrossProfit(KES)",
      accessorKey: "gross_profit",
      enableSorting: true,
      cell: ({ getValue }) => {
        const profit = Number(getValue() ?? 0);

        return (
          <span
            className={`fw-medium ${
              profit < 0 ? "text-danger" : "text-success"
            }`}
          >
            {formatAmount(profit)}
          </span>
        );
      },
    },
    {
      header: "GrossMargin(%)",
      accessorKey: "gross_margin_perc",
      enableSorting: true,
      cell: ({ getValue }) => (
        <MarginBadge value={getValue()} />
      ),
    },
    {
      header: "Branch",
      accessorKey: "branch_name",
      enableSorting: true,
      cell: ({ getValue }) => (      
          (getValue() ?? "-").replace(
            /^AXCESS PHARMACY\s*-\s*/i,
            ""
          )     
      )
    },
    {
      header: "Staff",
      accessorKey: "staff_member",
      enableSorting: true,
      cell: ({ getValue }) => (       
          getValue() ?? "-"     
      )
    },
  ],
  [],
);

 
const skuColumns = useMemo(
  () => [
    {
      header: "Item",
      accessorKey: "item_name",
      meta: { sticky: "group" },
      enableSorting: true,
      cell: ({ row }) => (
        <div className="d-flex flex-column">
          <span className="fw-medium">
            {row.original.item_name ?? "-"}
          </span>
          <small className="text-muted">
            {row.original.item_code ?? "-"}
          </small>
        </div>
      ),
    },
    {
      header: "MarginBand",
      accessorKey: "margin_band",
      enableSorting: true,
      cell: ({ getValue }) => (
        <Badge className="bg-primary-subtle text-primary-emphasis">
          {getValue() ?? "-"}
        </Badge>
      ),
    },
    {
      header: "Transactions",
      accessorKey: "transaction_count",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-info">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "UnitsSold",
      accessorKey: "units_sold",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-info">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "SellingPrice(KES)",
      accessorKey: "avg_selling_price",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="fw-medium text-success">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "CostPrice(KES)",
      accessorKey: "avg_cost_price",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="fw-medium text-caramel">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "SalesExcl.Tax(KES)",
      accessorKey: "total_sales_excl",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="fw-medium text-secondary">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "GrossProfit(KES)",
      accessorKey: "total_gross_profit",
      enableSorting: true,
      cell: ({ getValue }) => {
        const profit = Number(getValue() ?? 0);

        return (
          <span
            className={`fw-medium ${
              profit < 0 ? "text-danger" : "text-success"
            }`}
          >
            {formatAmount(profit)}
          </span>
        );
      },
    },
    {
      header: "GrossMargin(%)",
      accessorKey: "gross_margin_perc",
      enableSorting: true,
      cell: ({ getValue }) => (
        <MarginBadge value={getValue()} />
      ),
    },
  ],
  [],
);


  const tableConfig = {
    drilldown: {
      columns: drilldownColumns,
      data: marginDrilldownData,
      placeholder: "Search margin drilldown...",
      emptyMessage: "No matching drill-down records found.",
    },
    sku: {
      columns: skuColumns,
      data: marginAnalysisSKUData,
      placeholder: "Search SKU analysis...",
      emptyMessage: "No matching SKU analysis records found.",
    },
  };

  const currentTable = tableConfig[activeTab];

const filteredData = useMemo(() => {
  const search = globalFilter.trim().toLowerCase();

  return currentTable.data.filter((item) => {
    // First apply the selected margin band.
    const matchesBand =
      activeBand === "ALL" || item.margin_band === activeBand;

    if (!matchesBand) return false;

    // Then apply the search filter.
    if (!search) return true;

    return Object.values(item).some((value) =>
      String(value ?? "").toLowerCase().includes(search)
    );
  });
}, [currentTable.data, activeBand, globalFilter]);

const bandCounts = useMemo(() => {
  const search = globalFilter.trim().toLowerCase();

  const getCount = (band) =>
    currentTable.data.filter((item) => {
      const matchesBand =
        band === "ALL" || item.margin_band === band;

      if (!matchesBand) return false;

      if (!search) return true;

      return Object.values(item).some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      );
    }).length;

  return {
    ALL: getCount("ALL"),
    "<25%": getCount("<25%"),
    "25% to 30%": getCount("25% to 30%"),
    "30% to 45%": getCount("30% to 45%"),
    ">45%": getCount(">45%"),
  };
}, [currentTable.data, globalFilter]);

  const handleExportExcel = () => {
    const rows =
      activeTab === "sku"
        ? filteredData.map((item) => ({
            SKU: item.item_code ?? "",
            Item: item.item_name ?? "",
            "Margin Band": item.margin_band ?? "",
            Transactions: Number(item.transaction_count ?? 0),
            "Units Sold": Number(item.units_sold ?? 0),
            "Avg Cost (KES)": Number(item.avg_cost_price ?? 0),
            "Avg Selling Price (KES)": Number(item.avg_selling_price ?? 0),
            "Sales Excl. Tax (KES)": Number(item.total_sales_excl ?? 0),
            "Gross Profit (KES)": Number(item.total_gross_profit ?? 0),
            "Gross Margin (%)":
              item.gross_margin_perc == null
                ? ""
                : Number(item.gross_margin_perc),
          }))
        : filteredData.map((item) => ({
            SKU: item.item_code ?? "",
            Item: item.item_name ?? "",
            Transaction: item.transaction_id ?? "",
            Date: formatDate(item.transaction_date),
            Quantity: Number(item.quantity_sold ?? 0),
            "Selling Price (KES)": Number(item.selling_price_unit ?? 0),
            "Cost Price (KES)": Number(item.cost_price_unit ?? 0),
            "Sales Excl. Tax (KES)": Number(item.sales_value_excl ?? 0),
            "Gross Profit (KES)": Number(item.gross_profit ?? 0),
            "Margin (%)":
              item.gross_margin_perc == null
                ? ""
                : Number(item.gross_margin_perc),
            "Branch ID": item.branch_id ?? "",
            Branch:
              item.branch_name?.replace(/^AXCESS PHARMACY\s*-\s*/i, "") ?? "",
            Staff: item.staff_member ?? "",
          }));

    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const tabName = activeTab === "sku" ? "SKU_Analysis" : "Drilldown";

    const safeBandName =
      activeBand === "ALL" ? "All" : activeBand.replace(/[^a-zA-Z0-9]+/g, "_");

    exportToExcel(rows, `Margin_${tabName}_${safeBandName}_${today}`);
  };

  const toolbarContent = (
    <div className="d-flex flex-column gap-2">
      <Nav pills className="flex-wrap gap-1">
        {MarginBandTabs.map((band) => {
          const isActive = activeBand === band.value;

          return (
            <NavItem key={band.value}>
              <NavLink
                href="#"
                active={isActive}
                onClick={(event) => {
                  event.preventDefault();
                  onBandChange(band.value);
                }}
                className={`px-2 py-1 ${
                  isActive ? band.activeClass : band.className
                }`}
                style={{
                  cursor: "pointer",
                  fontSize: "11px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                {band.label}
                <Badge
                  className={`ms-1 ${
                    isActive
                      ? "bg-white text-dark"
                      : `${band.badgeClass} text-white`
                  }`}
                >
                  {bandCounts[band.value]}
                </Badge>
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
    </div>
  );

  return (
    <Card id="margin-drilldown-card">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap pb-1 gap-2">
        <div>
          <h5 className="card-title mb-1">
            {activeTab === "sku" ? "Margin SKU Analysis" : "Margin Drilldown"}
          </h5>

          <p className="text-muted mb-0">
            {activeTab === "sku"
              ? "Item-level sales and profitability analysis by gross margin band"
              : "Detailed sales and profitability records by gross margin band"}
          </p>
        </div>

        <CardExportButtons
          targetId="margin-drilldown-card"
          title="Margin Analysis and Drilldown Performance"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody>
        {error && (
          <Alert color="danger" className="mb-3">
            {typeof error === "string"
              ? error
              : error.message || "Failed to load margin analysis data."}
          </Alert>
        )}

        <TanstackTable
          columns={currentTable.columns}
          data={filteredData}
          isGlobalFilter={true}
          isColumnFilter={false}
            globalFilter={globalFilter}
  onGlobalFilterChange={setGlobalFilter}
          customPageSize={10}
          pageSizeOptions={[5, 10, 20, 30]}
          SearchPlaceholder={currentTable.placeholder}
          searchInputWidth="300px"
          tableTabs={
            <UncontrolledDropdown>
              <DropdownToggle
                color="white"
                className="border d-flex align-items-center gap-2 "
              >
                {
                  MarginAnalysisTabs.find((tab) => tab.value === activeTab)
                    ?.label
                }
                <i className="ri-arrow-down-s-line" />
              </DropdownToggle>

              <DropdownMenu>
                {MarginAnalysisTabs.map((tab) => (
                  <DropdownItem
                    key={tab.value}
                    active={activeTab === tab.value}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledDropdown>
          }
          toolbarContent={toolbarContent}
          tableClass="table align-middle table-hover table-bordered table-striped"
          theadClass="table-light"
          loading={loading}
          error={null}
          emptyMessage={currentTable.emptyMessage}
        />
      </CardBody>
    </Card>
  );
};

Drilldown.propTypes = {
  marginDrilldownData: PropTypes.array,
  marginAnalysisSKUData: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  activeBand: PropTypes.string,
  onBandChange: PropTypes.func,
};

export default Drilldown;
