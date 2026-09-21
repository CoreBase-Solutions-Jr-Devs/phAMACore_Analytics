import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import ReactApexChart from 'react-apexcharts';
import { Spinner } from 'reactstrap';
import { getPeriodDays, transformStockVsSalesVelocity } from './util/chartTransforms';

const BarChartThree = ({
    height = 420,
    categories: propCategories,
    stock: propStock,
    sales: propSales,
}) => {
    const {
        totalStockValueByBranch = [],
        kpiSalesTransactions = [],
        kpiSalesPeriodDays = 1,
        kpiSalesIsBaseline = false,
        loadingTotalStockValueByBranch,
        loadingKPISalesTransactions,
        filters = {},
    } = useSelector((state) => state.StockInventory ?? {});

    const periodDays = useMemo(() => {
        if (kpiSalesPeriodDays && kpiSalesPeriodDays > 1) {
            return kpiSalesPeriodDays;
        }
        if (filters?.startDate && filters?.endDate) {
            return getPeriodDays(filters.startDate, filters.endDate);
        }
        return 1;
    }, [kpiSalesPeriodDays, filters?.startDate, filters?.endDate]);

    const chartData = useMemo(() => {
        // If caller explicitly passed props, respect them (e.g. storybook / tests / overrides)
        if (propCategories && propStock && propSales) {
            return {
                categories: propCategories,
                stock: propStock,
                sales: propSales,
                rawStock: [],
                rawDailySales: [],
                daysCover: [],
            };
        }

        if (!totalStockValueByBranch.length && !kpiSalesTransactions.length) {
            return {
                categories: [],
                stock: [],
                sales: [],
                rawStock: [],
                rawDailySales: [],
                daysCover: [],
            };
        }

        return transformStockVsSalesVelocity(totalStockValueByBranch, kpiSalesTransactions, periodDays);
    }, [propCategories, propStock, propSales, totalStockValueByBranch, kpiSalesTransactions, periodDays]);

    const series = useMemo(() => [
        {
            name: "Stock Value (KES M)",
            type: "column",
            data: chartData.stock,
        },
        {
            name: "Daily Sales (KES M)",
            type: "line",
            data: chartData.sales,
        },
    ], [chartData.stock, chartData.sales]);

    const options = useMemo(() => ({
        chart: {
            height,
            stacked: false,
            toolbar: {
                show: false,
            },
        },

        colors: ["#405189", "#0ab39c"],

        stroke: {
            width: [0, 3],
            curve: "smooth",
        },

        plotOptions: {
            bar: {
                columnWidth: "45%",
                borderRadius: 4,
            },
        },

        fill: {
            opacity: [0.85, 1],
        },

        dataLabels: {
            enabled: false,
        },

        xaxis: {
            categories: chartData.categories,
            labels: {
                rotate: -45,
                rotateAlways: chartData.categories.length > 5,
                style: {
                    fontSize: "11px",
                },
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },

        yaxis: [
            {
                title: {
                    text: "Stock Value (KES M)",
                    style: {
                        color: "#405189",
                        fontWeight: 600,
                    },
                },
                labels: {
                    formatter: (val) => (val != null ? `${Number(val).toFixed(1)}M` : ""),
                },
            },
            {
                opposite: true,
                title: {
                    text: "Daily Sales (KES M)",
                    style: {
                        color: "#0ab39c",
                        fontWeight: 600,
                    },
                },
                labels: {
                    formatter: (val) => {
                        if (val == null) return "";
                        const num = Number(val);
                        if (num === 0) return "0";
                        if (num >= 0.01) return `${num.toFixed(2)}M`;
                        if (num >= 0.001) return `${num.toFixed(3)}M`;
                        return `${num.toFixed(4)}M`;
                    },
                },
            },
        ],

        legend: {
            position: "top",
            horizontalAlign: "right",
        },

        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val, opts) => {
                    if (val === undefined || val === null) return "";
                    const dataIndex = opts?.dataPointIndex;
                    const seriesIndex = opts?.seriesIndex;

                    if (seriesIndex === 0) {
                        const raw = chartData.rawStock?.[dataIndex];
                        if (raw !== undefined) {
                            return `KES ${raw.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })} (${Number(val).toFixed(2)}M)`;
                        }
                        return `${Number(val).toFixed(2)}M`;
                    }

                    if (seriesIndex === 1) {
                        const raw = chartData.rawDailySales?.[dataIndex];
                        const days = chartData.daysCover?.[dataIndex];
                        const coverInfo = days !== undefined
                            ? ` [${days > 365 ? ">1 year cover" : `${days} days cover`}]`
                            : "";

                        if (raw !== undefined) {
                            let formattedVal = Number(val).toFixed(2);
                            if (Number(val) > 0 && Number(val) < 0.01) {
                                formattedVal = Number(val) < 0.0001 ? Number(val).toFixed(6) : Number(val).toFixed(4);
                            }
                            return `KES ${raw.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}/day (${formattedVal}M)${coverInfo}`;
                        }
                        return `${val}M${coverInfo}`;
                    }

                    return val?.toString() ?? "";
                },
            },
        },

        grid: {
            borderColor: "rgba(0,0,0,0.08)",
        },
    }), [height, chartData.categories, chartData.rawStock, chartData.rawDailySales, chartData.daysCover]);

    const isLoading = loadingTotalStockValueByBranch || loadingKPISalesTransactions;

    if (isLoading && !chartData.categories.length) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center py-5 my-3"
                style={{ height: `${height}px` }}
            >
                <Spinner color="primary" className="mb-3"> Loading... </Spinner>
                <div className="text-muted fw-semibold">Loading stock vs sales velocity...</div>
            </div>
        );
    }

    if (!chartData.categories.length) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center py-5 my-3 text-center"
                style={{ height: `${height}px` }}
            >
                <i className="ri-bar-chart-line text-muted display-4 mb-2"></i>
                <div className="text-muted fw-medium">No stock vs sales velocity data available</div>
                <small className="text-muted">No branch transactions or stock recorded for the selected period.</small>
            </div>
        );
    }

    return (
        <div className="position-relative">
            <ReactApexChart
                dir="ltr"
                className="apex-charts"
                options={options}
                series={series}
                type="line"
                height={height}
            />
            {kpiSalesIsBaseline && (
                <div className="text-end text-muted pe-2 pb-1" style={{ fontSize: "11px" }}>
                    <i className="ri-information-line me-1"></i>
                    Daily sales velocity computed from baseline transactions history
                </div>
            )}
        </div>
    );
};

export default BarChartThree;