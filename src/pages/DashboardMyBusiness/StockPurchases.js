import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader } from "reactstrap";
import { StockPurchasesCharts } from "./DashboardMyBusinessCharts";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import TrendCardBody, { exportStamp, money } from "./TrendCardBody";

const StockPurchases = () => {
  const { monthlyTrend = [], loadingMonthlyTrend, errorMonthlyTrend, appliedFilters = {} } = useSelector(
    (state) => state.DashboardMyBusiness || state.MyBusiness || {}
  );

  // null (not 0) where a figure does not exist, so the chart leaves a gap instead of a false zero
  const series = useMemo(() => {
    const rounded = (field) => monthlyTrend.map((m) => (m[field] == null ? null : Math.round(m[field])));
    return [
      { name: "Purchases", data: rounded("purchases") },
      { name: "Cost of Sales", data: rounded("cost") },
      { name: "Stock Value (current)", data: rounded("stockValue") },
    ];
  }, [monthlyTrend]);

  const handleExportExcel = () => {
    const rows = monthlyTrend.map((m) => ({
      Month: m.label,
      From: m.startDate,
      To: m.endDate,
      "Net Purchases excl. VAT (KES)": m.purchases == null ? "-" : money(m.purchases),
      "Cost of Sales (KES)": money(m.cost),
      "Stock Value Today (KES)": m.stockValue == null ? "-" : money(m.stockValue),
    }));
    exportToExcel(rows, `Purchases_vs_Cost_of_Sales_${exportStamp()}`);
  };

  return (
    <Card className="card-height-100" id="stock-purchases-card">
      <CardHeader className="border-0 align-items-center d-flex justify-content-between flex-wrap gap-2">
        <h4 className="card-title mb-0">Purchases, Cost of Sales &amp; Stock</h4>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-muted">
            {appliedFilters.startDate} - {appliedFilters.endDate}
          </span>
          <CardExportButtons
            onExport={handleExportExcel}
            targetId="stock-purchases-card"
            title="Purchases, Cost of Sales and Stock"
          />
        </div>
      </CardHeader>
      <CardBody className="p-0 pb-2">
        <div dir="ltr" className="w-100">
          <TrendCardBody
            loading={loadingMonthlyTrend}
            error={errorMonthlyTrend}
            empty={!monthlyTrend.length}
            height={370}
          >
            <StockPurchasesCharts
              categories={monthlyTrend.map((m) => m.label)}
              series={series}
              dataColors='["--vz-success", "--vz-danger", "--vz-primary"]'
            />
          </TrendCardBody>
        </div>
        <div className="border-top px-3 pt-2">
          <small className="text-muted">
            Purchases are supplier invoices less returns. Stock value is today's valuation and is only
            shown on the current month, because month-end stock history is not available yet.
          </small>
        </div>
      </CardBody>
    </Card>
  );
};

export default StockPurchases;