import React from 'react';
import ReactApexChart from 'react-apexcharts';

/**
 * BarChartThree — Stock VS Sales Velocity (Branch Coverage Ratio)
 *
 * Props:
 *   categories {string[]}  Branch names (sorted descending by days cover)
 *   data       {number[]}  Days of stock cover per branch
 *   colors     {string[]}  Per-bar zone colors (red/amber/green/blue)
 *   height     {number}    Chart height in px (default 350)
 *
 * Zone logic (matches subtitle):
 *   < 10 days  → red   (critical replenishment)
 *   10–20 days → amber (warning)
 *   21–30 days → green (target)
 *   > 30 days  → blue  (overstocked risk)
 */
const BarChartThree = ({
    categories = [],
    data = [],
    colors = [],
    height = 350,
}) => {
    // Fallback static data — mirrors screenshot
    const resolvedCategories = categories.length
        ? categories
        : ['Thika', 'Nairobi CBD', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
    const resolvedData = data.length
        ? data
        : [31, 28, 25, 17, 13, 5];

    const resolvedColors = colors.length
        ? colors
        : resolvedData.map((v) => {
            if (v < 10) return '#f06548';
            if (v < 21) return '#f7b84b';
            if (v <= 30) return '#0ab39c';
            return '#405189';
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
        // Target zone shading — highlight the 21–30 day band
        annotations: {
            xaxis: [
                {
                    x: 21,
                    x2: 30,
                    fillColor: '#0ab39c',
                    opacity: 0.07,
                    label: {
                        borderColor: 'transparent',
                        style: {
                            color: '#0ab39c',
                            background: 'transparent',
                            fontSize: '10px',
                        },
                        text: 'Target zone',
                        position: 'top',
                        orientation: 'horizontal',
                    },
                },
                {
                    x: 10,
                    borderColor: '#f06548',
                    borderWidth: 2,
                    strokeDashArray: 4,
                    label: {
                        borderColor: '#f06548',
                        style: {
                            color: '#fff',
                            background: '#f06548',
                            fontSize: '10px',
                        },
                        text: 'Critical',
                        position: 'top',
                        orientation: 'horizontal',
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
            floating: false,
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

export default BarChartThree;