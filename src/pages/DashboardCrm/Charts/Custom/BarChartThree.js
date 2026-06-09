import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

const BRANCHES = [
    'WAREHOUSE', 'TESTING', 'MAIN', 'KAMPALA', 'CENTRAL',
    'WESTLANDS', 'MOMBASA', 'WAJIR', 'KAKAMEGA', 'TEST BRANCH',
];

const DEFAULT_STOCK   = [8400, 3100, 6200, 3100, 5500, 4800, 2200,  900, 1400,  600];
const DEFAULT_SALES   = [ 247,   91,  221,  113,  183,  226,   88,   98,  116,   50];
const COVER_COLORS    = (v) =>
    v < 10 ? '#f06548' : v < 21 ? '#f7b84b' : v <= 30 ? '#0ab39c' : '#405189';

const BarChartThree = ({
    height      = 420,
    stockUnits  = DEFAULT_STOCK,
    avgDailySales = DEFAULT_SALES,
}) => {
    const daysOfCover = useMemo(
        () => stockUnits.map((s, i) => (avgDailySales[i] > 0 ? Math.round(s / avgDailySales[i]) : 0)),
        [stockUnits, avgDailySales],
    );

    const coverPointColors = useMemo(
        () => daysOfCover.map(COVER_COLORS),
        [daysOfCover],
    );

    const series = [
        {
            name: 'Stock on hand',
            type: 'bar',
            data: stockUnits,
        },
        {
            name: 'Avg daily sales',
            type: 'bar',
            data: avgDailySales,
        },
        {
            name: 'Days of cover',
            type: 'line',
            data: daysOfCover,
        },
    ];

    const options = useMemo(() => ({
        chart: {
            type: 'line',
            height,
            toolbar: { show: false },
            animations: { enabled: true },
        },
        stroke: {
            width: [0, 0, 2.5],
            curve: 'smooth',
        },
        plotOptions: {
            bar: {
                columnWidth: '55%',
                borderRadius: 3,
            },
        },
        colors: ['#405189', '#0ab39c', '#f7b84b'],
        fill: {
            opacity: [0.85, 0.85, 1],
        },
        markers: {
            size: [0, 0, 6],
            colors: ['#fff'],
            strokeColors: coverPointColors,
            strokeWidth: 2,
            hover: { size: 8 },
            discrete: daysOfCover.map((val, idx) => ({
                seriesIndex: 2,
                dataPointIndex: idx,
                fillColor: COVER_COLORS(val),
                strokeColor: '#fff',
                size: 6,
            })),
        },
        xaxis: {
            categories: BRANCHES,
            labels: {
                rotate: -30,
                style: { fontSize: '11px' },
            },
            axisBorder: { show: false },
            axisTicks:  { show: false },
        },
        yaxis: [
            {
                seriesName: 'Stock on hand',
                title: {
                    text: 'Units',
                    style: { fontSize: '11px', color: '#878a99' },
                },
                labels: {
                    formatter: (v) => `${Math.round(v / 1000)}k`,
                    style: { fontSize: '11px' },
                },
            },
            {
                seriesName: 'Avg daily sales',
                show: false,
            },
            {
                seriesName: 'Days of cover',
                opposite: true,
                title: {
                    text: 'Days of cover',
                    style: { fontSize: '11px', color: '#f7b84b' },
                },
                labels: {
                    formatter: (v) => `${Math.round(v)}d`,
                    style: { fontSize: '11px', colors: '#f7b84b' },
                },
                min: 0,
            },
        ],
        annotations: {
            yaxis: [
                {
                    y: 21,
                    y2: 30,
                    yAxisIndex: 2,
                    fillColor: '#0ab39c',
                    opacity: 0.07,
                    label: {
                        text: 'Target zone',
                        position: 'right',
                        style: { color: '#0ab39c', fontSize: '10px', background: 'transparent' },
                    },
                },
                {
                    y: 10,
                    yAxisIndex: 2,
                    borderColor: '#f06548',
                    borderWidth: 2,
                    strokeDashArray: 4,
                    label: {
                        text: 'Critical',
                        position: 'left',
                        style: { color: '#fff', background: '#f06548', fontSize: '10px' },
                    },
                },
            ],
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.08)',
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'left',
            markers: { radius: 2 },
            fontSize: '12px',
        },
        tooltip: {
            theme: 'dark',
            shared: true,
            intersect: false,
            y: [
                { formatter: (v) => `${Math.round(v).toLocaleString()} units` },
                { formatter: (v) => `${Math.round(v).toLocaleString()} units/day` },
                { formatter: (v) => `${Math.round(v)} days` },
            ],
        },
        dataLabels: { enabled: false },
    }), [height, coverPointColors, daysOfCover]);

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