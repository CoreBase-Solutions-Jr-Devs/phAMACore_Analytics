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

const BarChartThree = ({
    height = 420,
    categories = [],
    values = [],
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
            name: "Stock Value",
            data: values,
        },
    ];

    const options = useMemo(
        () => ({
            chart: {
                type: "bar",
                height,
                toolbar: { show: false },
            },

            plotOptions: {
                bar: {
                    horizontal: true, // Branches on Y-axis
                    borderRadius: 4,
                    dataLabels: {
                        position: "right",
                    },
                },
            },

            xaxis: {
                labels: {
                    show: false,
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
                    show: true,
                },
            },

            grid: {
                show: false,
            },

            legend: {
                show: false,
            },

            tooltip: {
                y: {
                    formatter: (val) => val?.toLocaleString(),
                },
            },

            dataLabels: {
                enabled: true,
                formatter: (val) => val?.toLocaleString(),
            },

            xaxis: {
                categories,
            },
        }),
        [height, categories]
    );

    return (
        <ReactApexChart
            dir="ltr"
            className="apex-charts"
            options={options}
            series={series}
            type="bar"
            height={height}
        />
    );
};

export default BarChartThree;