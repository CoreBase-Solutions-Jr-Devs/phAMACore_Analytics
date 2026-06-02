import React from 'react';
import ReactApexChart from 'react-apexcharts';

/**
 * BarChartThree — Stock VS Sales Velocity (Branch Coverage Ratio)
 */

// Sorted DESCENDING manually (by value)
const BRANCHES = ['WAREHOUSE','TESTING','MAIN','KAMPALA','CENTRAL','WESTLANDS','MOMBASA','WAJIR','KAKAMEGA','TEST BRANCH'];

// Matching data (same order as branches above)
const DEFAULT_DATA = [34,31,28,27,22,19,15,12,9,6];

// Zone coloring (still dynamic, but simple)
const ZONE_COLOR = (v) => {
    if (v < 10) return '#f06548';
    if (v < 21) return '#f7b84b';
    if (v <= 30) return '#0ab39c';
    return '#405189';
};

const BarChartThree = ({ height = 350 }) => {

    const resolvedCategories = BRANCHES;
    const resolvedData = DEFAULT_DATA;
    const resolvedColors = resolvedData.map(ZONE_COLOR);

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
            },
        },
        colors: resolvedColors,
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
        annotations: {
            xaxis: [
                {
                    x: 21,
                    x2: 30,
                    fillColor: '#0ab39c',
                    opacity: 0.07,
                    label: {
                        text: 'Target zone',
                        style: {
                            color: '#0ab39c',
                            fontSize: '10px',
                            background: 'transparent',
                        },
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
                    },
                },
            ],
        },
        xaxis: {
            categories: resolvedCategories,
            labels: {
                formatter: (val) => `${val}d`,
            },
        },
        yaxis: {
            labels: { show: false },
        },
        legend: { show: false },
        title: {
            text: 'Stock Value by Sales Velocity',
            align: 'left',
            style: { fontWeight: 500, fontSize: '13px' },
        },
        subtitle: {
            text: 'Target: 21–30 days cover. Below 10 = critical replenishment needed.',
            align: 'left',
            style: { fontSize: '11px', color: '#878a99' },
        },
        tooltip: {
            theme: 'dark',
            x: { show: false },
            y: {
                formatter: (val) => `${val} days of cover`,
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