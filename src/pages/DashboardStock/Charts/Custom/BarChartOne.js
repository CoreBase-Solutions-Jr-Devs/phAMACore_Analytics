import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BarChartOne = ({
    categories = [],
    data = [],
    colors = [],
    reorderLine = 6,
    height = 380,
}) => {
    const resolvedCategories = categories.length ? categories : [
        'ARVs (Tenofovir)', 'Amoxicillin 500mg', 'Co-Artem 20/120mg',
        'ORS Sachets', 'Metformin 500mg', 'Insulin Actrapid',
        'Paracetamol 500mg', 'Omeprazole 20mg', 'Ciprofloxacin 250', 'Brufen',
    ];
    const resolvedData = data.length
        ? data
        : [2.2, 3.4, 4.1, 5.6, 6.3, 7.7, 11.9, 14.2, 18.9, 22.6];

    const resolvedColors = colors.length
        ? colors
        : resolvedData.map((v) => {
            if (v <= 6)  return '#f06548';
            if (v <= 14) return '#f7b84b';
            return '#0ab39c';
        });

    const axisMax =
    resolvedData.length > 0
        ? Math.ceil(Math.max(...resolvedData) * 1.3)
        : 10;

    const pointAnnotations = resolvedData.map((val, i) => ({
        x: axisMax,
        y: resolvedCategories[i],
        marker: { size: 0 },
        label: {
            text: `${parseFloat(val).toFixed(2)}d`,
            textAnchor: 'end',
            offsetX: -4,
            offsetY: 5,
            borderWidth: 0,
            style: {
                background: 'transparent',
                color: resolvedColors[i],
                fontSize: '12px',
                fontWeight: 700,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
            },
        },
    }));

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
                    x: reorderLine,
                    borderColor: '#c58c4f',
                    borderWidth: 2,
                    strokeDashArray: 4,
                    label: {
                        borderColor: '#c58c4f',
                        style: { color: '#fff', background: '#c58c4f', fontSize: '10px' },
                        text: `Reorder @ ${reorderLine}d`,
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
            categories: resolvedCategories,
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
                maxWidth: 160,
                style: { fontSize: '12px', fontWeight: 500 },
                offsetX: -5,
            },
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.08)',
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } },
        },
        legend: { show: false },
        title: {
            text: 'Live stock vs. safety minimum — days of cover remaining',
            align: 'left',
            style: { fontWeight: 600, fontSize: '13px' },
        },
        subtitle: {
            text: 'Vertical line = reorder threshold (25% = 6-day cover). Red zone = critical. Amber = reorder now. Green = safe stock.',
            align: 'left',
            style: { fontSize: '11px', color: '#878a99' },
        },
        tooltip: {
            theme: 'dark',
            x: { show: true },
            y: {
                formatter: (val) => `${parseFloat(val).toFixed(2)} days of cover`,
                title: {
                    formatter: (seriesName, opts) =>
                        resolvedCategories[opts?.dataPointIndex] ?? seriesName,
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

export default BarChartOne;