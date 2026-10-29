
import React, { useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
   UncontrolledTooltip,
} from "reactstrap";
import TanstackTable from "../../../Components/Common/TanstackTable";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";

const MONTHS = [
  { key: "jan", label: "Jan", monthNo: 1 },
  { key: "feb", label: "Feb", monthNo: 2 },
  { key: "mar", label: "Mar", monthNo: 3 },
  { key: "apr", label: "Apr", monthNo: 4 },
  { key: "may", label: "May", monthNo: 5 },
  { key: "jun", label: "Jun", monthNo: 6 },
  { key: "jul", label: "Jul", monthNo: 7 },
  { key: "aug", label: "Aug", monthNo: 8 },
  { key: "sep", label: "Sep", monthNo: 9 },
  { key: "oct", label: "Oct", monthNo: 10 },
  { key: "nov", label: "Nov", monthNo: 11 },
  { key: "dec", label: "Dec", monthNo: 12 },
];

const BRANCHES = [
  { branchID: 1, branchName: "Syokimau" },
  { branchID: 2, branchName: "Tassia" },
  { branchID: 3, branchName: "Machakos" },
  { branchID: 4, branchName: "Mtwapa" },
  { branchID: 5, branchName: "Kasarani" },
  { branchID: 6, branchName: "Eldoret" },
  { branchID: 7, branchName: "Busia" },
  { branchID: 8, branchName: "Msa GPO" },
  { branchID: 9, branchName: "Kitale" },
  { branchID: 10, branchName: "Kisii" },
];

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("en-KE",);

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

const getBranchName = (apiName, fallbackName) => {
  if (!apiName) return fallbackName;

  return apiName
    .replace(/^AXCESS PHARMACY\s*-\s*/i, "")
    .trim();
};


const InsightCell = ({ id, children, insight }) => (
  <>
    <span
      id={id}
      style={{ cursor: insight ? "help" : "default" }}
    >
      {children}
    </span>

    {insight && (
      <UncontrolledTooltip target={id} placement="top">
        {insight}
      </UncontrolledTooltip>
    )}
  </>
);

const BranchTarget = ({
  data = [],
  loading = false,
  error = null,
}) => {
  const sourceData = Array.isArray(data) ? data : [];

  // Transform API records into one row per branch.
  const branchData = useMemo(() => {
    return BRANCHES.map((branch) => {
      const row = { ...branch };

      MONTHS.forEach(({ key }) => {
        row[`${key}Sales`] = 0;
        row[`${key}Target`] = 0;
        row[`${key}Variance`] = 0;
        row[`${key}Achievement`] = 0;
      row[`${key}ActionInsight`] = "";
      });

      sourceData
        .filter(
          (item) => Number(item.branchID) === branch.branchID
        )
        .forEach((item) => {
          const month = MONTHS.find(
            (entry) => entry.monthNo === Number(item.monthNo)
          );

          if (!month) return;

          row.branchName = getBranchName(
            item.branchName,
            branch.branchName
          );

          row[`${month.key}Sales`] = Number(
            item.actualSalesExcl ?? 0
          );

          row[`${month.key}Target`] = Number(
            item.targetSales ?? 0
          );

          row[`${month.key}Variance`] = Number(
            item.variance ?? 0
          );

          row[`${month.key}Achievement`] = Number(
            item.achievementPct ?? 0
          );

          row[`${month.key}ActionInsight`] = item.action_insight ?? "";
        });

      return row;
    });
  }, [sourceData]);


  const columns = useMemo(() => {
    const branchColumn = {
      header: "Branch",
      accessorKey: "branchName",
      enableSorting: true,
      meta: {
        tdClassName: "fw-semibold",
        tdStyle: {
          position: "sticky",
          left: 0,
          zIndex: 2,
          minWidth: "160px",
          backgroundColor: "#fff",
          borderRight: "1px solid #cbd5e1",
        },
      },
      cell: ({ getValue }) => getValue() ?? "-",
    };

    const monthlyColumns = MONTHS.flatMap((month) => [
   
{
  header: `${month.label} Sales`,
  accessorKey: `${month.key}Sales`,
  enableSorting: true,
  cell: ({ getValue, row }) => (
    <InsightCell
      id={`insight-${row.original.branchID}-${month.key}-sales`}
      insight={row.original[`${month.key}ActionInsight`]}
    >
      {formatAmount(getValue())}
    </InsightCell>
  ),
  meta: {
    tdClassName: "text-end",
    tdStyle: { borderLeft: "1px solid #cbd5e1" },
  },
},
{
  header: `${month.label} Target`,
  accessorKey: `${month.key}Target`,
  enableSorting: true,
  cell: ({ getValue, row }) => (
    <InsightCell
      id={`insight-${row.original.branchID}-${month.key}-target`}
      insight={row.original[`${month.key}ActionInsight`]}
    >
      {formatAmount(getValue())}
    </InsightCell>
  ),
  meta: { tdClassName: "text-end" },
},
{
  header: `${month.label} Variance`,
  accessorKey: `${month.key}Variance`,
  enableSorting: true,
  cell: ({ getValue, row }) => {
    const variance = Number(getValue() ?? 0);

    return (
      <InsightCell
        id={`insight-${row.original.branchID}-${month.key}-variance`}
        insight={row.original[`${month.key}ActionInsight`]}
      >
        <span
          className={`fw-semibold ${
            variance > 0
              ? "text-success"
              : variance < 0
                ? "text-danger"
                : ""
          }`}
        >
          {formatAmount(variance)}
        </span>
      </InsightCell>
    );
  },
  meta: { tdClassName: "text-end" },
},
{
  header: `${month.label} Achievement`,
  accessorKey: `${month.key}Achievement`,
  enableSorting: true,
  cell: ({ getValue, row }) => {
    const achievement = Number(getValue() ?? 0);
    const statusColor =
      row.original[`${month.key}StatusColor`];

    return (
      <InsightCell
        id={`insight-${row.original.branchID}-${month.key}-achievement`}
        insight={row.original[`${month.key}ActionInsight`]}
      >
        <Badge
  pill
  className={getBadgeColor(achievement)}
>
  {achievement.toFixed(1)}%
</Badge>
      </InsightCell>
    );
  },
  meta: {
    tdClassName: "text-end",
    tdStyle: { borderRight: "1px solid #cbd5e1" },
  },
},

    ]);

    return [branchColumn, ...monthlyColumns];
  }, []);

  // Two header rows: each month spans four metric columns.
  const customHeader = (
    <>
      <tr>
        <th
          rowSpan={2}
          className="table-light align-middle"
          style={{
            position: "sticky",
            left: 0,
            zIndex: 4,
            minWidth: "160px",
            backgroundColor: "#f3f6f9",
            borderRight: "1px solid #cbd5e1",
          }}
        >
          Branch
        </th>

        {MONTHS.map((month) => (
          <th
            key={month.key}
            colSpan={4}
            className="table-light text-center"
            style={{
              backgroundColor: "#f3f6f9",
              borderRight: "1px solid #cbd5e1",
            }}
          >
            {month.label}
          </th>
        ))}
      </tr>

      <tr>
        {MONTHS.map((month) => (
          <React.Fragment key={month.key}>
            <th
              className="table-light text-end fw-normal"
              style={{ borderLeft: "1px solid #cbd5e1" }}
            >
              Sales
            </th>
            <th className="table-light text-end fw-normal">
              Target
            </th>
            <th className="table-light text-end fw-normal">
              Var (KES)
            </th>
            <th
              className="table-light text-end fw-normal"
              style={{ borderRight: "1px solid #cbd5e1" }}
            >
              Pct (%)
            </th>
          </React.Fragment>
        ))}
      </tr>
    </>
  );

  const handleExportExcel = () => {
    const rows = branchData.map((branch) => {
      const row = { Branch: branch.branchName };

      MONTHS.forEach((month) => {
        row[`${month.label} Sales (KES)`] =
          branch[`${month.key}Sales`];

        row[`${month.label} Target (KES)`] =
          branch[`${month.key}Target`];

        row[`${month.label} Variance (KES)`] =
          branch[`${month.key}Variance`];

        row[`${month.label} Achievement (%)`] =
          branch[`${month.key}Achievement`];
      });

      return row;
    });

    const today = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    exportToExcel(
      rows,
      `Branch_Sales_Target_Performance_${today}`
    );
  };

  return (
    <Card
      id="branch-target-performance-card"
      className="card-height-100"
    >
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
        <div>
          <h4 className="card-title mb-1">
            Branch Sales &amp; Target Performance
          </h4>
          <p className="text-muted mb-0">
            Monthly sales, targets, and percentage variance across branches
          </p>
        </div>

        <CardExportButtons
          targetId="branch-target-performance-card"
          title="Branch Sales and Target Performance"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody className="pt-2">
        {error && (
          <div className="alert alert-danger">
            {typeof error === "string"
              ? error
              : error.message || "Failed to load branch performance."}
          </div>
        )}

        <TanstackTable
          columns={columns}
          data={branchData}
          customHeader={customHeader}
            searchInputWidth = "450px"
          isGlobalFilter={true}
          isColumnFilter={false}
          customPageSize={10}
          pageSizeOptions={[5, 10, 20, 30]}
          SearchPlaceholder="Search branches or monthly performance..."
          tableClass="table table-nowrap align-middle table-hover table-bordered mb-0"
          theadClass="table-light"
          divClass="branch-target-table"
          loading={loading}
          error={error}
          emptyMessage={
            sourceData.length === 0
              ? "No monthly performance data available."
              : "No matching branches found."
          }
          showPagination={true}
          showPageSize={true}
        />
      </CardBody>
    </Card>
  );
};

export default BranchTarget;
