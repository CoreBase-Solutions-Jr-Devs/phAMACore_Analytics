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

const SupplierOrderTabs = [
  {
    label: "SupplierOFRAnalysis",
    value: "supplier",
    className: "bg-primary-subtle text-primary",
    activeClass: "bg-primary text-white",
    badgeClass: "bg-primary",
  },
  {
    label: "OrderDrilldownAnalysis",
    value: "orders",
    className: "bg-success-subtle text-success",
    activeClass: "bg-success text-white",
    badgeClass: "bg-success",
  },
  {
    label: "BranchAnalysis",
    value: "branch",
    className: "bg-warning-subtle text-warning",
    activeClass: "bg-warning text-dark",
    badgeClass: "bg-warning",
  },
];

const SupplierOrderFillRateTable = ({
  SupplierOrderFillRateSupplierOFR = [],
  SupplierOrderFillRateOrderDrilldown = [],
  SupplierOrderFillRateBranch = [],
  loading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState("branch");
const [globalFilter, setGlobalFilter] = useState("");

const tabCounts = useMemo(() => {
  const search = globalFilter.trim().toLowerCase();

  const getCount = (data = []) => {
    if (!search) return data.length;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      )
    ).length;
  };

  return {
    supplier: getCount(SupplierOrderFillRateSupplierOFR),
    orders: getCount(SupplierOrderFillRateOrderDrilldown),
    branch: getCount(SupplierOrderFillRateBranch),
  };
}, [
  SupplierOrderFillRateSupplierOFR,
  SupplierOrderFillRateOrderDrilldown,
  SupplierOrderFillRateBranch,
  globalFilter,
]);

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
 
const supplierColumns = useMemo(
  () => [
    {
      header: "Supplier",
      accessorKey: "supplier_name",
      meta: { sticky: "group" },
      cell: ({ row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold text-dark">
              {row.original.supplier_name || "-"}
            </span>
            <small className="text-muted">
              {row.original.supplier_id || "-"}
            </small>
          </div>,
          row,
          "supplier-name"
        ),
    },
    {
      header: "POsIssued",
      accessorKey: "total_pos_issued",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "supplier-pos-issued"
        ),
    },
     {
      header: "OrderedValue(KES)",
      accessorKey: "total_ordered_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold ">
          {formatAmount(getValue())},
          </span>,
          row,
          "supplier-ordered-value"
        ),
    },
    {
      header: "ReceivedValue(KES)",
      accessorKey: "total_received_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
             <span className="fw-semibold text-caramel">
          {formatAmount(getValue())},
          </span>,
          row,
          "supplier-received-value"
        ),
    },
    {
      header: "OutstandingBal.(KES)",
      accessorKey: "outstanding_balance_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-danger">
            {formatAmount(getValue())}
          </span>,
          row,
          "supplier-outstanding-balance"
        ),
    },
    {
      header: "Fulfilled",
      accessorKey: "fulfilled_pos_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "supplier-fulfilled"
        ),
    },
    {
      header: "Partial",
      accessorKey: "partial_pos_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "supplier-partial"
        ),
    },
    {
      header: "Outstanding",
      accessorKey: "outstanding_pos_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-danger">
            {formatNumber(getValue())}
          </span>,
          row,
          "supplier-outstanding"
        ),
    },
    {
      header: "OrderFill(%)",
      accessorKey: "order_fill_rate_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "supplier-order-fill"
        ),
    },
   
    {
      header: "ValueFill(%)",
      accessorKey: "value_fill_rate_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "supplier-value-fill"
        ),
    },
    {
      header: "AvgDelivery(Days)",
      accessorKey: "avg_delivery_lead_days",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() == null ? "-" : `${formatNumber(getValue())} days`,
          row,
          "supplier-delivery-lead"
        ),
    },
    {
      header: "On-TimeDel.(%)",
      accessorKey: "on_time_delivery_rate_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() == null ? "-" : (
            <Badge className={getBadgeColor(getValue())}>
              {formatPercent(getValue())}
            </Badge>
          ),
          row,
          "supplier-on-time-delivery"
        ),
    },
    {
      header: "AvgOutstanding(Days)",
      accessorKey: "avg_outstanding_days",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          `${formatNumber(getValue())} days`,
          row,
          "supplier-outstanding-days"
        ),
    },
    {
      header: "Performance",
      accessorKey: "supplier_performance_grade",
      cell: ({ getValue, row }) => {
        const grade = getValue();

        return renderInsightCell(
          <Badge color="danger">
            {grade
              ? grade.replace(/_/g, " ")
              : "-"}
          </Badge>,
          row,
          "supplier-performance-grade"
        );
      },
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
    //       "supplier-insight"
    //     ),
    // },
  ],
  []
);

const orderColumns = useMemo(
  () => [
    {
      header: "Supplier",
      accessorKey: "supplier_name",
        meta: {
        sticky: "group",
      },
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold text-dark">
              {getValue() || "-"}
            </span>
            <small className="text-muted">
              {row.original.supplier_id || "-"}
            </small>
          </div>,
          row,
          "order-supplier"
        ),
    },
    {
      header: "PONum",
      accessorKey: "po_number",
    
      cell: ({ getValue, row }) =>
        renderInsightCell(getValue() || "-", row, "order-number"),
    },
    {
      header: "PODate",
      accessorKey: "po_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
            <span className="fw-medium text-success">
  {formatDate(getValue())},
            </span>,   
          row,
          "order-date"
        ),
    },
    {
      header: "ExpectedDel",
      accessorKey: "expected_delivery_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(

     <span className="fw-medium text-danger">
  {formatDate(getValue())},
            </span>,   
          row,
          "order-expected-delivery"
        ),
    },
    {
      header: "Branch",
      accessorKey: "branch_name",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue()?.replace(/^AXCESS PHARMACY\s*-\s*/i, "") || "-",
          row,
          "order-branch"
        ),
    },
    
    {
      header: "POValue(KES)",
      accessorKey: "po_total_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
  {(getValue())}
            </span>,   
          row,
          "order-po-value"
        ),
    },
    {
      header: "InvoiceNo.",
      accessorKey: "invoice_number",
      cell: ({ getValue, row }) =>
        renderInsightCell(
              <span className="fw-medium ">
{getValue() || "-"},
              </span>,
          
          row,
          "order-invoice-number"
        ),
    },
    {
      header: "InvoiceDate",
      accessorKey: "invoice_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-muted">
   {getValue() ? formatDate(getValue()) : "-"}
          </span>,
       
          row,
          "order-invoice-date"
        ),
    },
    {
      header: "InvoiceCapture",
      accessorKey: "invoice_capture_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
               <span className="text-muted">
   { getValue() ? formatDate(getValue()) : "-"}
               </span>,
      
          row,
          "order-invoice-capture"
        ),
    },
    {
      header: "InvoiceValue(KES)",
      accessorKey: "invoice_total_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                         <span className="text-secondary fw-medium">

          {formatAmount(getValue())}
          </span>,
          row,
          "order-invoice-value"
        ),
    },
    {
      header: "ReceivedValue(KES)",
      accessorKey: "cumulative_lpo_received_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
             <span className="text-secondary fw-medium">
  {formatAmount(getValue())}
             </span>,
        
          row,
          "order-received-value"
        ),
    },
    {
      header: "Outstanding(KES)",
      accessorKey: "outstanding_balance_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-danger">
            {formatAmount(getValue())}
          </span>,
          row,
          "order-outstanding-value"
        ),
    },
    {
      header: "FulfillmentStatus",
      accessorKey: "fulfillment_status",
      cell: ({ getValue, row }) => {
        const status = getValue();

        const badgeColor =
          status === "FULFILLED"
            ? "success"
            : status === "PARTIAL"
            ? "warning"
            : "danger";

        return renderInsightCell(
          <Badge color={badgeColor}>
            {status || "-"}
          </Badge>,
          row,
          "order-fulfillment-status"
        );
      },
    },
    {
      header: "DeliveryLead(Days)",
      accessorKey: "delivery_lead_days",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-success">
  {getValue() == null ? "-" : `${formatNumber(getValue())} days`}
          </span>,
        
          row,
          "order-delivery-lead"
        ),
    },
    {
      header: "DaysOpen",
      accessorKey: "days_open",
      cell: ({ getValue, row }) =>
        renderInsightCell(
            <span className="text-warning">
 {getValue() == null ? "-" : `${formatNumber(getValue())} days`}
            </span>,
         
          row,
          "order-days-open"
        ),
    },
    {
      header: "SLADelay(Days)",
      accessorKey: "sla_delay_days",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          `${formatNumber(getValue())} days`,
          row,
          "order-sla-delay"
        ),
    },
    {
      header: "RaisedBy",
      accessorKey: "raised_by",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() || "-",
          row,
          "order-raised-by"
        ),
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

const branchColumns = useMemo(
  () => [
    {
      header: "Branch",
      accessorKey: "branch_name",
      meta: {
        sticky: "group",
      },
      cell: ({ row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold text-dark">
              {row.original.branch_name?.replace(
                /^AXCESS PHARMACY\s*-\s*/i,
                ""
              ) || "-"}
            </span>
            {/* <small className="text-muted">
              {row.original.branch_id ?? "-"}
            </small> */}
          </div>,
          row,
          "branch-name"
        ),
    },
    {
      header: "POsIssued",
      accessorKey: "total_pos_issued",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-success">
      {formatNumber(getValue())}
          </span>,
    
          row,
          "branch-pos-issued"
        ),
    },
    {
      header: "Fulfilled",
      accessorKey: "fulfilled_pos_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                    <span className="text-caramel">

          {formatNumber(getValue())}
          </span>,
          row,
          "branch-fulfilled"
        ),
    },
    {
      header: "Partial",
      accessorKey: "partial_pos_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "branch-partial"
        ),
    },
    {
      header: "Outstanding",
      accessorKey: "outstanding_pos_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-medium text-danger">
            {formatNumber(getValue())}
          </span>,
          row,
          "branch-outstanding"
        ),
    },
    {
      header: "OrderFill(%)",
      accessorKey: "order_fill_rate_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "branch-order-fill"
        ),
    },
    {
      header: "OrderedValue(KES)",
      accessorKey: "total_ordered_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                    <span className="fw-semibold text-info">

          {formatAmount(getValue())}
          </span>,
          row,
          "branch-ordered-value"
        ),
    },
    {
      header: "ReceivedValue(KES)",
      accessorKey: "total_received_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                    <span className="fw-medium text-secondary">

          {formatAmount(getValue())}
          </span>,
          row,
          "branch-received-value"
        ),
    },
    {
      header: "OutstandingBal(KES)",
      accessorKey: "outstanding_balance_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-danger">
            {formatAmount(getValue())}
          </span>,
          row,
          "branch-outstanding-balance"
        ),
    },
    {
      header: "ValueFill(%)",
      accessorKey: "value_fill_rate_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "branch-value-fill"
        ),
    },
    {
      header: "AvgDelivery(Days)",
      accessorKey: "avg_delivery_lead_days",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() == null ? "-" : `${formatNumber(getValue())} days`,
          row,
          "branch-delivery-lead"
        ),
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
    //       "branch-insight"
    //     ),
    // },
  ],
  []
);

  const tableConfig = {
    supplier: {
      columns: supplierColumns,
      data: SupplierOrderFillRateSupplierOFR,
      placeholder: "Search suppliers...",
      emptyMessage: "No supplier fill rate records found.",
    },
    orders: {
      columns: orderColumns,
      data: SupplierOrderFillRateOrderDrilldown,
      placeholder: "Search orders...",
      emptyMessage: "No order drilldown records found.",
    },
    branch: {
      columns: branchColumns,
      data: SupplierOrderFillRateBranch,
      placeholder: "Search branches...",
      emptyMessage: "No branch records found.",
    },
  };

  const currentTable = tableConfig[activeTab];

  const filteredData = useMemo(() => {
  const search = globalFilter.trim().toLowerCase();
  const data = currentTable?.data || [];

  if (!search) return data;

  return data.filter((item) =>
    Object.values(item).some((value) =>
      String(value ?? "").toLowerCase().includes(search)
    )
  );
}, [currentTable?.data, globalFilter]);

  const toolbarContent = (
   <Nav
    pills
    className="nav-tabs-custom flex-wrap gap-1"
    role="tablist"
  >
    {SupplierOrderTabs.map((tab) => {
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
  const rows = (filteredData || []).map((item) => {
   if (activeTab === "supplier") {
  return {
    "Supplier Name": item.supplier_name ?? "-",
    "Supplier ID": item.supplier_id ?? "-",
    "POs Issued": Number(item.total_pos_issued ?? 0),
    "Ordered Value (KES)": Number(item.total_ordered_value_kes ?? 0),
    "Received Value (KES)": Number(item.total_received_value_kes ?? 0),
    "Outstanding Balance (KES)": Number(item.outstanding_balance_kes ?? 0),
    Fulfilled: Number(item.fulfilled_pos_count ?? 0),
    Partial: Number(item.partial_pos_count ?? 0),
    Outstanding: Number(item.outstanding_pos_count ?? 0),
    "Order Fill (%)": Number(item.order_fill_rate_perc ?? 0),
    "Value Fill (%)": Number(item.value_fill_rate_perc ?? 0),
    "Average Delivery (Days)": Number(item.avg_delivery_lead_days ?? 0),
    "On-Time Delivery (%)": Number(item.on_time_delivery_rate_perc ?? 0),
    "Average Outstanding (Days)": Number(item.avg_outstanding_days ?? 0),
    Performance: item.supplier_performance_grade ?? "-",
    "Action Insight": item.action_insight ?? "-",
  };
}

  if (activeTab === "orders") {
  return {
    "Supplier Name": item.supplier_name ?? "-",
    "Supplier ID": item.supplier_id ?? "-",
    "PO Number": item.po_number ?? "-",
    "PO Date": item.po_date ?? "-",
    "Expected Delivery Date": item.expected_delivery_date ?? "-",
    Branch: item.branch_name ?? "-",
    "PO Value (KES)": Number(item.po_total_value_kes ?? 0),
    "Invoice Number": item.invoice_number ?? "-",
    "Invoice Date": item.invoice_date ?? "-",
    "Invoice Capture Date": item.invoice_capture_date ?? "-",
    "Invoice Value (KES)": Number(item.invoice_total_value_kes ?? 0),
    "Received Value (KES)": Number(item.cumulative_lpo_received_kes ?? 0),
    "Outstanding Balance (KES)": Number(item.outstanding_balance_kes ?? 0),
    "Fulfillment Status": item.fulfillment_status ?? "-",
    "Delivery Lead (Days)": Number(item.delivery_lead_days ?? 0),
    "Days Open": Number(item.days_open ?? 0),
    "SLA Delay (Days)": Number(item.sla_delay_days ?? 0),
    "Raised By": item.raised_by ?? "-",
    "Action Insight": item.action_insight ?? "-",
  };
}

   return {
  "Branch Name": item.branch_name?.replace(
    /^AXCESS PHARMACY\s*-\s*/i,
    ""
  ) ?? "-",
  "POs Issued": Number(item.total_pos_issued ?? 0),
  Fulfilled: Number(item.fulfilled_pos_count ?? 0),
  Partial: Number(item.partial_pos_count ?? 0),
  Outstanding: Number(item.outstanding_pos_count ?? 0),
  "Order Fill (%)": Number(item.order_fill_rate_perc ?? 0),
  "Ordered Value (KES)": Number(item.total_ordered_value_kes ?? 0),
  "Received Value (KES)": Number(item.total_received_value_kes ?? 0),
  "Outstanding Balance (KES)": Number(item.outstanding_balance_kes ?? 0),
  "Value Fill (%)": Number(item.value_fill_rate_perc ?? 0),
  "Average Delivery (Days)": Number(item.avg_delivery_lead_days ?? 0),
  "Action Insight": item.action_insight ?? "-",
};
  });

  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  exportToExcel(rows, `Supplier_Order_Fill_Rate_${activeTab}_${todayStr}`);
};

  return (
<Card
  className="card-height-100"
  id="branch-order-fill-rate-card"
>
 <CardHeader className="d-flex justify-content-between align-items-center flex-wrap pb-1 gap-2">
<div>
  <h5 className="card-title mb-1">Supplier Order Performance</h5>
  <p className="text-muted mb-0">
    Track purchase orders issued, status, order and fill rates,
   balances and average delivery lead times across branches.
  </p>
</div>

    <CardExportButtons
      targetId="supplier-order-fill-rate-card"
      title="Supplier Order Fill Rate"
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
  data={filteredData}
  tableTabs={toolbarContent}
  isGlobalFilter={true}
  globalFilter={globalFilter}
  onGlobalFilterChange={setGlobalFilter}
  SearchPlaceholder={currentTable.placeholder}
  customPageSize={10}
  searchInputWidth="450px"
  pageSizeOptions={[5, 10, 20, 30, 50]}
  loading={loading}
  error={error}
  emptyMessage={currentTable.emptyMessage}
/>
      </CardBody>
        </Card>
  );
};

export default SupplierOrderFillRateTable;