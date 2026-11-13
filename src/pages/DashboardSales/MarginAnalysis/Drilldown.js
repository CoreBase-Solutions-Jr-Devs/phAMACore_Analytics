import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Nav,
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
  { label: "Drilldown", value: "drilldown" },
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
  const percentage =
    value == null || value === "" ? null : Number(value);

  return percentage == null || Number.isNaN(percentage)
    ? "N/A"
    : `${percentage.toFixed(2)}%`;
};

const MarginBadge = ({ value }) => (
  <Badge className={getBadgeColor(value)} pill>
    {formatPercentage(value)}
  </Badge>
);

// ------------------------------------------------------------
// DRILLDOWN COLUMNS
// ------------------------------------------------------------

const Drilldown = ({
  marginDrilldownData = [],
  marginAnalysisSKUData = [],
  loading = false,
  error = null,
  activeBand = "ALL",
  onBandChange = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("drilldown");

  const drilldownColumns = useMemo(
    () => [
        {
        header: "Item",
        accessorKey: "item_name",
         enableSorting: true,
         meta: { sticky: "group" },
        cell: ({ getValue }) => (
          <div className=" fw-medium">
            {getValue() ?? "-"}
          </div>
        ),
      },
      {
        header: "SKU",
        accessorKey: "item_code",
         enableSorting: true,
        // meta: { sticky: "sub-group" },
        cell: ({ getValue }) => (
          <div className="fw-medium">{getValue() ?? "-"}</div>
        ),
      },
    
      {
        header: "Transaction",
        accessorKey: "transaction_id",
         enableSorting: true,
        cell: ({ getValue }) => (
       getValue() ?? "-"
        ),
      },
      {
        header: "Date",
        accessorKey: "transaction_date",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-muted ">
            {formatDate(getValue())}
          </span>
        ),
      },
      {
        header: "Quantity",
        accessorKey: "quantity_sold",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="fw-medium text-caramel">
            {formatAmount(getValue())}
          </span>
        ),
      },
      {
        header: "SellingPrice(KES)",
        accessorKey: "selling_price_unit",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="fw-medium text-success">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "CostPrice(KES)",
        accessorKey: "cost_price_unit",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="fw-semibold text-info">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "SalesExcl.Tax(KES)",
        accessorKey: "sales_value_excl",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="fw-semibold">{formatAmount(getValue())}</span>
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
              className={`fw-semibold ${
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
        cell: ({ getValue }) => <MarginBadge value={getValue()} />,
      },
      {
        header: "BranchID",
        accessorKey: "branch_id",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-muted small">{getValue() ?? "-"}</span>
        ),
      },
      {
        header: "Branch",
        accessorKey: "branch_name",
         enableSorting: true,
        cell: ({ getValue }) => (
          <div style={{ minWidth: "160px", fontWeight: 500 }}>
            {(getValue() ?? "-").replace(
              /^AXCESS PHARMACY\s*-\s*/i,
              ""
            )}
          </div>
        ),
      },
      {
        header: "Staff",
        accessorKey: "staff_member",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-muted">{getValue() ?? "-"}</span>
        ),
      },
    ],
    []
  );

  // ------------------------------------------------------------
  // SKU ANALYSIS COLUMNS
  // ------------------------------------------------------------

  const skuColumns = useMemo(
    () => [
          {
        header: "Item",
        accessorKey: "item_name",
         meta: { sticky: "group" },
          enableSorting: true,
        cell: ({ getValue }) => (
          <div className=" fw-medium">
            {getValue() ?? "-"}
          </div>
        ),
      },
      {
        header: "SKU",
        accessorKey: "item_code",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span >{getValue() ?? "-"}</span>
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
          <span className="fw-medium ">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "UnitsSold",
        accessorKey: "units_sold",
         enableSorting: true,
        cell: ({ getValue }) => (
          formatAmount(getValue())
        ),
      },
      {
        header: "AvgCost(KES)",
        accessorKey: "avg_cost_price",
         enableSorting: true,
        cell: ({ getValue }) => (
         <span className="fw-semibold text-warning">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "AvgSellingPrice(KES)",
        accessorKey: "avg_selling_price",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="fw-semibold text-secondary">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "SalesExcl.Tax(KES)",
        accessorKey: "total_sales_excl",
         enableSorting: true,
        cell: ({ getValue }) => (
          <span className="fw-semibold text-caramel">{formatAmount(getValue())}</span>
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
              className={`fw-semibold ${
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
        cell: ({ getValue }) => <MarginBadge value={getValue()} />,
      },
    ],
    []
  );

  // ------------------------------------------------------------
  // TABLE CONFIGURATION - SUPPLIER RETURNS STYLE
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // FILTER DATA BY MARGIN BAND
  // ------------------------------------------------------------

  const filteredData = useMemo(() => {
    if (activeBand === "ALL") {
      return currentTable.data;
    }

    return currentTable.data.filter(
      (item) => item.margin_band === activeBand
    );
  }, [currentTable.data, activeBand]);

  // ------------------------------------------------------------
  // MARGIN BAND COUNTS
  // ------------------------------------------------------------

  const bandCounts = useMemo(
    () => ({
      ALL: currentTable.data.length,
      "<25%": currentTable.data.filter(
        (item) => item.margin_band === "<25%"
      ).length,
      "25% to 30%": currentTable.data.filter(
        (item) => item.margin_band === "25% to 30%"
      ).length,
      "30% to 45%": currentTable.data.filter(
        (item) => item.margin_band === "30% to 45%"
      ).length,
      ">45%": currentTable.data.filter(
        (item) => item.margin_band === ">45%"
      ).length,
    }),
    [currentTable.data]
  );

  // ------------------------------------------------------------
  // TABLE TAB COUNTS
  // ------------------------------------------------------------

  const tableTabCounts = {
    drilldown: marginDrilldownData.length,
    sku: marginAnalysisSKUData.length,
  };

  // ------------------------------------------------------------
  // EXCEL EXPORT
  // ------------------------------------------------------------

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
            "Avg Selling Price (KES)": Number(
              item.avg_selling_price ?? 0
            ),
            "Sales Excl. Tax (KES)": Number(
              item.total_sales_excl ?? 0
            ),
            "Gross Profit (KES)": Number(
              item.total_gross_profit ?? 0
            ),
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
            "Selling Price (KES)": Number(
              item.selling_price_unit ?? 0
            ),
            "Cost Price (KES)": Number(
              item.cost_price_unit ?? 0
            ),
            "Sales Excl. Tax (KES)": Number(
              item.sales_value_excl ?? 0
            ),
            "Gross Profit (KES)": Number(item.gross_profit ?? 0),
            "Margin (%)":
              item.gross_margin_perc == null
                ? ""
                : Number(item.gross_margin_perc),
            "Branch ID": item.branch_id ?? "",
            Branch:
              item.branch_name?.replace(
                /^AXCESS PHARMACY\s*-\s*/i,
                ""
              ) ?? "",
            Staff: item.staff_member ?? "",
          }));

    const today = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    const tabName =
      activeTab === "sku" ? "SKU_Analysis" : "Drilldown";

    const safeBandName =
      activeBand === "ALL"
        ? "All"
        : activeBand.replace(/[^a-zA-Z0-9]+/g, "_");

    exportToExcel(
      rows,
      `Margin_${tabName}_${safeBandName}_${today}`
    );
  };

  // ------------------------------------------------------------
  // TOOLBAR CONTENT
  // ------------------------------------------------------------

 
const toolbarContent = (
  <div className="d-flex flex-column gap-2 w-100">
    {/* MARGIN BAND FILTERS BELOW SEARCH */}
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
    isActive ? "bg-white text-dark" : `${band.badgeClass} text-white`
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


  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <Card id="margin-drilldown-card">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
        <div>
          <h5 className="card-title mb-1">
            {activeTab === "sku"
              ? "Margin SKU Analysis"
              : "Margin Drilldown"}
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
              : error.message ||
                "Failed to load margin analysis data."}
          </Alert>
        )}

        <TanstackTable
          columns={currentTable.columns}
          data={filteredData}
          isGlobalFilter={true}
          isColumnFilter={false}
          customPageSize={10}
          pageSizeOptions={[5, 10, 20, 30]}
          SearchPlaceholder={currentTable.placeholder}
          
tableTabs={
  <Nav pills className="flex-wrap gap-1">
    {MarginAnalysisTabs.map((tab) => {
      const isActive = activeTab === tab.value;

      return (
        <NavItem key={tab.value}>
          <NavLink
            href="#"
            active={isActive}
            onClick={(event) => {
              event.preventDefault();
              setActiveTab(tab.value);
            }}
            className={`px-2 py-1 ${
              isActive
            ? "bg-primary-subtle text-primary-emphasis border border-primary-subtle"
                          : "bg-light text-dark"
            }`}
            style={{
              cursor: "pointer",
              fontSize: "13px",
              borderRadius: "6px",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
            <Badge
              color={isActive ? "primary" : "white"}
                        className={
                          isActive ? "text-white ms-1" : "text-dark ms-1"
                        }
            >
              {tableTabCounts[tab.value]}
            </Badge>
          </NavLink>
        </NavItem>
      );
    })}
  </Nav>
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
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  activeBand: PropTypes.string,
  onBandChange: PropTypes.func,
};

export default Drilldown;