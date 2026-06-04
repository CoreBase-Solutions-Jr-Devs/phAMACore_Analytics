import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Badge } from 'reactstrap';

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

const BADGE_BG = (v) => {
    if (v < 10) return 'rgba(240,101,72,0.18)';
    if (v < 21) return 'rgba(247,184,75,0.18)';
    if (v <= 30) return 'rgba(10,179,156,0.18)';
    return 'rgba(64,81,137,0.18)';
};

const BarChartThree = ({ height = 420 }) => {
    const resolvedColors = DEFAULT_DATA.map(ZONE_COLOR);

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
                dataLabels: {
                    position: 'top',
                    hideOverflowingLabels: false,
                },
            },
        },
        colors: resolvedColors,
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            formatter: (val) => `${val} days`,
            style: {
                colors: DEFAULT_DATA.map(ZONE_COLOR),
                fontWeight: 700,
                fontSize: '11px',
            },
            background: {
                enabled: true,
                foreColor: undefined, // uses style.colors
                padding: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: undefined, // set per-bar via colors trick below
                opacity: 0.15,
                dropShadow: { enabled: false },
            },
            offsetX: 8,
            dropShadow: { enabled: false },
        },
        stroke: {
            width: 1,
            colors: ['transparent'],
        },
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
                        style: {
                            color: '#fff',
                            background: '#f06548',
                            fontSize: '10px',
                        },
                        position: 'top',
                        orientation: 'horizontal',
                        offsetY: -4,
                    },
                },
            ],
        },
        xaxis: {
            min: 0,
            // Extra headroom so pill badges aren't clipped
            max: Math.max(...DEFAULT_DATA) * 1.40,
            categories: BRANCHES,
            labels: {
                formatter: (val) => `${val}d`,
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
                style: {
                    fontSize: '12px',
                    fontWeight: 500,
                },
                offsetX: -10,
            },
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.06)',
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
                formatter: (val) => `${val} days of cover`,
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