import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import { SalesCollectionCharts } from "./DashboardMyBusinessCharts";
import {
  getInventoryProfitSummaryUser,
  getCashbookSummary,
} from "../../helpers/fakebackend_helper";

// Date formatting utility strictly matching DD/MM/YYYY
const formatDMY = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// Safe response array parser
const parseResponseList = (response) => {
  let data = response?.data ?? response;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = [];
    }
  }
  if (Array.isArray(data)) return data;
  if (data?.result && Array.isArray(data.result)) return data.result;
  if (data?.result && typeof data.result === "object") return [data.result];
  if (data && typeof data === "object") return [data];
  return [];
};

// Metric parser for key-value KPI summary items
const extractMetricValue = (metricList, targetName) => {
  if (!Array.isArray(metricList)) return 0;
  const match = metricList.find(
    (item) =>
      item?.metric_name?.trim().toLowerCase() === targetName.trim().toLowerCase()
  );
  if (!match || match.metric_value === undefined || match.metric_value === null) {
    return 0;
  }
  const cleanVal = String(match.metric_value).replace(/[^\d.-]/g, "");
  return Number(cleanVal) || 0;
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SalesCollection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartSeries, setChartSeries] = useState([
    { name: "Revenue", type: "column", data: [] },
    { name: "Collections", type: "column", data: [] },
    { name: "Sales Volume", type: "line", data: [] },
  ]);

  const { filters = {} } = useSelector(
    (state) => state.DashboardMyBusiness || state.MyBusiness || {}
  );

  const today = new Date();
  const currentMonthIdx = today.getMonth(); // 0-based
  const categories = monthNames.slice(0, currentMonthIdx + 1);

  useEffect(() => {
    let isMounted = true;

    const fetchTrendData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentYear = today.getFullYear();
        const branchCode = filters.branch ?? 0;

        // Construct exact month start and end boundaries
        const monthlyWindows = [];
        for (let m = 0; m <= currentMonthIdx; m++) {
          const firstDay = new Date(currentYear, m, 1);
          const lastDay = new Date(currentYear, m + 1, 0);

          monthlyWindows.push({
            monthIndex: m,
            startDate: formatDMY(firstDay),
            endDate: formatDMY(lastDay),
          });
        }

        // Fetch each monthly slice
        const monthlyRequests = monthlyWindows.map(({ startDate, endDate }) => {
          return Promise.all([
            getInventoryProfitSummaryUser({
              clientid: 1,
              StartDate: startDate,
              EndDate: endDate,
              branchcode: branchCode,
              GroupBy: "SUMMARY",
            }),
            getCashbookSummary({
              clientid: 1,
              StartDate: startDate,
              EndDate: endDate,
              branchcode: branchCode,
              GroupBy: "SUMMARY",
            }),
          ]);
        });

        const monthResults = await Promise.all(monthlyRequests);

        const revenueData = [];
        const collectionsData = [];
        const salesVolumeData = [];

        monthResults.forEach(([salesRes, cashbookRes]) => {
          const salesMetrics = parseResponseList(salesRes);
          const cashbookMetrics = parseResponseList(cashbookRes);

          // Invoiced Revenue (Excl Tax)
          const revenue = extractMetricValue(
            salesMetrics,
            "Total Sales Revenue (Excl Tax)"
          );

          // Physical pack/piece units sold
          const volume = extractMetricValue(
            salesMetrics,
            "Total Physical Units Dispensed"
          );

          // Cashbook Collections
          const collections = extractMetricValue(
            cashbookMetrics,
            "Total Collections"
          );

          revenueData.push(Math.round(revenue));
          collectionsData.push(Math.round(collections));
          salesVolumeData.push(Math.round(volume));
        });

        if (isMounted) {
          setChartSeries([
            {
              name: "Revenue",
              type: "column",
              data: revenueData,
            },
            {
              name: "Collections",
              type: "column",
              data: collectionsData,
            },
            {
              name: "Sales Volume",
              type: "line",
              data: salesVolumeData,
            },
          ]);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load sales vs collections performance trend"
          );
          setLoading(false);
        }
      }
    };

    fetchTrendData();

    return () => {
      isMounted = false;
    };
  }, [currentMonthIdx, filters.branch]);

  return (
    <React.Fragment>
      <Card>
        <CardHeader className="border-0 align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">
            Sales vs Collections Performance Trend (YTD)
          </h4>
          <span className="badge bg-light text-muted">
            Jan - {monthNames[currentMonthIdx]} YTD
          </span>
        </CardHeader>
        <CardBody className="p-0 pb-2">
          <div className="w-100">
            <div dir="ltr">
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "350px" }}
                >
                  <Spinner size="sm" color="primary" className="me-2" />
                  <span className="text-muted">Loading trend performance...</span>
                </div>
              ) : error ? (
                <div
                  className="d-flex justify-content-center align-items-center text-danger"
                  style={{ minHeight: "350px" }}
                >
                  {error}
                </div>
              ) : (
                <SalesCollectionCharts
                  categories={categories}
                  series={chartSeries}
                  dataColors='["--vz-primary", "--vz-success", "--vz-warning"]'
                />
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default SalesCollection;