import React from 'react';
import ReactApexChart from 'react-apexcharts';

/**
 * BarChartTwo — Stock Value By Branch
 *
 * Props:
 *   categories {string[]}  Branch names (sorted descending by value)
 *   data       {number[]}  Stock value in KES Millions per branch
 *   subtitle   {string}    Dynamic insight line (e.g. undercapitalised branch)
 *   colors     {string[]}  Optional per-bar override; defaults to theme palette
 *   height     {number}    Chart height in px (default 350)
 */

// Fixed branch palette — consistent identity per branch across all charts
const BRANCH_COLORS = {
    'MAIN':        '#405189',
    'MOMBASA':     '#4b9fd4',
    'THIKA':       '#0ab39c',
    'NAKURU':      '#299cdb',
    'KISUMU':      '#f7b84b',
    'ELDORET':     '#f06548',
};

const FALLBACK_PALETTE = [
    '#405189', '#4b9fd4', '#0ab39c', '#299cdb', '#f7b84b', '#f06548',
];

const BarChartTwo = ({
    categories = [],
    data = [],
    subtitle = '',
    colors,
    height = 350,
}) => {
    // Fallback static data — mirrors screenshot
    const resolvedCategories = categories.length
        ? categories
        : ['Nairobi CBD', 'Mombasa', 'Thika', 'Nakuru', 'Kisumu', 'Eldoret'];
    const resolvedData = data.length
        ? data
        : [14.2, 8.8, 6.0, 4.6, 3.7, 1.1];
    const resolvedSubtitle = subtitle ||
        'Eldoret critically undercapitalised VS its sales territory size.';

    // Resolve colors: use provided, else match by branch name, else fallback palette
    const resolvedColors = colors?.length
        ? colors
        : resolvedCategories.map((name, i) => {
            const key = name.toUpperCase().trim();
            return BRANCH_COLORS[key] || FALLBACK_PALETTE[i % FALLBACK_PALETTE.length];
        });

    const series = [{ data: resolvedData }];

    const options = {
        chart: {
            type: 'bar',
            height,
            toolbar: { show: false },
            animations: { enabled: true },
        },
        plotOptions: {
            bar: {
                barHeight: '80%',
                distributed: true,
                horizontal: true,
                dataLabels: { position: 'bottom' },
            },
        },
        colors: resolvedColors,
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: { colors: ['#fff'], fontWeight: 600, fontSize: '12px' },
            formatter: (val, opt) =>
                `${opt.w.globals.labels[opt.dataPointIndex]}:  ${val}`,
            offsetX: 0,
            dropShadow: { enabled: false },
        },
        stroke: {
            width: 1,
            colors: ['#fff'],
        },
        xaxis: {
            categories: resolvedCategories,
            labels: {
                formatter: (val) => `${val}M`,
            },
        },
        yaxis: {
            labels: { show: false },
        },
        legend: { show: false },
        title: {
            text: 'Value of Stock by Branch (KES Millions)',
            align: 'left',
            floating: false,
            style: { fontWeight: 500, fontSize: '13px' },
        },
        subtitle: {
            text: resolvedSubtitle,
            align: 'left',
            style: { fontSize: '11px', color: '#878a99' },
        },
        tooltip: {
            theme: 'dark',
            x: { show: false },
            y: {
                formatter: (val) => `KES ${val}M`,
                title: { formatter: () => '' },
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

export default BarChartTwo;