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

const SupplierReturnsTabs = [
  {
    label: "Supplier",
    value: "supplier",
    className: "bg-primary-subtle text-primary",
    activeClass: "bg-primary text-white",
    badgeClass: "bg-primary",
  },
  {
    label: "Drilldown",
    value: "drilldown",
    className: "bg-success-subtle text-success",
    activeClass: "bg-success text-white",
    badgeClass: "bg-success",
  },
  {
    label: "Branch",
    value: "branch",
    className: "bg-warning-subtle text-warning",
    activeClass: "bg-warning text-dark",
    badgeClass: "bg-warning",
  },
  {
    label: "Reason",
    value: "reason",
    className: "bg-info-subtle text-info",
    activeClass: "bg-info text-white",
    badgeClass: "bg-info",
  },
  {
    label: "SKU",
    value: "sku",
    className: "bg-danger-subtle text-danger",
    activeClass: "bg-danger text-white",
    badgeClass: "bg-danger",
  },
];

const SupplierReturnsTable = ({
  SupplierReturnsSupplier,
 SupplierReturnsDrilldown,
 SupplierReturnsBranch,
SupplierReturnsSKU,
SupplierReturnsReason,
  loading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState("branch");

const tabCounts = useMemo(
  () => ({
    supplier: SupplierReturnsSupplier.length,
    drilldown: SupplierReturnsDrilldown.length,
    branch: SupplierReturnsBranch.length,
    reason: SupplierReturnsReason.length,
    sku: SupplierReturnsSKU.length,
  }),
  [
   SupplierReturnsSupplier,
 SupplierReturnsDrilldown,
 SupplierReturnsBranch,
SupplierReturnsSKU,
SupplierReturnsReason,
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
      header: "DebitNotes",
      accessorKey: "debit_notes_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                      <span className="text-secondary fw-medium">
   {formatNumber(getValue())}
          </span>,
          row,
          "supplier-debit-notes"
        ),
    },
    {
      header: "ReturnedLines",
      accessorKey: "returned_line_items",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                    <span className=" fw-medium">
   {formatNumber(getValue())}
          </span>,
          row,
          "supplier-returned-lines"
        ),
    },
    {
      header: "DistinctSKUs",
      accessorKey: "distinct_skus_returned",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                    <span className="text-success fw-medium">
   {formatNumber(getValue())}
          </span>,
          row,
          "supplier-distinct-skus"
        ),
    },
    {
      header: "UnitsReturned",
      accessorKey: "total_units_returned",
      cell: ({ getValue, row }) =>
        renderInsightCell(
               <span className="text-danger fw-medium">
   {formatNumber(getValue())}
          </span>,
        
          row,
          "supplier-units-returned"
        ),
    },
    {
      header: "ReturnValue(KES)",
      accessorKey: "total_return_value_exc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {formatAmount(getValue())}
          </span>,
          row,
          "supplier-return-value"
        ),
    },
    {
      header: "ReturnShare(%)",
      accessorKey: "supplier_return_share_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "supplier-return-share"
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
    //       "supplier-return-insight"
    //     ),
    // },
  ],
  []
);

const drilldownColumns = useMemo(
  () => [
     {
      header: "Supplier",
      accessorKey: "supplier_name",
           meta: { sticky: "group" },
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
          "drilldown--supplier"
        ),
    },
    {
      header: "DebitNote",
      accessorKey: "debit_note_number",
 
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-dark">
            {getValue() || "-"}
          </span>,
          row,
          "drilldown-return-debit-note"
        ),
    },
    {
      header: "ReturnDate",
      accessorKey: "return_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-muted">
{formatDate(getValue())}
          </span>,
          
          row,
          "drilldown-return-date"
        ),
    },
   
    {
      header: "Branch",
      accessorKey: "branch_name",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="font-medium">
{getValue()?.replace(/^AXCESS PHARMACY\s*-\s*/i, "") || "-"}
          </span>,
          
          row,
          "drilldown-branch"
        ),
    },
    {
      header: "Item",
      accessorKey: "item_name",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold text-dark">
              {getValue() || "-"}
            </span>
            <small className="text-muted">
              {row.original.item_code || "-"}
            </small>
          </div>,
          row,
          "drilldown-item"
        ),
    },
    {
      header: "PackSize",
      accessorKey: "pack_size",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-success">
       {formatNumber(getValue())}
          </span>,
   
          row,
          "drilldown-pack-size"
        ),
    },
    {
      header: "QtyReturned",
      accessorKey: "quantity_returned",
      cell: ({ getValue, row }) =>
        renderInsightCell(
            <span className="text-warning">
 {formatNumber(getValue())}
            </span>,
        
          row,
          "drilldown-quantity"
        ),
    },
    {
      header: "Qty(W/P)",
      accessorKey: "quantity_returned_wp",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {getValue() || "-"}
          </span>,
          row,
          "drilldown-quantity-wp"
        ),
    },
    {
      header: "UnitCost(KES)",
      accessorKey: "unit_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatAmount(getValue()),
          row,
          "drilldown-unit-cost"
        ),
    },
    {
      header: "ReturnValue(KES)",
      accessorKey: "return_value_exc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-danger">
            {formatAmount(getValue())}
          </span>,
          row,
          "drilldown-return-value"
        ),
    },
    {
      header: "Reason",
      accessorKey: "return_reason",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() || "-",
          row,
          "drilldown-reason"
        ),
    },
    {
      header: "Staff",
      accessorKey: "staff_member",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() || "-",
          row,
          "drilldown-staff"
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
    //       "return-insight"
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
      meta: { sticky: "group" },
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
      header: "DebitNotes",
      accessorKey: "debit_notes_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-medium text-success">
  {formatNumber(getValue())}
          </span>,
        
          row,
          "branch-debit-notes"
        ),
    },
    {
      header: "ReturnedLines",
      accessorKey: "returned_line_items",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-medium text-danger">
  {formatNumber(getValue())}
          </span>,
        
          row,
          "branch-returned-lines"
        ),
    },
    {
      header: "DistinctSKUs",
      accessorKey: "distinct_skus_returned",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                    <span className="fw-medium text-info">

          {formatNumber(getValue())}
          </span>,
          row,
          "branch-distinct-skus"
        ),
    },
    {
      header: "UnitsReturned",
      accessorKey: "total_units_returned",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "branch-units-returned"
        ),
    },
    {
      header: "ReturnValue(KES)",
      accessorKey: "total_return_value_exc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {formatAmount(getValue())}
          </span>,
          row,
          "branch-return-value"
        ),
    },
    {
      header: "ReturnShare(%)",
      accessorKey: "branch_return_share_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "branch-return-share"
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
    //       "branch-return-insight"
    //     ),
    // },
  ],
  []
);

const reasonColumns = useMemo(
  () => [
    {
      header: "ReturnReason",
      accessorKey: "return_reason",
      meta: { sticky: "group" },
      cell: ({ getValue, row }) =>
        renderInsightCell(
        
            getValue() || "-",
        
          row,
          "reason-return-reason"
        ),
    },
    {
      header: "DebitNotes",
      accessorKey: "debit_notes_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
         
      formatNumber(getValue()),
          
    
          row,
          "reason-debit-notes"
        ),
    },
    {
      header: "ReturnedLines",
      accessorKey: "returned_line_items",
      cell: ({ getValue, row }) =>
        renderInsightCell(
           
formatNumber(getValue()),
       
          
          row,
          "reason-returned-lines"
        ),
    },
    {
      header: "UnitsReturned",
      accessorKey: "total_units_returned",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-danger fw-medium">
   {formatNumber(getValue())}
          </span>,
       
          row,
          "reason-units-returned"
        ),
    },
    {
      header: "ReturnValue(KES)",
      accessorKey: "total_return_value_exc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {formatAmount(getValue())}
          </span>,
          row,
          "reason-return-value"
        ),
    },
    {
      header: "ValueShare(%)",
      accessorKey: "reason_value_share_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "reason-value-share"
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
    //       "reason-insight"
    //     ),
    // },
  ],
  []
);


const skuColumns = useMemo(
  () => [
    {
      header: "Drilldown",
      accessorKey: "item_name",
      meta: { sticky: "group" },
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold text-dark">
              {getValue() || "-"}
            </span>
            <small className="text-muted">
              {row.original.item_code || "-"}
            </small>
          </div>,
          row,
          "sku-drilldown"
        ),
    },
    {
      header: "PackSize",
      accessorKey: "pack_size",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-success fw-medium">
   {formatNumber(getValue())}
          </span>,
       
          row,
          "sku-pack-size"
        ),
    },
    {
      header: "Suppliers",
      accessorKey: "suppliers_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
            <span className=" fw-medium">
   {formatNumber(getValue())}
          </span>,
          row,
          "sku-suppliers"
        ),
    },
    {
      header: "DebitNotes",
      accessorKey: "debit_notes_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
             <span className="text-danger fw-medium">
   {formatNumber(getValue())}
          </span>,
          row,
          "sku-debit-notes"
        ),
    },
    {
      header: "UnitsReturned",
      accessorKey: "total_units_returned",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "sku-units-returned"
        ),
    },
    {
      header: "QtyReturned(W/P)",
      accessorKey: "qty_returned_wp",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {getValue() || "-"}
          </span>,
          row,
          "sku-qty-returned-wp"
        ),
    },
    {
      header: "ReturnValue(KES)",
      accessorKey: "total_return_value_exc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-danger">
            {formatAmount(getValue())}
          </span>,
          row,
          "sku-return-value"
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
    //       "sku-insight"
    //     ),
    // },
  ],
  []
);

 const tableConfig = {
  supplier: {
    columns: supplierColumns,
    data: SupplierReturnsSupplier,
    placeholder: "Search suppliers...",
    emptyMessage: "No supplier return records found.",
  },
  drilldown: {
    columns: drilldownColumns,
    data: SupplierReturnsDrilldown,
    placeholder: "Search debit notes, items...",
    emptyMessage: "No return drilldown records found.",
  },
  branch: {
    columns: branchColumns,
    data: SupplierReturnsBranch,
    placeholder: "Search branches...",
    emptyMessage: "No branch return records found.",
  },
  reason: {
    columns: reasonColumns,
    data: SupplierReturnsReason,
    placeholder: "Search return reasons...",
    emptyMessage: "No return reason records found.",
  },
  sku: {
    columns: skuColumns,
    data: SupplierReturnsSKU,
    placeholder: "Search products or SKUs...",
    emptyMessage: "No SKU return records found.",
  },
};

  const currentTable = tableConfig[activeTab];

 const toolbarContent = (
  <Nav
    pills
    className="nav-tabs-custom flex-wrap gap-1"
    role="tablist"
  >
    {SupplierReturnsTabs.map((tab) => {
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
    if (activeTab === "supplier") {
      return {
        "Supplier ID": item.supplier_id,
        "Supplier Name": item.supplier_name,
        "Debit Notes": item.debit_notes_count,
        "Returned Lines": item.returned_line_items,
        "Distinct SKUs": item.distinct_skus_returned,
        "Units Returned": item.total_units_returned,
        "Return Value (KES)": item.total_return_value_exc,
        "Return Share (%)": item.supplier_return_share_perc,
        "Action Insight": item.action_insight,
      };
    }

    if (activeTab === "drilldown") {
      return {
        "Debit Note Number": item.debit_note_number,
        "Return Date": item.return_date,
        "Supplier ID": item.supplier_id,
        "Supplier Name": item.supplier_name,
        "Branch ID": item.branch_id,
        "Branch Name": item.branch_name,
        "Item Code": item.item_code,
        "Item Name": item.item_name,
        "Pack Size": item.pack_size,
        "Quantity Returned": item.quantity_returned,
        "Quantity Returned (W/P)": item.quantity_returned_wp,
        "Unit Cost": item.unit_cost,
        "Return Value (Excl.)": item.return_value_exc,
        "Return Value (Incl.)": item.return_value_inc,
        "Return Reason": item.return_reason,
        "Staff Member": item.staff_member,
        "Action Insight": item.action_insight,
      };
    }

    if (activeTab === "branch") {
      return {
        "Branch ID": item.branch_id,
        "Branch Name": item.branch_name,
        "Debit Notes": item.debit_notes_count,
        "Returned Lines": item.returned_line_items,
        "Distinct SKUs": item.distinct_skus_returned,
        "Units Returned": item.total_units_returned,
        "Return Value (KES)": item.total_return_value_exc,
        "Return Share (%)": item.branch_return_share_perc,
        "Action Insight": item.action_insight,
      };
    }

    if (activeTab === "reason") {
      return {
        "Return Reason": item.return_reason,
        "Debit Notes": item.debit_notes_count,
        "Returned Lines": item.returned_line_items,
        "Units Returned": item.total_units_returned,
        "Return Value (KES)": item.total_return_value_exc,
        "Value Share (%)": item.reason_value_share_perc,
        "Action Insight": item.action_insight,
      };
    }

    return {
      "Item Code": item.item_code,
      "Item Name": item.item_name,
      "Pack Size": item.pack_size,
      "Suppliers Count": item.suppliers_count,
      "Debit Notes": item.debit_notes_count,
      "Units Returned": item.total_units_returned,
      "Quantity Returned (W/P)": item.qty_returned_wp,
      "Return Value (KES)": item.total_return_value_exc,
      "Action Insight": item.action_insight,
    };
  });

  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  exportToExcel(
    rows,
    `Supplier_Returns_${activeTab}_${todayStr}`
  );
};

  return (
<Card
  className="card-height-100"
  id="branch-order-fill-rate-card"
>
  <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
<div>
  <h4 className="card-title mb-0">Supplier Returns Performance</h4>
<p className="text-muted mb-0">
  Monitor returned items, debit notes and return values across branches.
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
      data={currentTable.data}
      tableTabs={toolbarContent}
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

export default SupplierReturnsTable;