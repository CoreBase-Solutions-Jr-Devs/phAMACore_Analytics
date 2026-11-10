
import React from "react";
import { Card, CardBody, CardHeader, Alert } from "reactstrap";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import TanstackTable from "../../../Components/Common/TanstackTable";

const GROUP_WIDTH = 140;
const SUBGROUP_WIDTH = 150;
const RANK_WIDTH = 20;

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatPercentage = (value) =>
  `${Number(value ?? 0).toFixed(2)}%`;

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

const SpendTable = ({ data = [], error, loading }) => {
  const columns = [
    {
      header: "Rank",
      accessorKey: "rank_pos",
        meta: {
        sticky: "group",
        thStyle: {
          width: `${RANK_WIDTH}px`,
          minWidth: `${RANK_WIDTH}px`,
          maxWidth: `${RANK_WIDTH}px`,
        },
        tdStyle: {
          width: `${RANK_WIDTH}px`,
          minWidth: `${RANK_WIDTH}px`,
          maxWidth: `${RANK_WIDTH}px`,
        },
      },
    },
    {
      header: "Item Group",
      accessorKey: "item_group",
      meta: {
        sticky: "group",
        thStyle: {
          width: `${GROUP_WIDTH}px`,
          minWidth: `${GROUP_WIDTH}px`,
          maxWidth: `${GROUP_WIDTH}px`,
        },
        tdStyle: {
          width: `${GROUP_WIDTH}px`,
          minWidth: `${GROUP_WIDTH}px`,
          maxWidth: `${GROUP_WIDTH}px`,
        },
      },
      cell: ({ getValue }) => (
        <span className="fw-semibold text-uppercase">
          {getValue() || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Subgroup",
      accessorKey: "item_subgroup",
      meta: {
        sticky: "subgroup",
        thStyle: {
          width: `${SUBGROUP_WIDTH}px`,
          minWidth: `${SUBGROUP_WIDTH}px`,
          maxWidth: `${SUBGROUP_WIDTH}px`,
        },
        tdStyle: {
          width: `${SUBGROUP_WIDTH}px`,
          minWidth: `${SUBGROUP_WIDTH}px`,
          maxWidth: `${SUBGROUP_WIDTH}px`,
        },
      },
    },
    {
      header: "NetPurch(Incl.)",
      accessorKey: "net_purchases_incl",
      cell: ({ getValue }) => (
        <span className="fw-semibold text-caramel">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "GrossPurch(Excl.)",
      accessorKey: "gross_purchases_excl",
      cell: ({ getValue }) => (
        <span className="text-success fw-semibold">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "NetPurch(Excl.)",
      accessorKey: "net_purchases_excl",
      cell: ({ getValue }) => (
        <span className="fw-semibold text-secondary">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "Returns (Excl.)",
      accessorKey: "purchase_returns_excl",
      cell: ({ getValue }) => (
        <span className="text-danger">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "Tax",
      accessorKey: "total_tax",
      cell: ({ getValue }) => formatAmount(getValue()),
    },
    {
      header: "Spend Share",
      accessorKey: "spend_share_perc",
      cell: ({ getValue }) => {
        const value = getValue();

        return (
          <span className={`badge ${getBadgeColor(value)}`}>
            {formatPercentage(value)}
          </span>
        );
      },
    },
    {
      header: "Unique Items",
      accessorKey: "unique_items",
    },
    {
      header: "Line Items",
      accessorKey: "total_line_items",
    },
    {
      header: "Net Units",
      accessorKey: "net_units_received",
      cell: ({ getValue }) =>
        Number(getValue() ?? 0).toLocaleString("en-KE"),
    },
  ];

  const handleExportExcel = () => {
    const rows = (data || []).map((item) => ({
      Rank: item.rank_pos,
      "Item Group": item.item_group,
      Subgroup: item.item_subgroup,
      "Gross Purchases Excl.": item.gross_purchases_excl,
      "Purchase Returns Excl.": item.purchase_returns_excl,
      "Net Purchases Excl.": item.net_purchases_excl,
      "Net Purchases Incl.": item.net_purchases_incl,
      Tax: item.total_tax,
      "Net Units Received": item.net_units_received,
      "Unique Items": item.unique_items,
      "Total Line Items": item.total_line_items,
      "Spend Share (%)": item.spend_share_perc,
    }));

    const todayStr = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    exportToExcel(rows, `Spend_By_Category_${todayStr}`);
  };

  return (
    <Card
      className="card-height-100"
      id="purchases-category-spend-card"
    >
       <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
              <div>
                <h4 className="card-title mb-0 ">
          Spend by Category
        </h4>
 <p className="text-muted mb-0">
Overview of purchasing spend, returns, and net expenditure by product category."         </p>
</div>
        <CardExportButtons
          targetId="purchases-category-spend-card"
          title="Spend by Category"
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
          columns={columns}
          data={data}
          loading={loading}
          error={error}
          emptyMessage="No category data available"
          searchInputWidth="450px"
          isGlobalFilter={true}
          isColumnFilter={false}
          customPageSize={10}
          pageSizeOptions={[5, 10, 20, 30, 50]}
          showPagination={true}
          showPageSize={true}
          SearchPlaceholder="Search categories..."
          tableClass="table align-middle table-hover"
          divClass="table-responsive"
          tableStyle={{
            minWidth: "1550px",
            tableLayout: "fixed",
          }}
        />
      </CardBody>
    </Card>
  );
};

export default SpendTable;
