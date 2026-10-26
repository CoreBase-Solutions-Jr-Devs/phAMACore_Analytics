import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader } from "reactstrap";
import { RevenueExpensesChart } from "./DashboardMyBusinessCharts";
import { formatCurrency } from "../utils/formatHelper";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";
import TrendCardBody, { exportStamp, money } from "./TrendCardBody";

const RevenueExpenses = () => {
  const { monthlyTrend = [], loadingMonthlyTrend, errorMonthlyTrend, filters = {}, appliedFilters } = useSelector(
    (state) => state.DashboardMyBusiness || {}
  );
  const activeFilters = appliedFilters || filters;

  const trend = useMemo(() => {
    const round = (value) => Number((value || 0).toFixed(2));
    const total = (field) => monthlyTrend.reduce((sum, m) => sum + (m[field] || 0), 0);
    const revenue = total("revenue");
    const grossProfit = total("grossProfit");

    return {
      categories: monthlyTrend.map((m) => m.label),
      series: [
        { name: "Revenue (excl. VAT)", data: monthlyTrend.map((m) => round(m.revenue)) },
        { name: "Cost of Sales", data: monthlyTrend.map((m) => round(m.cost)) },
        { name: "Gross Profit", data: monthlyTrend.map((m) => round(m.grossProfit)) },
      ],
      revenue,
      cost: total("cost"),
      grossProfit,
      margin: revenue ? (grossProfit / revenue) * 100 : 0,
    };
  }, [monthlyTrend]);

  const handleExportExcel = () => {
    const rows = monthlyTrend.map((m) => ({
      Month: m.label,
      From: m.startDate,
      To: m.endDate,
      "Revenue excl. VAT (KES)": money(m.revenue),
      "Cost of Sales (KES)": money(m.cost),
      "Gross Profit (KES)": money(m.grossProfit),
      "Gross Margin %": m.revenue ? ((m.grossProfit / m.revenue) * 100).toFixed(2) : "0.00",
    }));
    exportToExcel(rows, `Revenue_vs_Cost_of_Sales_${exportStamp()}`);
  };

  return (
    <Card id="revenue-expenses-card">
      <CardBody className="p-0">
        <CardHeader className="border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="card-title mb-0">Revenue vs Cost of Sales</h4>
            <small className="text-muted">
              Revenue: <strong className="text-primary me-2">{formatCurrency(trend.revenue, "KES", 0)}</strong>
              Cost of sales: <strong className="text-danger me-2">{formatCurrency(trend.cost, "KES", 0)}</strong>
              Gross profit:{" "}
              <strong className="text-success">
                {formatCurrency(trend.grossProfit, "KES", 0)} ({trend.margin.toFixed(1)}%)
              </strong>
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-primary">
              {activeFilters.startDate} - {activeFilters.endDate}
            </span>
            <CardExportButtons
              onExport={handleExportExcel}
              targetId="revenue-expenses-card"
              title="Revenue vs Cost of Sales"
            />
          </div>
        </CardHeader>
        <TrendCardBody loading={loadingMonthlyTrend} error={errorMonthlyTrend} empty={!monthlyTrend.length}>
          <RevenueExpensesChart
            series={trend.series}
            categories={trend.categories}
            dataColors='["--vz-primary","--vz-danger","--vz-success"]'
          />
        </TrendCardBody>
        <div className="border-top px-3 py-2">
          <small className="text-muted">
            Cost of sales is the cost of goods sold, not operating expenses. Rent, salaries and other
            expenses are not in the system yet, so operating profit cannot be shown.
          </small>
        </div>
      </CardBody>
    </Card>
  );
};

export default RevenueExpenses;