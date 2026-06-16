import React from 'react';
import ReactApexChart from 'react-apexcharts';

/**
 * BarChartTwo — Stock Value by Branch (KES Millions)
 *
 * RHS label technique: point annotations at x = axisMax so every
 * label lands at the same right-wall position in data-unit coordinates.
 */

const BRANCHES = ['MAIN', 'CENTRAL', 'MOMBASA', 'WESTLANDS', 'KAMPALA', 'WAREHOUSE', 'KAKAMEGA', 'WAJIR', 'TEST BRANCH', 'TESTING'];
const DEFAULT_DATA = [14.2, 10.5, 8.8, 7.8, 6.1, 5.4, 3.6, 2.9, 1.7, 1.2];

const BRANCH_COLORS = {
    MAIN: '#405189',
    CENTRAL: '#4b9fd4',
    WESTLANDS: '#0ab39c',
    WAREHOUSE: '#299cdb',
    MOMBASA: '#2a9d8f',
    KAKAMEGA: '#e76f51',
    WAJIR: '#f4a261',
    KAMPALA: '#8e44ad',
    'TEST BRANCH': '#f7b84b',
    TESTING: '#f06548',
};

const FALLBACK_PALETTE = ['#405189', '#4b9fd4', '#0ab39c', '#299cdb', '#f7b84b', '#f06548'];

const BarChartTwo = () => {
    const colors = BRANCHES.map((name, i) => {
        const key = name.toUpperCase().trim();
        return BRANCH_COLORS[key] || FALLBACK_PALETTE[i % FALLBACK_PALETTE.length];
    });

    const axisMax = Math.ceil(Math.max(...DEFAULT_DATA) * 1.30);

    const pointAnnotations = DEFAULT_DATA.map((val, i) => ({
        x: axisMax,
        y: BRANCHES[i],
        marker: { size: 0 },
        label: {
            text: `${parseFloat(val).toFixed(2)}M`,
            textAnchor: 'end',
            offsetX: -4,
            offsetY: 5,
            borderWidth: 0,
            style: {
                background: 'transparent',
                color: colors[i],
                fontSize: '12px',
                fontWeight: 700,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
            },
        },
    }));

    const series = [{ data: DEFAULT_DATA }];

    const options = {
        chart: {
            type: 'bar',
            height: 380,
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
        colors,
        dataLabels: { enabled: false },
        stroke: { width: 1, colors: ['transparent'] },
        annotations: {
            points: pointAnnotations,
        },
        xaxis: {
            min: 0,
            max: axisMax,
            categories: BRANCHES,
            labels: {
                formatter: (val) => `${Math.round(val)}M`,
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
            text: 'Stock value by branch (KES)',
            align: 'left',
            style: { fontWeight: 600, fontSize: '13px' },
        },
        subtitle: {
            text: 'Branch stock distribution overview across all operational locations.',
            align: 'left',
            style: { fontSize: '11px', color: '#878a99' },
        },
        tooltip: {
            theme: 'dark',
            x: { show: true },
            y: {
                formatter: (val) => `KES ${parseFloat(val).toFixed(2)}M`,
                title: {
                    formatter: (seriesName, opts) =>
                        BRANCHES[opts?.dataPointIndex] ?? seriesName,
                },
            },
        },
    };

    return (
        <ReactApexChart
            className="apex-charts"
            options={options}
            series={series}
            type="bar"
            height={380}
        />
    );
};

export default BarChartTwo;