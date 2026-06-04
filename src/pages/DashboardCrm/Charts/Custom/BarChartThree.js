import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BRANCHES = [
    'WAREHOUSE', 'TESTING', 'MAIN', 'KAMPALA', 'CENTRAL',
    'WESTLANDS', 'MOMBASA', 'WAJIR', 'KAKAMEGA', 'TEST BRANCH',
];
const DEFAULT_DATA = [34, 31, 28, 27, 22, 19, 15, 12, 9, 6];

const ZONE_COLOR = (v) => {
    if (v < 10) return '#f06548';
    if (v < 21) return '#f7b84b';
    if (v <= 30) return '#0ab39c';
    return '#405189';
};

const BarChartThree = ({ height = 420 }) => {
    const resolvedColors = DEFAULT_DATA.map(ZONE_COLOR);

    const axisMax = Math.ceil(Math.max(...DEFAULT_DATA) * 1.30);

    const pointAnnotations = DEFAULT_DATA.map((val, i) => ({
        x: axisMax,
        y: BRANCHES[i],
        marker: { size: 0 },
        label: {
            text: `${Math.round(val)} days`,
            textAnchor: 'end',
            offsetX: -4,
            offsetY: 5,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: ZONE_COLOR(val),
            style: {
                background: 'transparent',
                color: ZONE_COLOR(val),
                fontSize: '11px',
                fontWeight: 700,
                padding: { top: 3, bottom: 3, left: 8, right: 8 },
            },
        },
    }));

    const series = [{ data: DEFAULT_DATA }];

    const options = {
        chart: {
            type: 'bar',
            height,
            toolbar: { show: false },
            animations: { enabled: true },
        },
        plotOptions: {
            bar: {
                barHeight: '45%',
                distributed: true,
                horizontal: true,
                dataLabels: { position: 'top' },
            },
        },
        colors: resolvedColors,
        dataLabels: { enabled: false },
        stroke: { width: 1, colors: ['transparent'] },
        annotations: {
            xaxis: [
                {
                    x: 21,
                    x2: 30,
                    fillColor: '#0ab39c',
                    opacity: 0.07,
                    label: {
                        text: 'Target zone',
                        position: 'top',
                        style: {
                            color: '#0ab39c',
                            fontSize: '10px',
                            background: 'transparent',
                            border: 'none',
                        },
                        offsetY: 4,
                    },
                },
                {
                    x: 10,
                    borderColor: '#f06548',
                    borderWidth: 2,
                    strokeDashArray: 4,
                    label: {
                        text: 'Critical',
                        style: { color: '#fff', background: '#f06548', fontSize: '10px' },
                        position: 'top',
                        orientation: 'horizontal',
                        offsetY: -4,
                    },
                },
            ],
            points: pointAnnotations,
        },
        xaxis: {
            min: 0,
            max: axisMax,
            categories: BRANCHES,
            labels: {
                formatter: (val) => `${Math.round(val)}d`,
                style: { fontSize: '11px' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                show: true,
                align: 'left',
                maxWidth: 130,
                style: { fontSize: '12px', fontWeight: 500 },
                offsetX: -10,
            },
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.08)',
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } },
        },
        legend: { show: false },
        title: {
            text: 'Stock vs. sales velocity — branch coverage ratio',
            align: 'left',
            style: { fontWeight: 600, fontSize: '13px' },
        },
        subtitle: {
            text: 'Target: 21–30 days cover. Below 10 = critical replenishment needed.',
            align: 'left',
            style: { fontSize: '11px', color: '#878a99' },
        },
        tooltip: {
            theme: 'dark',
            x: { show: true },
            y: {
                formatter: (val) => `${Math.round(val)} days of cover`,
                title: {
                    formatter: (seriesName, opts) =>
                        BRANCHES[opts?.dataPointIndex] ?? seriesName,
                },
            },
        },
    };

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