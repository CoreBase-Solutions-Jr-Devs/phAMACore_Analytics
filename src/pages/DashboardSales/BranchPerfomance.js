import React from "react";
import { Card, CardHeader, CardBody } from "reactstrap";
import { BranchPerformanceChart } from "./DashboardAnalyticsCharts";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const BranchPerformance = ({
  branchData = [],
  chartSeries = [],
  categories = [],
  formatAmount,
  error,
  loading,
}) => {
  const topBranch = branchData.length
    ? [...branchData].sort((a, b) => b.amount - a.amount)[0]
    : null;

  const handleExportExcel = () => {
    const rows = (branchData || []).map((item) => ({
      Branch: item.name || item.branch_Name || "",
      "Revenue (KES)": Number(item.amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      }),
    }));
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Branch_Performance_Sales_${todayStr}`);
  };

  return (
    <React.Fragment>
      <Card className="card-height-100" id="sales-branch-performance-card">
       <CardBody className="p-0">
    <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
                <h4 className="card-title mb-0 1">
            Branch Performance-Revenue by Branch
          </h4>
          <CardExportButtons
            targetId="sales-branch-performance-card"
            title="Branch Performance"
            onExport={handleExportExcel}
          />
        </CardHeader>
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
              ></div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <h6 className="text-danger mb-2">{error} </h6>
            </div>
          ) : chartSeries.length === 0 ? (
            <div className="text-center py-5">
              <h6 className="text-muted mb-2">
                No branch performance sales data available
              </h6>
            </div>
          ) : (
           <div
  className="branch-chart-container"
  style={{
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    padding: "0 12px 12px",
  }}>
    <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap mt-2 mb-3">
  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "14px",
        height: "14px",
        backgroundColor: "var(--vz-success)",
        borderRadius: "2px",
      }}
    />
    <span className="text-muted">Revenue</span>
  </div>

  <div className="d-flex align-items-center gap-2">
    <svg width="28" height="12" viewBox="0 0 28 12">
      <line
        x1="0"
        y1="6"
        x2="28"
        y2="6"
        stroke="var(--vz-success)"
        strokeWidth="3"
        strokeDasharray="3 4"
      />
    </svg>
    <span className="text-muted">Revenue Trend</span>
  </div>
</div>
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

             </div>

             
           
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default BranchPerformance;
