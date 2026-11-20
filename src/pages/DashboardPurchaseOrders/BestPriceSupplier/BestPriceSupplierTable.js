
import React, { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Badge,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";

import TanstackTable from "../../../Components/Common/TanstackTable";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
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
    BEST_PRICE: "bg-success-subtle text-success",
    PREMIUM: "bg-warning-subtle text-warning",
    ABOVE_MARKET: "bg-danger-subtle text-danger",
  };

  return styles[normalized] || "bg-secondary-subtle text-secondary";
};

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

const BestPricePerSupplierTable = ({
  BestPricePerSupplierSupplierScorecardData = [],
  BestPricePerSupplierItemMatrixData = [],
  BestPricePerSupplierBestPriceCatalogData = [],
  BestPricePerSupplierProposedHistoricalData = [],
  error = null,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState("supplier");


  const supplierData = useMemo(() => {
    return [...(BestPricePerSupplierSupplierScorecardData || [])].sort(
      (a, b) =>
        Number(b.total_spend_exc || 0) -
        Number(a.total_spend_exc || 0)
    );
  }, [BestPricePerSupplierSupplierScorecardData]);

  const itemMatrixData = useMemo(
    () => BestPricePerSupplierItemMatrixData || [],
    [BestPricePerSupplierItemMatrixData]
  );

  const bestPriceCatalogData = useMemo(
    () => BestPricePerSupplierBestPriceCatalogData || [],
    [BestPricePerSupplierBestPriceCatalogData]
  );
          
const proposedHistoricalData = useMemo(
  () => BestPricePerSupplierProposedHistoricalData || [],
  [BestPricePerSupplierProposedHistoricalData]
);

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
            "scorecard-supplier"
          ),
      },
        {
        header: "SavingsLost(KES)",
        accessorKey: "total_savings_lost_to_premium",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span
              className={              
                  "text-warning fw-semibold"               
              }
            >
              {formatAmount(getValue())}
            </span>,
            row,
            "scorecard-savings-lost"
          ),
      },
      {
        header: "TotalSpend.Excl(KES)",
        accessorKey: "total_spend_exc",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span className="fw-semibold text-caramel">
              {formatAmount(getValue())}
            </span>,
            row,
            "scorecard-spend"
          ),
      },
      {
        header: "ItemsSupplied",
        accessorKey: "total_items_supplied",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            formatNumber(getValue()),
            row,
            "scorecard-items"
          ),
      },
      {
        header: "BestPriceItems",
        accessorKey: "best_price_items_count",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span className="fw-semibold text-success">
              {formatNumber(getValue())}
            </span>,
            row,
            "scorecard-wins"
          ),
      },
      {
        header: "PremiumItems",
        accessorKey: "premium_items_count",
        cell: ({ getValue, row }) =>
          renderInsightCell(
          <span className="fw-semibold text-danger">
              {formatNumber(getValue())}
            </span>,
            row,
            "scorecard-premium-items"
          ),
      },
      {
        header: "WinRate(%)",
        accessorKey: "price_competitiveness_win_rate_perc",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <Badge className={getBadgeColor(Number(getValue()))}>
        {formatPercent(getValue())}
      </Badge>,
            row,
            "scorecard-win-rate"
          ),
      },
      {
        header: "AvgPremium(%)",
        accessorKey: "avg_premium_perc_when_higher",
        cell: ({ getValue, row }) =>
          renderInsightCell(
             <Badge className={getBadgeColor(Number(getValue()))}>
        {formatPercent(getValue())}
      </Badge>,
            row,
            "scorecard-avg-premium"
          ),
      },
    
     
    ],
    []
  );

  const itemMatrixColumns = useMemo(
    () => [
      {
        header: "Item",
        accessorKey: "item_name",
        meta: { sticky: "group" },
        cell: ({ row }) =>
          renderInsightCell(
            <div className="d-flex flex-column">
              <span className="fw-semibold text-dark">
                {row.original.item_name || "-"}
              </span>
              <small className="text-muted">
                {row.original.item_code || "-"}
              </small>
            </div>,
            row,
            "matrix-item"
          ),
      },
      {
        header: "Supplier",
        accessorKey: "supplier_name",
         meta: { sticky: "sub-group" },
        cell: ({ row }) =>
          renderInsightCell(
            <div className="d-flex flex-column">
              <span className="fw-semibold">
                {row.original.supplier_name || "-"}
              </span>
              <small className="text-muted">
                {row.original.supplier_id || "-"}
              </small>
            </div>,
            row,
            "matrix-supplier"
          ),
      },
      {
        header: "PackSize",
        accessorKey: "pack_size",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            formatNumber(getValue()),
            row,
            "matrix-pack-size"
          ),
      },
    
      {
        header: "Suppliers",
        accessorKey: "total_suppliers_for_item",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            formatNumber(getValue()),
            row,
            "matrix-suppliers-count"
          ),
      },
      {
        header: "BestUnitPrice(KES)",
        accessorKey: "best_unit_price",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span className="fw-semibold text-success">
              {formatAmount(getValue())}
            </span>,
            row,
            "matrix-best-unit-price"
          ),
      },
      {
        header: "LatestUnitPrice(KES)",
        accessorKey: "latest_unit_price",
        cell: ({ getValue, row }) =>
          renderInsightCell(
                <span className="fw-semibold text-warning">
    { formatAmount(getValue())}
                </span>,      
            row,
            "matrix-latest-price"
          ),
      },
      {
        header: "MarketBest(KES)",
        accessorKey: "market_best_unit_price",
        cell: ({ getValue, row }) =>
          renderInsightCell(
              <span className="fw-semibold text-info">
 {formatAmount(getValue())}
              </span>,           
            row,
            "matrix-market-best"
          ),
      },
      {
        header: "MarketWorst(KES)",
        accessorKey: "market_worst_unit_price",
        cell: ({ getValue, row }) =>
          renderInsightCell(
             <span className="fw-semibold text-success">              
            {formatAmount(getValue())}
            </span>,
            row,
            "matrix-market-worst"
          ),
      },
      {
        header: "Premium(%)",
        accessorKey: "premium_over_best_perc",
        cell: ({ getValue, row }) =>
          renderInsightCell(
 <Badge className={getBadgeColor(Number(getValue()))}>        
       {formatPercent(getValue())}
            </Badge>,
            row,
            "matrix-premium"
          ),
      },
      {
        header: "PiecesPurchased",
        accessorKey: "total_pieces_purchased",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            formatNumber(getValue()),
            row,
            "matrix-pieces"
          ),
      },
      {
        header: "TotalSpend.Exc(KES)",
        accessorKey: "total_spend_exc",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span className="fw-semibold text-caramel">
              {formatAmount(getValue())}
            </span>,
            row,
            "matrix-spend"
          ),
      },
      {
        header: "PotentialSavings(KES)",
        accessorKey: "potential_savings_realizable",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span className="fw-semibold text-success">
              {formatAmount(getValue())}
            </span>,
            row,
            "matrix-savings"
          ),
      },
        {
        header: "PriceRank",
        accessorKey: "price_rank",
        cell: ({ getValue, row }) =>
          renderInsightCell(
         <Badge className={getBadgeColor(Number(getValue()))}>
              #{getValue() ?? "-"}
            </Badge>,
            row,
            "matrix-rank"
          ),
      },
      {
        header: "Status",
        accessorKey: "price_status",
        cell: ({ getValue, row }) =>
          renderInsightCell(
       <Badge className={getBadgeColor(Number(getValue()))}>
              {getValue()?.replace(/_/g, " ") || "-"}
            </Badge>,
            row,
            "matrix-status"
          ),
      },
      {
        header: "LastPurchased",
        accessorKey: "last_purchased_date",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            formatDate(getValue()),
            row,
            "matrix-last-purchased"
          ),
      },
      // {
      //   header: "Insight",
      //   accessorKey: "action_insight",
      //   enableSorting: false,
      //   cell: ({ row }) =>
      //     renderInsightCell(
      //       <span className="text-primary">
      //         <i className="ri-information-line me-1" />
      //         View Insight
      //       </span>,
      //       row,
      //       "matrix-insight"
      //     ),
      // },
    ],
    []
  );

  const catalogColumns = useMemo(
    () => [
      {
        header: "Item",
        accessorKey: "item_name",
        meta: { sticky: "group" },
        cell: ({ row }) =>
          renderInsightCell(
            <div className="d-flex flex-column">
              <span className="fw-semibold text-dark">
                {row.original.item_name || "-"}
              </span>
              <small className="text-muted">
                {row.original.item_code || "-"}
              </small>
            </div>,
            row,
            "catalog-item"
          ),
      },
        {
        header: "BestSupplier",
        accessorKey: "best_supplier_name",

        cell: ({ row }) =>
          renderInsightCell(
            <div className="d-flex flex-column">
              <span className="fw-semibold">
                {row.original.best_supplier_name || "-"}
              </span>
              <small className="text-muted">
                {row.original.best_supplier_id || "-"}
              </small>
            </div>,
            row,
            "catalog-best-supplier"
          ),
      },
        {
        header: "Suppliers",
        accessorKey: "total_suppliers_for_item",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span className=" text-info">
  {formatNumber(getValue())}
            </span>,         
            row,
            "catalog-suppliers"
          ),
      },
      {
        header: "PackSize",
        accessorKey: "pack_size",
        cell: ({ getValue, row }) =>
          renderInsightCell(
              <span className=" text-danger">
 {formatNumber(getValue())}
              </span>,           
            row,
            "catalog-pack-size"
          ),
      },
      {
        header: "BestUnitPrice(KES)",
        accessorKey: "best_unit_price",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span className="fw-semibold text-caramel">
              {formatAmount(getValue())}
            </span>,
            row,
            "catalog-best-unit-price"
          ),
      },
      {
        header: "BestPackPrice(KES)",
        accessorKey: "best_pack_price",
        cell: ({ getValue, row }) =>
          renderInsightCell(
              <span className="fw-semibold text-success">
 {formatAmount(getValue())}
              </span>,           
            row,
            "catalog-best-pack-price"
          ),
      },
      {
        header: "Runner-upSupplier",
        accessorKey: "runner_up_supplier_name",
        cell: ({ row }) =>
          renderInsightCell(
            <div className="d-flex flex-column">
              <span className="fw-semibold text-dark">
                {row.original.runner_up_supplier_name || "-"}
              </span>
              <small className="text-muted">
                {row.original.runner_up_supplier_id || "-"}
              </small>
            </div>,
            row,
            "catalog-runner-up"
          ),
      },
      {
        header: "Runner-upPrice(KES)",
        accessorKey: "runner_up_unit_price",
        cell: ({ getValue, row }) =>
          renderInsightCell(
            <span className="fw-semibold text-warning">
  {formatAmount(getValue())}
            </span>,       
            row,
            "catalog-runner-up-price"
          ),
      },
      {
        header: "Runner-upPremium (%)",
        accessorKey: "runner_up_premium_perc",
        cell: ({ getValue, row }) =>
          renderInsightCell(
     <Badge className={getBadgeColor(Number(getValue()))}>
              {formatPercent(getValue())}
            </Badge>,
            row,
            "catalog-runner-up-premium"
          ),
      },
      // {
      //   header: "Insight",
      //   accessorKey: "action_insight",
      //   enableSorting: false,
      //   cell: ({ row }) =>
      //     renderInsightCell(
      //       <span className="text-primary">
      //         <i className="ri-information-line me-1" />
      //         View Insight
      //       </span>,
      //       row,
      //       "catalog-insight"
      //     ),
      // },
    ],
    []
  );

const proposedHistoricalColumns = useMemo(
  () => [
    {
      header: "LPONumber",
      accessorKey: "lpo_number",
      meta: { sticky: "group" },
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold">
            {getValue() || "-"}
          </span>,
          row,
          "proposed-lpo"
        ),
    },
    {
      header: "Item",
      accessorKey: "item_name",
      meta: { sticky: "sub-group" },
      cell: ({ row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold text-dark">
              {row.original.item_name || "-"}
            </span>
            <small className="text-muted">
              {row.original.item_code || "-"}
            </small>
          </div>,
          row,
          "proposed-item"
        ),
    },
    {
      header: "LPODate",
      accessorKey: "lpo_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatDate(getValue()),
          row,
          "proposed-date"
        ),
    },
    {
      header: "Branch",
      accessorKey: "branch_name",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue()?.replace("AXCESS PHARMACY - ", "") || "-",
          row,
          "proposed-branch"
        ),
    },
    
    {
      header: "ProposedSupplier",
      accessorKey: "proposed_supplier_name",
      cell: ({ row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold">
              {row.original.proposed_supplier_name || "-"}
            </span>
            <small className="text-muted">
              {row.original.proposed_supplier_id || "-"}
            </small>
          </div>,
          row,
          "proposed-supplier"
        ),
    },
    {
      header: "Quantity",
      accessorKey: "proposed_quantity",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="text-info">
 {formatNumber(getValue())}
          </span>,        
          row,
          "proposed-quantity"
        ),
    },
    {
      header: "ProposedUnitCost(KES)",
      accessorKey: "proposed_unit_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-danger">
            {formatAmount(getValue())}
          </span>,
          row,
          "proposed-unit-cost"
        ),
    },
    {
      header: "HistoricalBestCost(KES)",
      accessorKey: "best_historical_unit_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-caramel">
            {formatAmount(getValue())}
          </span>,
          row,
          "proposed-historical-best"
        ),
    },
    {
      header: "HistoricalBestSupplier",
      accessorKey: "best_historical_supplier_name",
      cell: ({ row }) =>
        renderInsightCell(
          <div className="d-flex flex-column">
            <span className="fw-semibold text-success">
              {row.original.best_historical_supplier_name || "-"}
            </span>
            <small className="text-muted">
              {row.original.best_historical_supplier_id || "-"}
            </small>
          </div>,
          row,
          "proposed-historical-supplier"
        ),
    },
    {
      header: "BestHistoricalDate",
      accessorKey: "best_historical_date",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          formatDate(getValue()),
          row,
          "proposed-historical-date"
        ),
    },
    {
      header: "LatestHistoricalCost(KES)",
      accessorKey: "latest_historical_unit_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(
            <span className="fw-semibold text-danger">
    {formatAmount(getValue())}
            </span>,      
          row,
          "proposed-latest-historical"
        ),
    },
    {
      header: "UnitCostVariance(KES)",
      accessorKey: "variance_unit_cost",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-secondary">
            {formatAmount(getValue())}
          </span>,
          row,
          "proposed-variance"
        ),
    },
    {
      header: "Premium(%)",
      accessorKey: "premium_over_best_perc",
      cell: ({ getValue, row }) =>
        renderInsightCell(
 <Badge className={getBadgeColor(Number(getValue()))}>
              {formatPercent(getValue())}
          </Badge>,
          row,
          "proposed-premium"
        ),
    },
    {
      header: "PotentialOverspend(KES)",
      accessorKey: "potential_overspend_kes",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          <span className="fw-semibold text-danger">
            {formatAmount(getValue())}
          </span>,
          row,
          "proposed-overspend"
        ),
    },
    {
      header: "PriceVerdict",
      accessorKey: "price_verdict",
      cell: ({ getValue, row }) => {
        const verdict = getValue();

        return renderInsightCell(
         <Badge className={getBadgeColor(Number(getValue()))}>
            {verdict?.replace(/_/g, " ") || "-"}
          </Badge>,
          row,
          "proposed-verdict"
        );
      },
    },
    {
      header: "RaisedBy",
      accessorKey: "raised_by",
      cell: ({ getValue, row }) =>
        renderInsightCell(
          getValue() || "-",
          row,
          "proposed-raised-by"
        ),
    },
    // {
    //   header: "Insight",
    //   accessorKey: "action_insight",
    //   enableSorting: false,
    //   cell: ({ row }) =>
    //     renderInsightCell(
    //       <span className="text-primary">
    //         <i className="ri-information-line me-1" />
    //         View Insight
    //       </span>,
    //       row,
    //       "proposed-insight"
    //     ),
    // },
  ],
  []
);

  const tabs = [
    {
      label: "SupplierScore",
      value: "supplier",
      className: "bg-success-subtle text-success",
      activeClass: "bg-success text-white",
      badgeClass: "bg-success",
    },
    {
      label: "ItemMatrix",
      value: "matrix",
      className: "bg-primary-subtle text-primary",
      activeClass: "bg-primary text-white",
      badgeClass: "bg-primary",
    },
    {
      label: "BestPrice",
      value: "catalog",
      className: "bg-info-subtle text-info",
      activeClass: "bg-info text-white",
      badgeClass: "bg-info",
    },
    {
  label: "ProposedHistorical",
  value: "proposedHistorical",
  className: "bg-warning-subtle text-warning",
  activeClass: "bg-warning text-dark",
  badgeClass: "bg-warning",
},
  ];

  const tabCounts = {
    supplier: supplierData.length,
    matrix: itemMatrixData.length,
    catalog: bestPriceCatalogData.length,
      proposedHistorical: proposedHistoricalData.length,
  };

  const tableConfig = {
    supplier: {
      title: "Supplier Price Competitiveness",
      description:
        "Compare supplier win rates, savings lost, and total procurement spend.",
      columns: supplierColumns,
      data: supplierData,
      placeholder: "Search suppliers...",
      emptyMessage: "No supplier scorecard records found.",
    },
    matrix: {
      title: "Supplier Item Price Matrix",
      description:
        "Compare supplier prices for each SKU, market prices, and potential savings.",
      columns: itemMatrixColumns,
      data: itemMatrixData,
      placeholder: "Search items, suppliers...",
      emptyMessage: "No item price comparison records found.",
    },
    catalog: {
      title: "Best Price Supplier Catalog",
      description:
        "Identify the best-priced supplier for each item and compare the runner-up price.",
      columns: catalogColumns,
      data: bestPriceCatalogData,
      placeholder: "Search items, best suppliers...",
      emptyMessage: "No best price catalog records found.",
    },
    proposedHistorical: {
  title: "Proposed vs Historical Supplier Prices",
   description: "Proposed LPO prices vs historical best and latest costs.",

  columns: proposedHistoricalColumns,
  data: proposedHistoricalData,
  placeholder: "Search LPO, items, suppliers...",
  emptyMessage: "No proposed historical price records found.",
},
  };

  const currentTable = tableConfig[activeTab];

  const toolbarContent = (
    <Nav
      pills
      className="nav-tabs-custom flex-wrap gap-1"
      role="tablist"
    >
      {tabs.map((tab) => {
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
        "Items Supplied": item.total_items_supplied,
        "Best Price Wins": item.best_price_items_count,
        "Premium Items": item.premium_items_count,
        "Win Rate (%)": item.price_competitiveness_win_rate_perc,
        "Average Premium (%)": item.avg_premium_perc_when_higher,
        "Savings Lost (KES)": item.total_savings_lost_to_premium,
        "Total Spend (KES)": item.total_spend_exc,
        "Action Insight": item.action_insight,
      };
    }

    if (activeTab === "matrix") {
      return {
        "Item Code": item.item_code,
        "Item Name": item.item_name,
        "Supplier ID": item.supplier_id,
        "Supplier Name": item.supplier_name,
        "Pack Size": item.pack_size,
        "Price Rank": item.price_rank,
        "Total Suppliers": item.total_suppliers_for_item,
        "Best Unit Price (KES)": item.best_unit_price,
        "Latest Unit Price (KES)": item.latest_unit_price,
        "Market Best (KES)": item.market_best_unit_price,
        "Market Worst (KES)": item.market_worst_unit_price,
        "Premium (%)": item.premium_over_best_perc,
        "Pieces Purchased": item.total_pieces_purchased,
        "Total Spend (KES)": item.total_spend_exc,
        "Potential Savings (KES)": item.potential_savings_realizable,
        "Price Status": item.price_status,
        "Last Purchased": item.last_purchased_date,
        "Action Insight": item.action_insight,
      };
    }

    if (activeTab === "proposedHistorical") {
  return {
    "LPO Number": item.lpo_number,
    "LPO Date": item.lpo_date,
    "Branch": item.branch_name,
    "Proposed Supplier ID": item.proposed_supplier_id,
    "Proposed Supplier": item.proposed_supplier_name,
    "Item Code": item.item_code,
    "Item Name": item.item_name,
    "Pack Size": item.pack_size,
    "Proposed Quantity": item.proposed_quantity,
    "Proposed Qty WP": item.proposed_qty_wp,
    "Proposed Pack Cost (KES)": item.proposed_pack_cost,
    "Proposed Unit Cost (KES)": item.proposed_unit_cost,
    "Proposed Total Cost (KES)": item.proposed_total_cost,
    "Historical Best Unit Cost (KES)": item.best_historical_unit_cost,
    "Historical Best Supplier": item.best_historical_supplier_name,
    "Historical Best Date": item.best_historical_date,
    "Latest Historical Unit Cost (KES)": item.latest_historical_unit_cost,
    "Unit Cost Variance (KES)": item.variance_unit_cost,
    "Premium (%)": item.premium_over_best_perc,
    "Potential Overspend (KES)": item.potential_overspend_kes,
    "Price Verdict": item.price_verdict,
    "Raised By": item.raised_by,
    "Action Insight": item.action_insight,
  };
}
    return {
      "Item Code": item.item_code,
      "Item Name": item.item_name,
      "Pack Size": item.pack_size,
      "Total Suppliers": item.total_suppliers_for_item,
      "Best Supplier ID": item.best_supplier_id,
      "Best Supplier Name": item.best_supplier_name,
      "Best Unit Price (KES)": item.best_unit_price,
      "Best Pack Price (KES)": item.best_pack_price,
      "Runner-up Supplier ID": item.runner_up_supplier_id,
      "Runner-up Supplier Name": item.runner_up_supplier_name,
      "Runner-up Unit Price (KES)": item.runner_up_unit_price,
      "Runner-up Premium (%)": item.runner_up_premium_perc,
      "Action Insight": item.action_insight,
    };
  });

  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  exportToExcel(
    rows,
    `Best_Price_Per_Supplier_${activeTab}_${todayStr}`
  );
};
  return (
    <Card
      className="card-height-100"
      id="best-price-per-supplier-card"
    >
 <CardHeader className="d-flex justify-content-between align-items-center flex-wrap pb-1 gap-2">
        <div>
          <h5 className="card-title mb-1">
            Best Price Per Supplier
          </h5>

          <p className="text-muted mb-0">
            Analyze supplier price competitiveness, compare item prices,
            and identify the best supplier for each SKU.
          </p>
        </div>

        <CardExportButtons
          targetId="best-price-per-supplier-card"
          title="Best Price Per Supplier"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody>
        {error && (
          <Alert color="danger" className="mb-3">
            {typeof error === "string"
              ? error
              : error.message || "Failed to load best price data."}
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

export default BestPricePerSupplierTable;
