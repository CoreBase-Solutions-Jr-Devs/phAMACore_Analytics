import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";
import { Spinner } from "reactstrap";

const BRANCH_COLORS = { MAIN: "#405189", CENTRAL: "#4b9fd4", WESTLANDS: "#0ab39c", "WESTLANDS BRANCH": "#0ab39c", WAREHOUSE: "#299cdb", MOMBASA: "#2a9d8f", "MOMBASA BRANCH": "#2a9d8f", KAKAMEGA: "#e76f51", "KAKAMEGA BRANCH": "#e76f51", WAJIR: "#f4a261", "WAJIR BRANCH": "#f4a261", KAMPALA: "#8e44ad", "KAMPALA BRANCH": "#8e44ad", THIKA: "#f7b84b", "THIKA BRANCH": "#f7b84b", TESTING: "#556ee6", "TEST BRANCH": "#34c38f" };

const FALLBACK_PALETTE = [ "#405189", "#4b9fd4", "#0ab39c", "#299cdb", "#f7b84b", "#f06548", "#8e44ad", "#e76f51", "#556ee6"];

const resolveBranchColor = (branch, index) => {
    if (!branch) return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
    const key = branch.toUpperCase().trim();
    const shortKey = key.replace(/\s+BRANCH$/, "").trim();
    return (
        BRANCH_COLORS[key] || BRANCH_COLORS[shortKey] || FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
    );
};

const BarChartTwo = () => {
    const {
        totalStockValueByBranch = [],
        loadingTotalStockValueByBranch,
    } = useSelector((state) => state.StockInventory);

    const chartData = useMemo(() => {
        if (!totalStockValueByBranch || !totalStockValueByBranch.length) {
            return {
                branches: [],
                values: [],
                rawValues: [],
            };
        }

        const sorted = [...totalStockValueByBranch]
            .map((item) => {
                const branch =
                    item.branch_name || item.branchName ||
                    `Branch ${item.branch_id ?? ""}`;
                const rawValue = Number(item.total_stock_value || 0);
                return {
                    branch,
                    value: rawValue / 1000000,
                    rawValue,
                };
            })
            .sort((a, b) => b.value - a.value);

        return {
            branches: sorted.map((x) => x.branch),
            values: sorted.map((x) => Number(x.value.toFixed(2))),
            rawValues: sorted.map((x) => x.rawValue),
        };
    }, [totalStockValueByBranch]);

    const colors = chartData.branches.map((branch, i) =>
        resolveBranchColor(branch, i)
    );

    const axisMax =
        chartData.values.length > 0
            ? Math.ceil(Math.max(...chartData.values) * 1.3)
            : 10;

    const pointAnnotations = chartData.values.map((val, i) => {
        const isZero = val === 0;
        return {
            x: isZero ? 0 : axisMax,
            y: chartData.branches[i],
            marker: { size: 0 },
            label: {
                text: `${val.toFixed(2)}M`,
                textAnchor: isZero ? "start" : "end",
                offsetX: isZero ? 15 : -4,
                offsetY: 5,
                borderWidth: 0,
                style: {
                    background: "transparent",
                    color: colors[i] || "#000",
                    fontSize: "12px",
                    fontWeight: 700,
                },
            },
        };
    });

    const isSingleBranch = chartData.branches.length === 1;

    const options = {
        chart: {
            type: "bar",
            height: 380,
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                barHeight: isSingleBranch ? "30%" : "55%",
                distributed: true,
                horizontal: true,
            },
        },
        colors,
        dataLabels: { enabled: false },
        annotations: {
            points: pointAnnotations,
        },
        xaxis: {
            min: 0,
            max: axisMax,
            tickAmount: 4,
            categories: chartData.branches,
            labels: {
                formatter: (val) => `${Math.round(val)}M`,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                maxWidth: 140,
            },
        },
        grid: {
            borderColor: "rgba(0,0,0,0.08)",
        },
        legend: {
            show: false,
        },
        tooltip: {
            y: {
                formatter: (val, opts) => {
                    const raw = chartData.rawValues?.[opts?.dataPointIndex];
                    if (raw !== undefined) {
                        return `KES ${raw.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`;
                    }
                    return `KES ${(val * 1000000).toLocaleString()}`;
                },
            },
        },
    };

    const series = [
        {
            name: "Stock Value",
            data: chartData.values,
        },
    ];

    if (loadingTotalStockValueByBranch) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center py-5 my-3"
                style={{ height: "380px" }}
            >
                <Spinner color="primary" className="mb-3"> {" "} Loading...{" "}</Spinner>
                <div className="text-muted fw-semibold"> Loading branch stock values...</div>
            </div>
        );
    }

    if (!chartData.branches.length) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center py-5 my-3 text-center"
                style={{ height: "380px" }}
            >
                <i className="ri-bar-chart-line text-muted display-4 mb-2"></i>
                <div className="text-muted fw-medium"> No stock value data available</div>
            </div>
        );
    }

    return (
        <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={380}
        />
    );
};

export default BarChartTwo;