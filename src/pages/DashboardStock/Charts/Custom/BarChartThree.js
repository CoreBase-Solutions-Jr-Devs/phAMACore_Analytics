import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

const BRANCHES = [
    'WAREHOUSE', 'TESTING', 'MAIN', 'KAMPALA', 'CENTRAL',
    'WESTLANDS', 'MOMBASA', 'WAJIR', 'KAKAMEGA', 'TEST BRANCH',
];

// const DEFAULT_STOCK   = [8400, 3100, 6200, 3100, 5500, 4800, 2200,  900, 1400,  600];
// const DEFAULT_SALES   = [ 247,   91,  221,  113,  183,  226,   88,   98,  116,   50];
// const COVER_COLORS    = (v) =>
//     v < 10 ? '#f06548' : v < 21 ? '#f7b84b' : v <= 30 ? '#0ab39c' : '#405189';

const DEFAULT_BRANCHES = [ "WAREHOUSE", "MAIN", "CENTRAL", "WESTLANDS BRANCH", "THIKA BRANCH", "MOMBASA BRANCH", "KAMPALA BRANCH", "KAKAMEGA BRANCH", "WAJIR BRANCH", "Testing", "Test Branch"];
const DEFAULT_STOCK = [152, 185, 128, 97, 91, 79, 64, 49, 23, 8, 5];
const DEFAULT_SALES = [4.0, 6.0, 4.9, 4.4, 4.6, 4.9, 4.9, 4.9, 3.3, 2.0, 2.5];

const BarChartThree = ({
    height = 420,
    categories = DEFAULT_BRANCHES,
    stock = DEFAULT_STOCK,
    sales = DEFAULT_SALES,
}) => {
    // const daysOfCover = useMemo(
    //     () => stockUnits.map((s, i) => (avgDailySales[i] > 0 ? Math.round(s / avgDailySales[i]) : 0)),
    //     [stockUnits, avgDailySales],
    // );

    // const coverPointColors = useMemo(
    //     () => daysOfCover.map(COVER_COLORS),
    //     [daysOfCover],
    // );

    const series = [
        {
            name: "Stock Value (KES M)",
            type: "column",
            data: stock,
        },
        {
            name: "Daily Sales (KES M)",
            type: "line",
            data: sales,
        },
    ];

    const options = useMemo(() => ({
        chart: {
            height,
            stacked: false,
            toolbar: {
                show: false,
            },
        },

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

        dataLabels: {
            enabled: false,
        },

        xaxis: {
            categories,
        },

        yaxis: [
            {
                title: {
                    text: "Stock Value (KES M)",
                },
            },
            {
                opposite: true,
                title: {
                    text: "Daily Sales (KES M)",
                },
            },
        ],

        legend: {
            position: "top",
        },

        tooltip: {
            shared: true,
            intersect: false,
        },

        grid: {
            borderColor: "#f1f1f1",
        },
    }), [height, categories]);

    return (
        <ReactApexChart
            dir="ltr"
            className="apex-charts"
            options={options}
            series={series}
            type="line"
            height={height}
        />
    );
};

export default BarChartThree;