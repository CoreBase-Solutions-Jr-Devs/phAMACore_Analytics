import React from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { ProgressiveSalesChart } from "./DashboardAnalyticsCharts";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const YearToDateSales = ({ series, categories, formatAmount }) => {
  const handleExportExcel = () => {
    const rows = (categories || []).map((cat, idx) => {
      const row = { Period: cat };
      (series || []).forEach((s) => {
        row[s.name || "Value"] = Number(s.data?.[idx] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
      });
      return row;
    });
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Year_To_Date_Sales_${todayStr}`);
  };

  return (
    <Row>
      <Col xxl={12}>
        <Card id="sales-ytd-card">
          <CardBody className="p-0">
            <CardHeader className="border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h4 className="card-title mb-0">
                Year To Date Sales Comparative Graph (YTD)
              </h4>
              <CardExportButtons
                targetId="sales-ytd-card"
                title="Year To Date Sales"
                onExport={handleExportExcel}
              />
            </CardHeader>
<div className="d-flex justify-content-end align-items-center gap-3 px-3 pt-2">
  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "25px",
        borderTop: "3px solid var(--vz-primary)",
      }}
    />
    <span className="text-muted">2026</span>
  </div>

  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "25px",
        borderTop: "3px dashed var(--vz-primary)",
      }}
    />
    <span className="text-muted">2025</span>
  </div>
</div>
            <ProgressiveSalesChart
              series={series}
              categories={categories}
              formatAmount={formatAmount}
dataColors='["--vz-primary","--vz-success","--vz-gray-300"]'
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default YearToDateSales;
