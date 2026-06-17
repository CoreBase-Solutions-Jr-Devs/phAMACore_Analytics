import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";

const BRANCH_COLORS = { MAIN: "#405189", CENTRAL: "#4b9fd4", WESTLANDS: "#0ab39c", WAREHOUSE: "#299cdb", MOMBASA: "#2a9d8f", KAKAMEGA: "#e76f51", WAJIR: "#f4a261", KAMPALA: "#8e44ad" };

const FALLBACK_PALETTE = [ "#405189", "#4b9fd4", "#0ab39c", "#299cdb", "#f7b84b", "#f06548"];

const BarChartTwo = () => {
    const { dailyClosingStock, loadingStock } = useSelector(
        (state) => state.StockInventory
    );

    const chartData = useMemo(() => {
        if (!dailyClosingStock?.length) {
            return {
                branches: [],
                values: [],
            };
        }

        const branchTotals = dailyClosingStock.reduce((acc, item) => {
            const branch = item.branch_Name || "Unknown";
            const value = Number(item.closing_value || 0);
            acc[branch] = (acc[branch] || 0) + value;

            return acc;
        }, {});

        const sorted = Object.entries(branchTotals)
            .map(([branch, value]) => ({
                branch,
                value: value / 1000000,
            }))
            .sort((a, b) => b.value - a.value);

        return {
            branches: sorted.map((x) => x.branch),
            values: sorted.map((x) => Number(x.value.toFixed(2))),
        };
    }, [dailyClosingStock]);

    const colors = chartData.branches.map((branch, i) => {
        const key = branch.toUpperCase().trim();
        return BRANCH_COLORS[key] || FALLBACK_PALETTE[i % FALLBACK_PALETTE.length];
    });

    const axisMax =
        chartData.values.length > 0
            ? Math.ceil(Math.max(...chartData.values) * 1.3)
            : 10;

    const pointAnnotations = chartData.values.map((val, i) => ({
        x: axisMax,
        y: chartData.branches[i],
        marker: { size: 0 },
        label: {
            text: `${val.toFixed(2)}M`,
            textAnchor: "end",
            offsetX: -4,
            offsetY: 5,
            borderWidth: 0,
            style: {
                background: "transparent",
                color: colors[i],
                fontSize: "12px",
                fontWeight: 700,
            },
        },
    }));

    const options = {
        chart: {
            type: "bar",
            height: 380,
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                barHeight: "45%",
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
            categories: chartData.branches,
            labels: {
                formatter: (val) => `${Math.round(val)}M`,
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
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
                formatter: (val) =>
                    `KES ${(val * 1000000).toLocaleString()}`,
            },
        },
    };

    const series = [
        {
            data: chartData.values,
        },
    ];

    if (loadingStock) {
        return (
            <div className="text-center py-5">
                Loading branch stock values...
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