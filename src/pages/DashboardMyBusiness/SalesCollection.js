import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader } from "reactstrap";
import { SalesCollectionCharts } from "./DashboardMyBusinessCharts";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import TrendCardBody, { exportStamp, money } from "./TrendCardBody";

const SalesCollection = () => {
  const { monthlyTrend = [], loadingMonthlyTrend, errorMonthlyTrend, filters = {}, appliedFilters } = useSelector(
    (state) => state.DashboardMyBusiness || state.MyBusiness || {}
  );
  const activeFilters = appliedFilters || filters;

  const series = useMemo(() => {
    const rounded = (field) => monthlyTrend.map((m) => (m[field] == null ? null : Math.round(m[field])));
    return [
      { name: "Revenue", type: "column", data: rounded("revenue") },
      { name: "Collections", type: "column", data: rounded("collections") },
      { name: "Sales Volume", type: "line", data: rounded("units") },
    ];
  }, [monthlyTrend]);

  const handleExportExcel = () => {
    const rows = monthlyTrend.map((m) => ({
      Month: m.label,
      From: m.startDate,
      To: m.endDate,
      "Revenue excl. VAT (KES)": money(m.revenue),
      "Collections (KES)": m.collections == null ? "-" : money(m.collections),
      "Sales Volume (units)": Math.round(m.units || 0).toLocaleString(),
    }));
    exportToExcel(rows, `Sales_vs_Collections_${exportStamp()}`);
  };

  return (
    <Card id="sales-collection-card">
      <CardHeader className="border-0 align-items-center d-flex justify-content-between flex-wrap gap-2">
        <h4 className="card-title mb-0">Sales vs Collections Performance Trend</h4>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-muted">
            {activeFilters.startDate} - {activeFilters.endDate}
          </span>
          <CardExportButtons
            onExport={handleExportExcel}
            targetId="sales-collection-card"
            title="Sales vs Collections"
          />
        </div>
      </CardHeader>
      <CardBody className="p-0 pb-2">
        <div dir="ltr" className="w-100">
          <TrendCardBody loading={loadingMonthlyTrend} error={errorMonthlyTrend} empty={!monthlyTrend.length}>
            <SalesCollectionCharts
              categories={monthlyTrend.map((m) => m.label)}
              series={series}
              dataColors='["--vz-primary", "--vz-success", "--vz-warning"]'
            />
          </TrendCardBody>
        </div>
      </CardBody>
    </Card>
  );
};

export default SalesCollection;