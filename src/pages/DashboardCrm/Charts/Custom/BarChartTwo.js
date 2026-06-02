import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BRANCHES = [ 'MAIN', 'CENTRAL', 'MOMBASA', 'WESTLANDS', 'KAMPALA', 'WAREHOUSE', 'KAKAMEGA', 'WAJIR', 'TEST BRANCH', 'TESTING'];

// Matching sorted values
const DEFAULT_DATA = [ 14.2, 10.5, 8.8, 7.8, 6.1, 5.4, 3.6, 2.9, 1.7, 1.2];

// Branch color mapping
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

    const series = [{ data: DEFAULT_DATA }];

    const colors = BRANCHES.map((name, i) => {
        const key = name.toUpperCase().trim();
        return BRANCH_COLORS[key] || FALLBACK_PALETTE[i % FALLBACK_PALETTE.length];
    });

    const options = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            animations: { enabled: true },
        },
        plotOptions: {
            bar: {
                barHeight: '80%',
                distributed: true,
                horizontal: true,
            },
        },
        colors,
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: {
                colors: ['#fff'],
                fontWeight: 600,
                fontSize: '12px',
            },
            formatter: (val, opt) =>
                `${opt.w.globals.labels[opt.dataPointIndex]}: ${val}`,
        },
        stroke: {
            width: 1,
            colors: ['#fff'],
        },
        xaxis: {
            categories: BRANCHES,
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
            style: { fontWeight: 500, fontSize: '13px' },
        },
        subtitle: {
            text: 'Branch stock distribution overview across all operational locations.',
            align: 'left',
            style: { fontSize: '11px', color: '#878a99' },
        },
        tooltip: {
            theme: 'dark',
            x: { show: false },
            y: {
                formatter: (val) => `KES ${val}M`,
            },
        },
    };

    return (
        <ReactApexChart
            className="apex-charts"
            options={options}
            series={series}
            type="bar"
            height={350}
        />
    );
};

export default BarChartTwo;