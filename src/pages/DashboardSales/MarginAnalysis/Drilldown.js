import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";

import TanstackTable from "../../../Components/Common/TanstackTable";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";

// Keep your existing DebouncedInput, formatAmount, formatDate,
// and getBadgeColor implementations if they are defined in this file.

const MarginBandTabs = [
  { label: "All", value: "ALL" },
  { label: "Below 25%", value: "<25%" },
  { label: "25% to 30%", value: "25% to 30%" },
  { label: "30% to 45%", value: "30% to 45%" },
  { label: "Above 45%", value: ">45%" },
];

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

const Drilldown = ({
  data = [],
  loading = true,
  error = true,
  activeBand = "ALL",
  onBandChange = () => {},
}) => {
  const formatAmount = (value) => Number(value ?? 0).toLocaleString("en-KE");

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-GB") : "-";
  // const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      {
        header: "SKU",
        accessorKey: "item_code",
        cell: ({ getValue }) => (
          <span className="text-muted small">{getValue() ?? "-"}</span>
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
          <span className="text-muted">{getValue() ?? "-"}</span>
        ),
      },
      {
        header: "Date",
        accessorKey: "transaction_date",
        cell: ({ getValue }) => (
          <span className="text-muted small">{formatDate(getValue())}</span>
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
        header: "Selling Price(KES)",
        accessorKey: "selling_price_unit",
        cell: ({ getValue }) => (
          <span className="fw-semibold">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "Cost Price(KES)",
        accessorKey: "cost_price_unit",
        cell: ({ getValue }) => (
          <span className="text-muted">{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "Sales Excl. Tax(KES)",
        accessorKey: "sales_value_excl",
        cell: ({ getValue }) => (
          <span style={{ fontWeight: 600 }}>{formatAmount(getValue())}</span>
        ),
      },
      {
        header: "Gross Profit(KES)",
        accessorKey: "gross_profit",
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
        header: "Margin %",
        accessorKey: "gross_margin_perc",
        cell: ({ getValue }) => {
          const value = getValue();
          const percentage =
            value == null || value === "" ? null : Number(value);

          return (
            <Badge className={getBadgeColor(percentage)} pill>
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
          <span className="text-muted small">{getValue() ?? "-"}</span>
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
          <span className="text-muted">{getValue() ?? "-"}</span>
        ),
      },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    if (activeBand === "ALL") return data;

    return data.filter((item) => item.margin_band === activeBand);
  }, [data, activeBand]);

  const handleExportExcel = () => {
    const rows = filteredData.map((item) => ({
      SKU: item.item_code ?? "",
      Item: item.item_name ?? "",
      Transaction: item.transaction_id ?? "",
      Date: item.transaction_date ? formatDate(item.transaction_date) : "",
      Quantity: Number(item.quantity_sold ?? 0),
      "Selling Price (KES)": Number(item.selling_price_unit ?? 0),
      "Cost Price (KES)": Number(item.cost_price_unit ?? 0),
      "Sales Excl. Tax (KES)": Number(item.sales_value_excl ?? 0),
      "Gross Profit (KES)": Number(item.gross_profit ?? 0),
      "Margin (%)":
        item.gross_margin_perc == null ? "" : Number(item.gross_margin_perc),
      "Branch ID": item.branch_id ?? "",
      Branch: item.branch_name?.replace(/^AXCESS PHARMACY\s*-\s*/i, "") ?? "",
      Staff: item.staff_member ?? "",
    }));

    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const safeBandName =
      activeBand === "ALL" ? "All" : activeBand.replace(/[^a-zA-Z0-9]+/g, "_");

    exportToExcel(rows, `Margin_Drilldown_${safeBandName}_${today}`);
  };

  const bandCounts = useMemo(
    () => ({
      ALL: data.length,
      "<25%": data.filter((item) => item.margin_band === "<25%").length,
      "25% to 30%": data.filter((item) => item.margin_band === "25% to 30%")
        .length,
      "30% to 45%": data.filter((item) => item.margin_band === "30% to 45%")
        .length,
      ">45%": data.filter((item) => item.margin_band === ">45%").length,
    }),
    [data],
  );
  return (
    <Card id="margin-drilldown-card">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
        <div>
          <h5 className="card-title mb-1">Margin Drilldown</h5>
          <p className="text-muted mb-0">
            Detailed sales and profitability records by gross margin band
          </p>
        </div>

        <CardExportButtons
          targetId="margin-drilldown-card"
          title="margin-Sales-Band and drilldown Performance"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody>
        {error && (
          <Alert color="danger" className="mb-3">
            {typeof error === "string"
              ? error
              : error.message || "Failed to load margin drilldown data."}
          </Alert>
        )}

        <TanstackTable
          columns={columns}
          data={filteredData}
          isGlobalFilter={true}
          isColumnFilter={false}
          customPageSize={10}
          pageSizeOptions={[5, 10, 20, 30]}
          SearchPlaceholder="Search margin drilldown..."
          toolbarContent={
            <Nav
              pills
              className="nav-tabs-custom flex-wrap gap-1"
              role="tablist"
            >
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
                        isActive
                          ? "bg-primary-subtle text-primary-emphasis border border-primary-subtle"
                          : "bg-light text-dark"
                      }`}
                      style={{
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        fontSize: "13px",
                        borderRadius: "6px",
                      }}
                    >
                      {band.label}
                      <Badge
                        color={isActive ? "primary" : "white"}
                        className={
                          isActive ? "text-white ms-1" : "text-dark ms-1"
                        }
                      >
                        {bandCounts[band.value]}
                      </Badge>
                    </NavLink>
                  </NavItem>
                );
              })}
            </Nav>
          }
          tableClass="table align-middle table-hover table-bordered table-striped"
          theadClass="table-light"
          loading={loading}
          error={null}
          emptyMessage="No matching drill-down records found."
        />
      </CardBody>
    </Card>
  );
};

Drilldown.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  activeBand: PropTypes.string,
  onBandChange: PropTypes.func,
};

export default Drilldown;
