import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Row, Col, Spinner } from "reactstrap";
import { RevenueExpensesChart } from "./DashboardMyBusinessCharts";
import { getInventoryProfitSummaryUser as getInventoryProfitSummaryUserApi } from "../../helpers/fakebackend_helper";
import { formatCurrency } from "../utils/formatHelper";

import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// DD/MM/YYYY Date Helper
const formatToDMY = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const RevenueExpenses = () => {
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState({
    categories: [],
    series: [
      { name: "Revenue", data: [] },
      { name: "Expenses", data: [] },
    ],
    totalRevenue: 0,
    totalExpenses: 0,
  });

  const { filters = {} } = useSelector(
    (state) => state.DashboardMyBusiness || {}
  );

  // Compute monthly windows for Year-to-Date
  const monthlyRanges = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth(); // 0 = Jan, 11 = Dec

    const ranges = [];
    for (let i = 0; i <= currentMonthIdx; i++) {
      const monthStart = new Date(currentYear, i, 1);
      // If current month, end at current date; otherwise end at last day of the month
      const monthEnd =
        i === currentMonthIdx
          ? now
          : new Date(currentYear, i + 1, 0);

      ranges.push({
        label: MONTH_NAMES[i],
        startDate: formatToDMY(monthStart),
        endDate: formatToDMY(monthEnd),
      });
    }

    return { currentYear, ranges };
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const fetchMonthlyTrend = async () => {
      setLoading(true);
      try {
        const branchFilter = filters.branch ?? 0;

        // Fetch each YTD month in parallel
        const monthlyPromises = monthlyRanges.ranges.map((item) =>
          getInventoryProfitSummaryUserApi({
            clientid: 1,
            StartDate: item.startDate,
            EndDate: item.endDate,
            branchcode: branchFilter,
            GroupBy: "BRANCH",
          }).then((res) => ({
            label: item.label,
            data: res.data?.result || res.data || res || [],
          }))
        );

        const results = await Promise.all(monthlyPromises);

        if (!isSubscribed) return;

        const revData = [];
        const expData = [];
        const categories = [];

        let cumRevenue = 0;
        let cumExpenses = 0;

        results.forEach((monthResult) => {
          categories.push(monthResult.label);

          const rows = Array.isArray(monthResult.data) ? monthResult.data : [];

          // If branch is specified, filter for that branch; else sum all returned branches
          const filteredRows =
            branchFilter && branchFilter !== 0 && branchFilter !== "0"
              ? rows.filter((r) => String(r.branchCode) === String(branchFilter))
              : rows;

          const monthRevenue = filteredRows.reduce(
            (sum, row) => sum + (parseFloat(row.salesValueExcl) || 0),
            0
          );
          const monthExpenses = filteredRows.reduce(
            (sum, row) => sum + (parseFloat(row.costValue) || 0),
            0
          );

          revData.push(Number(monthRevenue.toFixed(2)));
          expData.push(Number(monthExpenses.toFixed(2)));

          cumRevenue += monthRevenue;
          cumExpenses += monthExpenses;
        });

        setTrendData({
          categories,
          series: [
            { name: "Revenue", data: revData },
            { name: "Expenses", data: expData },
          ],
          totalRevenue: cumRevenue,
          totalExpenses: cumExpenses,
        });
      } catch (err) {
        console.error("Failed to load Revenue vs Expenses trend:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchMonthlyTrend();

    return () => {
      isSubscribed = false;
    };
  }, [monthlyRanges, filters.branch]);

  const handleExportExcel = () => {
    const rows = (trendData.categories || []).map((month, idx) => {
      const rev = trendData.series?.[0]?.data?.[idx] || 0;
      const exp = trendData.series?.[1]?.data?.[idx] || 0;
      const net = rev - exp;
      return {
        Month: month,
        "Revenue (KES)": Number(rev).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        "Expenses (KES)": Number(exp).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        "Net (KES)": Number(net).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      };
    });
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Revenue_vs_Expenses_${todayStr}`);
  };

  return (
    <Row>
      <Col xxl={12}>
        <Card id="revenue-expenses-card">
          <CardBody className="p-0">
            <CardHeader className="border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h4 className="card-title mb-0">
                  Revenue vs Expense Monthly Trend
                </h4>
                <small className="text-muted">
                  Total Rev:{" "}
                  <strong className="text-primary me-2">
                    {formatCurrency(trendData.totalRevenue, "KES", 0)}
                  </strong>
                  Total Exp:{" "}
                  <strong className="text-danger">
                    {formatCurrency(trendData.totalExpenses, "KES", 0)}
                  </strong>
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-light text-primary">
                  YTD {monthlyRanges.currentYear}
                </span>
                <CardExportButtons
                  onExport={handleExportExcel}
                  targetId="revenue-expenses-card"
                  title="Revenue vs Expenses"
                />
              </div>
            </CardHeader>
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: 350 }}
              >
                <Spinner color="primary" />
              </div>
            ) : (
              <RevenueExpensesChart
                series={trendData.series}
                categories={trendData.categories}
                dataColors='["--vz-primary","--vz-danger"]'
              />
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default RevenueExpenses;