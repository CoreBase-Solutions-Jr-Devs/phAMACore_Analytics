import React from "react";
import { Card, CardHeader, CardSubtitle, CardBody } from "reactstrap";
import { BranchPerformanceChart } from "./DashboardAnalyticsCharts";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const BranchPerformance = ({
branchData = [],
    chartSeries = [],
  categories = [],
  formatAmount,
}) => {

  const topBranch = branchData.length
    ? [...branchData].sort((a, b) => b.amount - a.amount)[0]
    : null;

  const handleExportExcel = () => {
    const rows = (branchData || []).map((item) => ({
      Branch: item.name || item.branch_Name || "",
      "Revenue (KES)": Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    }));
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Branch_Performance_Sales_${todayStr}`);
  };

  return (
    <React.Fragment>
    <Card className="card-height-100" id="sales-branch-performance-card">
<CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
        <h4 className="card-title mb-0 flex-grow-1">
          Branch Performance-Revenue by Branch
        </h4>
        <CardExportButtons
          targetId="sales-branch-performance-card"
          title="Branch Performance"
          onExport={handleExportExcel}
        />
</CardHeader>
      <CardBody  style={{ minHeight: "250px" }}>
 {chartSeries.length === 0 ? (
        <div className="text-center py-5">
          <h6 className="text-muted mb-2">
            No branch performance sales data available
          </h6>
        </div>
      ) : (
        <>
        <BranchPerformanceChart
        series={chartSeries}
  categories={categories}
  formatAmount={formatAmount}
          dataColors='[
            "--vz-success",
            "--vz-primary",
            "--vz-warning",
            "--vz-info",
            "--vz-danger"
          ]'
        />

        <hr className="my-2" />

        {topBranch && (
          <div className="d-flex flex-row align-items-center justify-content-center mb-2 gap-3">
            <p>
              Top performing branch:
              <strong> {topBranch.name}</strong>
            </p>

            <p >
              Revenue:
              <strong> KES {formatAmount(Number(topBranch.amount))}</strong>
            </p>
          </div>
        )}
 </>
      )}
      </CardBody>
    </Card>
    </React.Fragment>
  );
};

export default BranchPerformance;