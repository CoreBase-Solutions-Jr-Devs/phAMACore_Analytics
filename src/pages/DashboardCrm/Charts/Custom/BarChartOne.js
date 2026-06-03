import React from 'react';
import ReactApexChart from 'react-apexcharts';

/**
 * BarChartOne — Critical Stock Levels (MUST-NOT STOCKOUT items)
 *
 * Props:
 *   categories  {string[]}  Item names (sorted ascending by days cover)
 *   data        {number[]}  Days of cover per item
 *   colors      {string[]}  Per-bar hex colors (zone-coded: red/amber/green)
 *   reorderLine {number}    X-axis annotation value (default 6)
 *   height      {number}    Chart height in px (default 350)
 */
const BarChartOne = ({
    categories = [],
    data = [],
    colors = [],
    reorderLine = 6,
    height = 350,
}) => {
    // Fallback static data — mirrors the screenshot for dev/preview
    const resolvedCategories = categories.length ? categories : [
        'ARVs(Tenofovir)', 'Amoxicillin 500mg', 'Co-Artem 20/120 mg',
        'ORS Satchets', 'Metformin 500mg', 'Insulin Actrapid',
        'Paracetamol 500mg', 'Omeprazole 20mg', 'Ciproflaxin 250', 'Brufen',
    ];
    const resolvedData = data.length
        ? data
        : [2.2, 3.4, 4.1, 5.6, 6.3, 7.7, 11.9, 14.2, 18.9, 22.6];

    // Zone-coded colors — fallback derives from data values
    const resolvedColors = colors.length
        ? colors
        : resolvedData.map((v) => {
            if (v <= 6)  return '#f06548';
            if (v <= 14) return '#f7b84b';
            return '#0ab39c';
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
        // Reorder threshold vertical line annotation
        annotations: {
            xaxis: [
                {
                    x: reorderLine,
                    borderColor: '#c58c4f',
                    borderWidth: 2,
                    strokeDashArray: 4,
                    label: {
                        borderColor: '#c58c4f',
                        style: {
                            color: '#fff',
                            background: '#c58c4f',
                            fontSize: '11px',
                        },
                        text: `Reorder @ ${reorderLine}d`,
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
            text: 'Live stock VS Safety Minimum - Days of Cover Remaining',
            align: 'left',
            floating: false,
            style: { fontWeight: 500, fontSize: '13px' },
        },
        subtitle: {
            text: 'Vertical line - reorder threshold(25% = 6 days of cover.) Red zone - stockout risk. Amber zone - stockout warning. Green zone - safe stock levels.',
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

export default BarChartOne;