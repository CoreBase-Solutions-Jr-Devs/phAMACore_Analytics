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

const getLPOStatusBadge = (status) => {
  const normalized = String(status || "").toUpperCase();

  const styles = {
    PROPOSED: "bg-warning-subtle text-warning",
    APPROVED: "bg-success-subtle text-success",
  };

  return (
    <Badge
      className={`${styles[normalized] || "bg-secondary-subtle text-secondary"} px-2 py-1 rounded-pill`}
    >
      {status || "-"}
    </Badge>
  );
};
const getABCClassBadge = (abcClass) => {
  const normalized = String(abcClass || "").toUpperCase();

  const styles = {
    A: "bg-success-subtle text-success",
    B: "bg-warning-subtle text-warning",
    C: "bg-danger-subtle text-danger",
  };

  return (
    <Badge
      className={`${styles[normalized] || "bg-secondary-subtle text-secondary"} px-2 py-1 rounded-pill`}
    >
      {abcClass || "-"}
    </Badge>
  );
};

const ConsolidatedLPOReviewTabs = [
  {
    label: "LPO Summary",
    value: "ConsolidatedList",
    className: "bg-primary-subtle text-primary",
    activeClass: "bg-primary text-white",
    badgeClass: "bg-primary",
  },
  {
    label: "Supplier",
    value: "supplier",
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
    label: "Item Drilldown",
    value: "drilldown",
    className: "bg-info-subtle text-info",
    activeClass: "bg-info text-white",
    badgeClass: "bg-info",
  },
];

const ConsolidatedLPOReviewTable = ({
  ConsolidatedLPOReviewConsolidatedList,
 ConsolidatedLPOReviewDrilldown,
 ConsolidatedLPOReviewBranch,
ConsolidatedLPOReviewSupplier,
// SupplierReturnsReason,
  loading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState("branch");

const tabCounts = useMemo(
  () => ({
    supplier: ConsolidatedLPOReviewSupplier.length,
    drilldown: ConsolidatedLPOReviewDrilldown.length,
    branch: ConsolidatedLPOReviewBranch.length,
    ConsolidatedList: ConsolidatedLPOReviewConsolidatedList.length,
    // sku: SupplierReturnsSKU.length,
  }),
  [
   ConsolidatedLPOReviewSupplier,
//  SupplierReturnsDrilldown,
 ConsolidatedLPOReviewDrilldown,
ConsolidatedLPOReviewBranch,
ConsolidatedLPOReviewConsolidatedList,
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
      header: "LPOs",
      accessorKey: "lpo_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "supplier-lpo-count"
        ),
    },
    {
      header: "Unique SKUs",
      accessorKey: "unique_skus_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "supplier-unique-skus"
        ),
    },
    {
      header: "Total Value (KES)",
      accessorKey: "total_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {formatAmount(getValue())}
          </span>,
          row,
          "supplier-total-value"
        ),
    },
    {
      header: "Class A SKUs",
      accessorKey: "class_a_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "supplier-class-a-skus"
        ),
    },
    {
      header: "Class A Value (KES)",
      accessorKey: "class_a_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
            <span className="fw-medium text-success">
  {formatAmount(getValue())}
            </span>,
        
          row,
          "supplier-class-a-value"
        ),
    },
    {
      header: "Class B SKUs",
      accessorKey: "class_b_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "supplier-class-b-skus"
        ),
    },
    {
      header: "Class B Value (KES)",
      accessorKey: "class_b_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                 <span className="fw-medium text-info">
  {formatAmount(getValue())}
            </span>,
          row,
          "supplier-class-b-value"
        ),
    },
    {
      header: "Class C SKUs",
      accessorKey: "class_c_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "supplier-class-c-skus"
        ),
    },
    {
      header: "Class C Value (KES)",
      accessorKey: "class_c_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
               <span className="fw-medium text-danger">
  {formatAmount(getValue())}
            </span>,
          row,
          "supplier-class-c-value"
        ),
    },
    {
      header: "Class C Share (%)",
      accessorKey: "class_c_value_share_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "supplier-class-c-share"
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
    //       "supplier-lpo-insight"
    //     ),
    // },
  ],
  []
);

const drilldownColumns = useMemo(
  () => [
        {
      header: "Item",
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
          "drilldown-item"
        ),
    },
    {
      header: "LPO",
      accessorKey: "lpo_number",
  
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-dark">
            {getValue() || "-"}
          </span>,
          row,
          "drilldown-lpo-number"
        ),
    },
    {
      header: "LPODate",
      accessorKey: "lpo_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatDate(getValue()),
          row,
          "drilldown-lpo-date"
        ),
    },
    {
      header: "Supplier",
      accessorKey: "supplier_name",
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
          "drilldown-supplier"
        ),
    },
    {
      header: "Branch",
      accessorKey: "branch_name",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue()?.replace(/^AXCESS PHARMACY\s*-\s*/i, "") || "-",
          row,
          "drilldown-branch"
        ),
    },

    {
      header: "PackSize",
      accessorKey: "pack_size",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "drilldown-pack-size"
        ),
    },
    {
      header: "PackQty",
      accessorKey: "pack_quantity",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "drilldown-pack-quantity"
        ),
    },
    {
      header: "PieceQty",
      accessorKey: "piece_quantity",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "drilldown-piece-quantity"
        ),
    },
    {
      header: "OrderedQty(W/P)",
      accessorKey: "ordered_qty_wp",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-medium text-danger">
            {getValue() || "-"}
          </span>,
          row,
          "drilldown-ordered-quantity"
        ),
    },
    {
      header: "PackPrice(KES)",
      accessorKey: "pack_price",
      cell: ({ getValue, row }) =>
        renderInsightCell(
            <span className="fw-medium text-success">
  {formatAmount(getValue())}
            </span>,
        
          row,
          "drilldown-pack-price"
        ),
    },
    {
      header: "UnitCost(KES)",
      accessorKey: "unit_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                 <span className="fw-medium text-info">
  {formatAmount(getValue())}
            </span>,
          row,
          "drilldown-unit-cost"
        ),
    },
    {
      header: "TotalCost(KES)",
      accessorKey: "line_total_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {formatAmount(getValue())}
          </span>,
          row,
          "drilldown-total-cost"
        ),
    },
    {
      header: "ABCClass",
      accessorKey: "abc_class",
      cell: ({ getValue, row }) =>
        renderInsightCell(
      getABCClassBadge(getValue()),
          row,
          "drilldown-abc-class"
        ),
    },
    {
      header: "Status",
      accessorKey: "lpo_status",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getLPOStatusBadge(getValue()),
          row,
          "drilldown-lpo-status"
        ),
    },
    {
      header: "RaisedBy",
      accessorKey: "raised_by",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() || "-",
          row,
          "drilldown-raised-by"
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
    //       "drilldown-lpo-insight"
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
          <div >
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
      header: "LPOs",
      accessorKey: "lpo_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "branch-lpo-count"
        ),
    },
    {
      header: "Unique SKUs",
      accessorKey: "unique_skus_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "branch-unique-skus"
        ),
    },
    {
      header: "Total Value (KES)",
      accessorKey: "total_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {formatAmount(getValue())}
          </span>,
          row,
          "branch-total-value"
        ),
    },
    {
      header: "Class A SKUs",
      accessorKey: "class_a_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "branch-class-a-skus"
        ),
    },
    {
      header: "Class A Value (KES)",
      accessorKey: "class_a_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
             <span className="fw-medium text-success">
  {formatAmount(getValue())}
            </span>,
          row,
          "branch-class-a-value"
        ),
    },
    {
      header: "Class B SKUs",
      accessorKey: "class_b_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "branch-class-b-skus"
        ),
    },
    {
      header: "Class B Value (KES)",
      accessorKey: "class_b_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                   <span className="fw-medium text-caramel">
  {formatAmount(getValue())}
            </span>,
          row,
          "branch-class-b-value"
        ),
    },
    {
      header: "Class C SKUs",
      accessorKey: "class_c_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "branch-class-c-skus"
        ),
    },
    {
      header: "Class C Value (KES)",
      accessorKey: "class_c_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
                     <span className="fw-medium text-danger">
  {formatAmount(getValue())}
            </span>,
          row,
          "branch-class-c-value"
        ),
    },
    {
      header: "Class C Share(%)",
      accessorKey: "class_c_value_share_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "branch-class-c-share"
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
    //       "branch-lpo-insight"
    //     ),
    // },
  ],
  []
);

const ConsolidatedListColumns = useMemo(
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
          "lpo-supplier"
        ),
    },
      {
      header: "Branch",
      accessorKey: "branch_name",
         meta: { sticky: "sub-group" },
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold text-dark">
              {getValue()?.replace(
                /^AXCESS PHARMACY\s*-\s*/i,
                ""
              ) || "-"}
            </span>
            {/* <small className="text-muted">
              {row.original.branch_id ?? "-"}
            </small> */}
          </div>,
          row,
          "lpo-branch"
        ),
    },
  
    {
      header: "LPO",
      accessorKey: "lpo_number",
     
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-medium ">
            {getValue() || "-"}
          </span>,
          row,
          "lpo-number"
        ),
    },
  
         {
      header: "TotalValue(KES)",
      accessorKey: "total_lpo_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-medium text-caramel">
            {formatAmount(getValue())}
          </span>,
          row,
          "lpo-total-value"
        ),
    },
    {
      header: "Class A SKUs",
      accessorKey: "class_a_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "lpo-class-a-skus"
        ),
    },
    {
      header: "Class A Value(KES)",
      accessorKey: "class_a_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
           <span className="fw-medium text-success">
              {formatAmount(getValue())}
           </span>,        
          row,
          "lpo-class-a-value"
        ),
    },
    {
      header: "Class A Share(%)",
      accessorKey: "class_a_value_share_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "lpo-class-a-share"
        ),
    },
    {
      header: "Class B SKUs",
      accessorKey: "class_b_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "lpo-class-b-skus"
        ),
    },
    {
      header: "Class B Value(KES)",
      accessorKey: "class_b_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
           <span className="fw-medium text-info">
               {formatAmount(getValue())}
           </span>,       
          row,
          "lpo-class-b-value"
        ),
    },
    {
      header: "Class B Share(%)",
      accessorKey: "class_b_value_share_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "lpo-class-b-share"
        ),
    },
    {
      header: "Class C SKUs",
      accessorKey: "class_c_skus",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatNumber(getValue()),
          row,
          "lpo-class-c-skus"
        ),
    },
    {
      header: "Class C Value(KES)",
      accessorKey: "class_c_value_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
         <span className="fw-medium text-danger">
               {formatAmount(getValue())}
           </span>,
          row,
          "lpo-class-c-value"
        ),
    },
    {
      header: "Class C Share(%)",
      accessorKey: "class_c_value_share_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {formatPercent(getValue())}
          </Badge>,
          row,
          "lpo-class-c-share"
        ),
    },  
    {
      header: "UniqueSKUs",
      accessorKey: "unique_skus_count",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-medium">
{formatNumber(getValue())}
          </span>,
          
          row,
          "lpo-unique-skus"
        ),
    },
    {
      header: "OrderedPieces",
      accessorKey: "total_ordered_pieces",
      cell: ({ getValue, row }) =>
        renderInsightCell(
             <span className="fw-medium text-info">
{formatNumber(getValue())}
          </span>,
          row,
          "lpo-ordered-pieces"
        ),
    },
   
    {
      header: "CapitalRisk",
      accessorKey: "capital_risk_flag",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <Badge className={getBadgeColor(getValue())}>
            {getValue()?.replace(/_/g, " ") || "-"}
          </Badge>,
          row,
          "lpo-capital-risk"
        ),
    },

      {
      header: "LPODate",
      accessorKey: "lpo_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-muted">
  {formatDate(getValue())}
          </span>,
        
          row,
          "lpo-date"
        ),
    },
    {
      header: "ExpectedDelivery",
      accessorKey: "expected_delivery_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
            <span className="text-muted">
  {formatDate(getValue())}
          </span>,
          row,
          "lpo-expected-delivery"
        ),
    },
  
    {
      header: "RaisedBy",
      accessorKey: "raised_by",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() || "-",
          row,
          "lpo-raised-by"
        ),
    },
    {
      header: "Status",
      accessorKey: "lpo_status",
      cell: ({ getValue, row }) =>
        renderInsightCell(
        getLPOStatusBadge (getValue()),
       
          row,
          "lpo-status"
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
    //       "lpo-insight"
    //     ),
    // },
  ],
  []
);

// const skuColumns = useMemo(
//   () => [
//     {
//       header: "Drilldown",
//       accessorKey: "item_name",
//       meta: { sticky: "group" },
//       cell: ({ getValue, row }) =>
//         renderInsightCell(
//           <div className="d-flex flex-column">
//             <span className="fw-semibold text-dark">
//               {getValue() || "-"}
//             </span>
//             <small className="text-muted">
//               {row.original.item_code || "-"}
//             </small>
//           </div>,
//           row,
//           "sku-drilldown"
//         ),
//     },
//     {
//       header: "PackSize",
//       accessorKey: "pack_size",
//       cell: ({ getValue, row }) =>
//         renderInsightCell(
//           formatNumber(getValue()),
//           row,
//           "sku-pack-size"
//         ),
//     },
//     {
//       header: "Suppliers",
//       accessorKey: "suppliers_count",
//       cell: ({ getValue, row }) =>
//         renderInsightCell(
//           formatNumber(getValue()),
//           row,
//           "sku-suppliers"
//         ),
//     },
//     {
//       header: "DebitNotes",
//       accessorKey: "debit_notes_count",
//       cell: ({ getValue, row }) =>
//         renderInsightCell(
//           formatNumber(getValue()),
//           row,
//           "sku-debit-notes"
//         ),
//     },
//     {
//       header: "UnitsReturned",
//       accessorKey: "total_units_returned",
//       cell: ({ getValue, row }) =>
//         renderInsightCell(
//           formatNumber(getValue()),
//           row,
//           "sku-units-returned"
//         ),
//     },
//     {
//       header: "QtyReturned(W/P)",
//       accessorKey: "qty_returned_wp",
//       cell: ({ getValue, row }) =>
//         renderInsightCell(
//           <span className="fw-semibold text-caramel">
//             {getValue() || "-"}
//           </span>,
//           row,
//           "sku-qty-returned-wp"
//         ),
//     },
//     {
//       header: "ReturnValue(KES)",
//       accessorKey: "total_return_value_exc",
//       cell: ({ getValue, row }) =>
//         renderInsightCell(
//           <span className="fw-semibold text-danger">
//             {formatAmount(getValue())}
//           </span>,
//           row,
//           "sku-return-value"
//         ),
//     },
//     // {
//     //   header: "Insight",
//     //   accessorKey: "action_insight",
//     //   enableSorting: false,
//     //   cell: ({ row }) =>
//     //     renderInsightCell(
//     //       <span className="text-primary">
//     //         <i className="ri-information-line me-1"></i>
//     //         View Insight
//     //       </span>,
//     //       row,
//     //       "sku-insight"
//     //     ),
//     // },
//   ],
//   []
// );

const tableConfig = {
  ConsolidatedList: {
    columns: ConsolidatedListColumns,
    data: ConsolidatedLPOReviewConsolidatedList,
    placeholder: "Search LPOs, suppliers...",
    emptyMessage: "No consolidated LPO records found.",
  },
  supplier: {
    columns: supplierColumns,
    data: ConsolidatedLPOReviewSupplier,
    placeholder: "Search suppliers...",
    emptyMessage: "No supplier LPO records found.",
  },
  branch: {
    columns: branchColumns,
    data: ConsolidatedLPOReviewBranch,
    placeholder: "Search branches...",
    emptyMessage: "No branch LPO records found.",
  },
  drilldown: {
    columns: drilldownColumns,
    data: ConsolidatedLPOReviewDrilldown,
    placeholder: "Search LPOs, items...",
    emptyMessage: "No LPO item drilldown records found.",
  },
};

  const currentTable = tableConfig[activeTab];

 const toolbarContent = (
  <Nav
    pills
    className="nav-tabs-custom flex-wrap gap-1"
    role="tablist"
  >
    {ConsolidatedLPOReviewTabs.map((tab) => {
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
        "LPO Count": item.lpo_count,
        "Unique SKUs": item.unique_skus_count,
        "Total Value (KES)": item.total_value_kes,
        "Class A SKUs": item.class_a_skus,
        "Class A Value (KES)": item.class_a_value_kes,
        "Class B SKUs": item.class_b_skus,
        "Class B Value (KES)": item.class_b_value_kes,
        "Class C SKUs": item.class_c_skus,
        "Class C Value (KES)": item.class_c_value_kes,
        "Class C Share (%)": item.class_c_value_share_perc,
        "Action Insight": item.action_insight,
      };
    }

    if (activeTab === "drilldown") {
      return {
        "LPO Number": item.lpo_number,
        "LPO Date": item.lpo_date,
        "Branch ID": item.branch_id,
        "Branch Name": item.branch_name,
        "Supplier ID": item.supplier_id,
        "Supplier Name": item.supplier_name,
        "Item Code": item.item_code,
        "Item Name": item.item_name,
        "Pack Size": item.pack_size,
        "Pack Quantity": item.pack_quantity,
        "Piece Quantity": item.piece_quantity,
        "Ordered Quantity (W/P)": item.ordered_qty_wp,
        "Pack Price (KES)": item.pack_price,
        "Unit Cost (KES)": item.unit_cost,
        "Line Total Cost (KES)": item.line_total_cost,
        "ABC Class": item.abc_class,
        "LPO Status": item.lpo_status,
        "Raised By": item.raised_by,
        "Action Insight": item.action_insight,
      };
    }

    if (activeTab === "branch") {
      return {
        "Branch ID": item.branch_id,
        "Branch Name": item.branch_name,
        "LPO Count": item.lpo_count,
        "Unique SKUs": item.unique_skus_count,
        "Total Value (KES)": item.total_value_kes,
        "Class A SKUs": item.class_a_skus,
        "Class A Value (KES)": item.class_a_value_kes,
        "Class B SKUs": item.class_b_skus,
        "Class B Value (KES)": item.class_b_value_kes,
        "Class C SKUs": item.class_c_skus,
        "Class C Value (KES)": item.class_c_value_kes,
        "Class C Share (%)": item.class_c_value_share_perc,
        "Action Insight": item.action_insight,
      };
    }

    return {
      "LPO Number": item.lpo_number,
      "LPO Date": item.lpo_date,
      "Expected Delivery Date": item.expected_delivery_date,
      "Branch ID": item.branch_id,
      "Branch Name": item.branch_name,
      "Supplier ID": item.supplier_id,
      "Supplier Name": item.supplier_name,
      "Raised By": item.raised_by,
      "LPO Status": item.lpo_status,
      "Total LPO Value (KES)": item.total_lpo_value_kes,
      "Unique SKUs": item.unique_skus_count,
      "Total Ordered Pieces": item.total_ordered_pieces,
      "Class A SKUs": item.class_a_skus,
      "Class A Value (KES)": item.class_a_value_kes,
      "Class A Share (%)": item.class_a_value_share_perc,
      "Class B SKUs": item.class_b_skus,
      "Class B Value (KES)": item.class_b_value_kes,
      "Class B Share (%)": item.class_b_value_share_perc,
      "Class C SKUs": item.class_c_skus,
      "Class C Value (KES)": item.class_c_value_kes,
      "Class C Share (%)": item.class_c_value_share_perc,
      "Capital Risk Flag": item.capital_risk_flag,
      "Action Insight": item.action_insight,
    };
  });

  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  exportToExcel(
    rows,
    `Consolidated_LPO_Review_${activeTab}_${todayStr}`
  );
};

  return (
<Card
  className="card-height-100"
  id="branch-order-fill-rate-card"
>
  <CardHeader className="d-flex justify-content-between align-items-center flex-wrap pb-1 gap-2">
<div>
  <h4 className="card-title mb-1">Consolidated LPO Review</h4>
  <p className="text-muted mb-0">
    Review LPO values, supplier and branch performance, item classifications, and capital risk.
  </p>
</div>

<CardExportButtons
  targetId="consolidated-lpo-review-card"
  title="Consolidated LPO Review"
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
      searchInputWidth="450px"
      customPageSize={10}
      pageSizeOptions={[5, 10, 20, 30, 50]}
      tableClass="table align-middle table-hover table-bordered table-striped"
          theadClass="table-light"
      loading={loading}
      error={error}
      emptyMessage={currentTable.emptyMessage}
    />
      </CardBody>
        </Card>
  );
};

export default ConsolidatedLPOReviewTable;