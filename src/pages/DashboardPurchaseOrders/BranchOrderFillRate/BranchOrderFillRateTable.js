import React, { useMemo, useState } from "react";
import { Nav, NavItem, NavLink, Card, CardBody, CardHeader, Alert, UncontrolledTooltip, Badge, } from "reactstrap";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import TanstackTable from "../../../Components/Common/TanstackTable";

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString("en-KE");

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatPercent = (value) =>
  `${Number(value ?? 0).toFixed(2)}%`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-GB");
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

const getStatusBadge = (status) => {
  const normalized = String(status || "").toUpperCase();

  const styles = {
    FULFILLED: "bg-success-subtle text-success",
    PARTIAL: "bg-warning-subtle text-warning",
    UNFULFILLED: "bg-danger-subtle text-danger",
    OUTSTANDING: "bg-danger-subtle text-danger",
    OVER_FULFILLED: "bg-info-subtle text-info",
  };

  return (
    <Badge
      className={`${styles[normalized] || "bg-secondary-subtle text-secondary"} px-2 py-1 rounded-pill`}
    >
      {status || "Unknown"}
    </Badge>
  );
};

const BranchOrderTabs = [
  {
    label: "Branch OFR",
    value: "branch",
    className: "bg-primary-subtle text-primary",
    activeClass: "bg-primary text-white",
    badgeClass: "bg-primary",
  },
  {
    label: "Order Drilldown",
    value: "orders",
    className: "bg-success-subtle text-success",
    activeClass: "bg-success text-white",
    badgeClass: "bg-success",
  },
  {
    label: "Top Shortages",
    value: "shortages",
    className: "bg-warning-subtle text-warning",
    activeClass: "bg-warning text-dark",
    badgeClass: "bg-warning",
  },
];

const BranchOrderFillRateTable = ({
  BranchOrderFillRateBranchOFR = [],
  BranchOrderFillRateOrderDrilldown = [],
  BranchOrderFillRateTopShortages = [],
  loading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState("branch");

const tabCounts = useMemo(
  () => ({
    branch: BranchOrderFillRateBranchOFR.length,
    orders: BranchOrderFillRateOrderDrilldown.length,
    shortages: BranchOrderFillRateTopShortages.length,
  }),
  [
    BranchOrderFillRateBranchOFR,
    BranchOrderFillRateOrderDrilldown,
    BranchOrderFillRateTopShortages,
  ]
);

const renderInsightCell = (content, row, prefix) => {
  const tooltipId = `${prefix}-${row.index}`;

  return (
    <>
      <div
        id={tooltipId}
        className="w-100 h-100"
        style={{ cursor: "default" }}
      >
        {content}
      </div>

      <UncontrolledTooltip target={tooltipId} placement="top">
        {row.original.action_insight || "No insight available"}
      </UncontrolledTooltip>
    </>
  );
};
 
// Branch OFR columns
const branchColumns = useMemo(
  () => [
 {
  header: "Branch",
  accessorKey: "branch_name",
  meta: { sticky: "group" },
  cell: ({ row }) =>
    renderInsightCell(
      <div className="d-flex flex-column">
        <span className="fw-semibold text-dark">
          {row.original.branch_name?.replace(
            /^AXCESS PHARMACY\s*-\s*/i,
            ""
          )}
        </span>
        <small className="text-muted">
         
          {row.original.branch_code}
        </small>
      </div>,
      row,
      "branch-name"
    ),
},
    {
      header: "Orders",
      accessorKey: "orders_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "branch-orders"),
    },
    {
      header: "LinesOrd.",
      accessorKey: "lines_ordered_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "branch-lines"),
    },
    {
      header: "Ord.Units",
      accessorKey: "ordered_units",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "branch-ordered-units"),
    },
    {
      header: "Ord.Value(KES)",
      accessorKey: "ordered_value_cost",
    
      cell: ({ getValue, row }) =>
        renderInsightCell
      (formatAmount(getValue()), row, "branch-ordered-value"),
    },
    {
      header: "Disp.Units",
      accessorKey: "dispatched_units",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "branch-dispatched-units"),
    },
    {
      header: "Disp.Value(KES)",
      accessorKey: "dispatched_value_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatAmount(getValue()), row, "branch-dispatched-value"),
    },
    {
      header: "Rcvd.Units",
      accessorKey: "received_units",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "branch-received-units"),
    },
    {
      header: "Rcvd.Value(KES)",
      accessorKey: "received_value_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatAmount(getValue()), row, "branch-received-value"),
    },
    {
      header: "OrderFill%",
      accessorKey: "order_fill_rate_perc",
      cell: ({ getValue, row }) => {
        const percentage = getValue();

        return renderInsightCell(
          <Badge className={getBadgeColor(percentage)}>
            {formatPercent(percentage)}
          </Badge>,
          row,
          "branch-order-fill"
        );
      },
    },
    {
      header: "LineFill%",
      accessorKey: "line_fill_rate_perc",
      cell: ({ getValue, row }) => {
        const percentage = getValue();

        return renderInsightCell(
          <Badge className={getBadgeColor(percentage)}>
            {formatPercent(percentage)}
          </Badge>,
          row,
          "branch-line-fill"
        );
      },
    },
    {
      header: "QtyFill%",
      accessorKey: "quantity_fill_rate_perc",
      cell: ({ getValue, row }) => {
        const percentage = getValue();

        return renderInsightCell(
          <Badge className={getBadgeColor(percentage)}>
            {formatPercent(percentage)}
          </Badge>,
          row,
          "branch-quantity-fill"
        );
      },
    },
{
  header: "Unful.Units",
  accessorKey: "unfulfilled_units",
  cell: ({ getValue, row }) =>
    renderInsightCell(
      <span className="fw-semibold text-danger">
        {formatNumber(getValue())}
      </span>,
      row,
      "branch-unfulfilled-units"
    ),
},
{
  header: "Unful.Value(KES)",
  accessorKey: "unfulfilled_value_cost",
  cell: ({ getValue, row }) =>
    renderInsightCell(
      <span className="fw-semibold text-danger">
        {formatAmount(getValue())}
      </span>,
      row,
      "branch-unfulfilled-value"
    ),
},
    // {
    //   header: "Insight",
    //   accessorKey: "action_insight",
    //   enableSorting: false,
    //   cell: ({ getValue, row }) =>
    //     renderInsightCell(
    //       <span className="text-primary">
    //         <i className="ri-information-line me-1"></i>
    //         View Insight
    //       </span>,
    //       row,
    //       "branch-insight"
    //     ),
    // },
  ],
  []
);

// Order Drilldown columns
const orderColumns = useMemo(
  () => [
    {
      header: "OrderNo.",
      accessorKey: "order_number",
      meta: {
    sticky: "period",
  },
      cell: ({ getValue, row }) =>
        renderInsightCell(getValue(), row, "order-number"),
    },
    {
      header: "OrderDate",
      accessorKey: "order_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatDate(getValue()), row, "order-date"),
    },
    {
      header: "Dest.Branch",
      accessorKey: "dest_branch_name",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue()?.replace(/^AXCESS PHARMACY\s*-\s*/i, ""),
          row,
          "order-dest-branch"
        ),
    },
    {
      header: "SourceBranch",
      accessorKey: "source_branch_name",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue()?.replace(/^AXCESS PHARMACY\s*-\s*/i, ""),
          row,
          "order-source-branch"
        ),
    },
    {
      header: "TransferDoc.",
      accessorKey: "transfer_doc_number",
      cell: ({ getValue, row }) =>
        renderInsightCell(getValue(), row, "order-transfer-doc"),
    },
    {
      header: "TransferDate",
      accessorKey: "transfer_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatDate(getValue()), row, "order-transfer-date"),
    },
    {
      header: "ReceiptDoc.",
      accessorKey: "receipt_doc_number",
      cell: ({ getValue, row }) =>
        renderInsightCell(getValue(), row, "order-receipt-doc"),
    },
    {
      header: "ReceiptDate",
      accessorKey: "receipt_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatDate(getValue()), row, "order-receipt-date"),
    },
    {
      header: "LinesOrd.",
      accessorKey: "lines_ordered",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "order-lines-ordered"),
    },
    {
      header: "LinesFulfilled.",
      accessorKey: "lines_fulfilled",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "order-lines-fulfilled"),
    },
    {
      header: "Ord.Units",
      accessorKey: "ordered_units",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "order-ordered-units"),
    },
    {
      header: "Disp.Units",
      accessorKey: "dispatched_units",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "order-dispatched-units"),
    },
    {
      header: "Rcvd.Units",
      accessorKey: "received_units",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "order-received-units"),
    },
    {
      header: "Ord.Value(KES)",
      accessorKey: "ordered_value_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatAmount(getValue()), row, "order-ordered-value"),
    },
    {
      header: "Disp.Value(KES)",
      accessorKey: "dispatched_value_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatAmount(getValue()), row, "order-dispatched-value"),
    },
    {
      header: "Rcvd.Value(KES)",
      accessorKey: "received_value_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatAmount(getValue()), row, "order-received-value"),
    },
    {
      header: "Unful.Units",
      accessorKey: "unfulfilled_units",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "order-unfulfilled-units"),
    },
    {
      header: "Unful.Value(KES)",
      accessorKey: "unfulfilled_value_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatAmount(getValue()), row, "order-unfulfilled-value"),
    },
    {
      header: "Ful.Status",
      accessorKey: "order_fulfillment_status",
      cell: ({ getValue, row }) =>
        renderInsightCell(getValue(), row, "order-status"),
    },
    {
      header: "Ful.Days",
      accessorKey: "fulfillment_days",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "order-fulfillment-days"),
    },
    // {
    //   header: "Insight",
    //   accessorKey: "action_insight",
    //   enableSorting: false,
    //   cell: ({ row }) =>
    //     renderInsightCell(
    //       <span className="text-primary">
    //         <i className="ri-information-line me-1"></i>
    //         View Insight
    //       </span>,
    //       row,
    //       "order-insight"
    //     ),
    // },
  ],
  []
);

// Top Shortages columns
const shortageColumns = useMemo(
  () => [
    {
    header: "Item",
      accessorKey: "item_name",
           meta: {
    sticky: "group",
  },
    //   cell: ({ getValue, row }) =>
    //     renderInsightCell(getValue(), row, "shortage-code"),
          cell: ({ row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-medium">
              {row.original.item_name}
            </span>
            <small className="text-muted">
              {row.original.item_code}
            </small>
          </div>,
          row,
          "item-name"
        ),
    },
    // {
    //   header: "Item",
    //   accessorKey: "item_name",
    //   cell: ({ getValue, row }) =>
    //     renderInsightCell(getValue(), row, "shortage-item"),
    // },
    {
      header: "OrdersAffected",
      accessorKey: "orders_affected_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "shortage-orders"),
    },
    {
      header: "OrderedUnits",
      accessorKey: "total_units_ordered",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "shortage-ordered-units"),
    },
    {
      header: "Disp.Units",
      accessorKey: "total_units_dispatched",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "shortage-dispatched-units"),
    },
    {
      header: "UnfulfilledUnits",
      accessorKey: "total_unfulfilled_units",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "shortage-unfulfilled-units"),
    },
    {
      header: "UnfulfilledWP",
      accessorKey: "total_unfulfilled_wp",
      cell: ({ getValue, row }) =>
        renderInsightCell(getValue(), row, "shortage-unfulfilled-wp"),
    },
    {
      header: "ShortageValue(KES)",
      accessorKey: "total_shortage_value_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatAmount(getValue()), row, "shortage-value"),
    },
    {
      header: "FulfillmentRate",
      accessorKey: "fulfillment_rate_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatPercent(getValue()), row, "shortage-fill-rate"),
    },
    {
      header: "BranchesAff.Count",
      accessorKey: "affected_branches_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(formatNumber(getValue()), row, "shortage-branch-count"),
    },
    {
      header: "BranchesAff.List",
      accessorKey: "affected_branches_list",
      cell: ({ getValue, row }) =>
        renderInsightCell(getValue(), row, "shortage-branch-list"),
    },
    // {
    //   header: "Insight",
    //   accessorKey: "action_insight",
    //   enableSorting: false,
    //   cell: ({ row }) =>
    //     renderInsightCell(
    //       <span className="text-primary">
    //         <i className="ri-information-line me-1"></i>
    //         View Insight
    //       </span>,
    //       row,
    //       "shortage-insight"
    //     ),
    // },
  ],
  []
);

  const tableConfig = {
    branch: {
      columns: branchColumns,
      data: BranchOrderFillRateBranchOFR,
      placeholder: "Search branches...",
      emptyMessage: "No branch fill rate records found.",
    },
    orders: {
      columns: orderColumns,
      data: BranchOrderFillRateOrderDrilldown,
      placeholder: "Search orders...",
      emptyMessage: "No order drilldown records found.",
    },
    shortages: {
      columns: shortageColumns,
      data: BranchOrderFillRateTopShortages,
      placeholder: "Search shortages...",
      emptyMessage: "No shortage records found.",
    },
  };

  const currentTable = tableConfig[activeTab];

  const toolbarContent = (
   <Nav
    pills
    className="nav-tabs-custom flex-wrap gap-1"
    role="tablist"
  >
    {BranchOrderTabs.map((tab) => {
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
              isActive ? tab.activeClass : tab.className
            }`}
            style={{
              whiteSpace: "nowrap",
              cursor: "pointer",
              fontSize: "11px",
              borderRadius: "6px",
            }}
          >
            {tab.label}

            <Badge
              className={`ms-1 ${
                isActive
                  ? "bg-white text-dark"
                  : `text-white ${tab.badgeClass}`
              }`}
            >
              {tabCounts[tab.value]}
            </Badge>
          </NavLink>
        </NavItem>
      );
    })}
  </Nav>
  );

const handleExportExcel = () => {
  const rows = (currentTable.data || []).map((item) => {
    if (activeTab === "branch") {
      return {
        "Branch Code": item.branch_code,
        "Branch Name": item.branch_name,
        Orders: item.orders_count,
        "Lines Ordered": item.lines_ordered_count,
        "Ordered Units": item.ordered_units,
        "Ordered Value": item.ordered_value_cost,
        "Dispatched Units": item.dispatched_units,
        "Dispatched Value": item.dispatched_value_cost,
        "Received Units": item.received_units,
        "Received Value": item.received_value_cost,
        "Order Fill Rate (%)": item.order_fill_rate_perc,
        "Line Fill Rate (%)": item.line_fill_rate_perc,
        "Quantity Fill Rate (%)": item.quantity_fill_rate_perc,
        "Unfulfilled Units": item.unfulfilled_units,
        "Unfulfilled Value": item.unfulfilled_value_cost,
        "Action Insight": item.action_insight,
      };
    }

    if (activeTab === "orders") {
      return {
        "Order Number": item.order_number,
        "Order Date": item.order_date,
        "Destination Branch": item.dest_branch_name,
        "Source Branch": item.source_branch_name,
        "Transfer Document": item.transfer_doc_number,
        "Transfer Date": item.transfer_date,
        "Receipt Document": item.receipt_doc_number,
        "Receipt Date": item.receipt_date,
        "Lines Ordered": item.lines_ordered,
        "Lines Fulfilled": item.lines_fulfilled,
        "Ordered Units": item.ordered_units,
        "Dispatched Units": item.dispatched_units,
        "Received Units": item.received_units,
        "Ordered Value": item.ordered_value_cost,
        "Dispatched Value": item.dispatched_value_cost,
        "Received Value": item.received_value_cost,
        "Unfulfilled Units": item.unfulfilled_units,
        "Unfulfilled Value": item.unfulfilled_value_cost,
        "Fulfillment Status": item.order_fulfillment_status,
        "Fulfillment Days": item.fulfillment_days,
        "Action Insight": item.action_insight,
      };
    }

    return {
      "Item Code": item.item_code,
      "Item Name": item.item_name,
      "Orders Affected": item.orders_affected_count,
      "Units Ordered": item.total_units_ordered,
      "Units Dispatched": item.total_units_dispatched,
      "Unfulfilled Units": item.total_unfulfilled_units,
      "Unfulfilled WP": item.total_unfulfilled_wp,
      "Shortage Value": item.total_shortage_value_cost,
      "Fulfillment Rate (%)": item.fulfillment_rate_perc,
      "Affected Branches": item.affected_branches_count,
      "Branch Codes": item.affected_branches_list,
      "Action Insight": item.action_insight,
    };
  });

  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  exportToExcel(rows, `Branch_Order_Fill_Rate_${activeTab}_${todayStr}`);
};

  return (
<Card
  className="card-height-100"
  id="branch-order-fill-rate-card"
>
  <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
 <div>
  <h4 className="card-title mb-0">Branch Order Fill Rate</h4>
  <p className="text-muted mb-0">
    Track order, line and quantity fill rates, backorders and the products driving stock shortages.
  </p>
</div>

    <CardExportButtons
      targetId="branch-order-fill-rate-card"
      title="Branch Order Fill Rate"
      onExport={handleExportExcel}
    />
  </CardHeader>

    
          <CardBody>
            {error && (
              <Alert color="danger" className="mb-3">
                {typeof error === "string"
                  ? error
                  : error.message || "Failed to load category spend data."}
              </Alert>
            )}
    <TanstackTable
      columns={currentTable.columns}
      data={currentTable.data}
      toolbarContent={toolbarContent}
      isGlobalFilter={true}
      SearchPlaceholder={currentTable.placeholder}
      customPageSize={10}
      pageSizeOptions={[5, 10, 20, 30, 50]}
      loading={loading}
      error={error}
      emptyMessage={currentTable.emptyMessage}
    />
      </CardBody>
        </Card>
  );
};

export default BranchOrderFillRateTable;