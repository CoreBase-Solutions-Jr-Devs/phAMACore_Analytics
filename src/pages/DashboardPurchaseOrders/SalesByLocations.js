import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import TanstackTable from "../../Components/Common/TanstackTable";

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatPercentage = (value) => `${Number(value ?? 0).toFixed(2)}%`;

const SalesByLocations = ({ data = [], error, loading }) => {
  const columns = [
    {
      header: "Rank",
      accessorKey: "rank_pos",
      cell: ({ getValue }) => (
        <span className="badge bg-light text-dark">{getValue()}</span>
      ),
    },
    {
      header: "ItemGroup",
      accessorKey: "item_group",
      cell: ({ getValue }) => (
        <span className="fw-semibold text-uppercase">
          {getValue() || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Subgroup",
      accessorKey: "item_subgroup",
    },
    {
      header: "NetPurch(incl.)KES",
      accessorKey: "net_purchases_incl",
      cell: ({ getValue }) => (
        <span className="fw-semibold text-caramel">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "GrossPurch(Excl.)KES",
      accessorKey: "gross_purchases_excl",
      cell: ({ getValue }) => (
        <span className="text-success fw-semibold">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "NetPurch(Excl.)KES",
      accessorKey: "net_purchases_excl",
      cell: ({ getValue }) => (
        <span className="fw-semibold text-secondary">
          {formatAmount(getValue())}
        </span>
      ),
    },
    {
      header: "Returns(Excl.)KES",
      accessorKey: "purchase_returns_excl",
      cell: ({ getValue }) => (
        <span className="text-danger">{formatAmount(getValue())}</span>
      ),
    },
    {
      header: "Tax",
      accessorKey: "total_tax",
      cell: ({ getValue }) => formatAmount(getValue()),
    },
    {
      header: "SpendShare",
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
      header: "UniqueItems",
      accessorKey: "unique_items",
    },
    {
      header: "LineItems",
      accessorKey: "total_line_items",
    },
    {
      header: "NetUnits",
      accessorKey: "net_units_received",
      cell: ({ getValue }) => Number(getValue() ?? 0).toLocaleString("en-KE"),
    },
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

    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    exportToExcel(rows, `Spend_By_Category_${todayStr}`);
  };

  return (
    <Card className="card-height-100" id="purchases-category-spend-card">
      <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
        <h4 className="card-title mb-0 flex-grow-1">Spend by Category</h4>

        <CardExportButtons
          targetId="purchases-category-spend-card"
          title="Spend by Category"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody>
          {loading ? (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : error ? (
    <div className="alert alert-danger mb-0">
      {typeof error === "string"
        ? error
        : error.message || "Failed to load supplier spend data."}
    </div>
  ) : data?.length > 0 ? (
          <TanstackTable
            columns={columns}
            data={data}
            error={error}
            emptyMessage="No category data available"
            isGlobalFilter={true}
            isColumnFilter={false}
            customPageSize={10}
            pageSizeOptions={[5, 10, 20, 30, 50]}
            showPagination={true}
            showPageSize={true}
            SearchPlaceholder="Search categories..."
            tableClass="table align-middle table-hover"
            divClass="table-responsive"
            tableStyle={{ minWidth: "1250px" }}
          />
        ) : (
          <div className="text-center text-muted py-4">
            No category data available
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default SalesByLocations;
