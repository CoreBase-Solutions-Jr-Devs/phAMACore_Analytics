import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BarChartOne = ({
    categories = [],
    data = [],
    colors = [],
    metadata = [],
    reorderLine = 14,
    height = 440,
    paginationComponent = null,
}) => {
    const resolvedCategories = categories || [];
    const resolvedData = data || [];

    if (!resolvedCategories.length || !resolvedData.length) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center py-5 my-3 text-center"
                style={{ height: `${height}px` }}
            >
                <i className="ri-checkbox-circle-line text-success display-4 mb-2"></i>
                <div className="text-muted fw-medium">No critical stockout items found</div>
                <small className="text-muted">All monitored Class A items are within safe stock levels.</small>
            </div>
        );
    }

    const resolvedColors = colors.length
        ? colors
        : resolvedData.map((v) => {
            if (v <= 6) return '#f06548';
            if (v <= 14) return '#f7b84b';
            return '#0ab39c';
        });

    const maxVal = resolvedData.length > 0 ? Math.max(...resolvedData) : 0;
    const axisMax = Math.max(reorderLine * 1.5, Math.ceil(maxVal * 1.3), 15);

    const pointAnnotations = resolvedData.map((val, i) => ({
        x: axisMax,
        y: resolvedCategories[i],
        marker: { size: 0 },
        label: {
            text: `${parseFloat(val).toFixed(1)}d`,
            textAnchor: 'end',
            offsetX: -4,
            offsetY: 5,
            borderWidth: 0,
            style: {
                background: 'transparent',
                color: resolvedColors[i] || '#f06548',
                fontSize: '12px',
                fontWeight: 700,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
            },
        },
    }));

    const series = [{ name: "Days of Cover", data: resolvedData }];

    const dynamicHeight = Math.min(
        Math.max(260, resolvedCategories.length * 30),
        480
    );

    const options = {
        chart: {
            type: 'bar',
            height: dynamicHeight,
            toolbar: { show: false },
            animations: { enabled: true },
        },
        plotOptions: {
            bar: {
                barHeight: resolvedCategories.length <= 5 ? '35%' : '55%',
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
                maxWidth: 240,
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
        tooltip: {
            theme: 'dark',
            x: { show: true },
            y: {
                formatter: (val, opts) => {
                    const meta = metadata?.[opts?.dataPointIndex];
                    const base = `${parseFloat(val).toFixed(1)} days of cover`;
                    if (meta) {
                        const status = meta.status ? ` - ${meta.status}` : '';
                        return `${base}${status} (Stock: ${meta.stock ?? 0} | Min: ${meta.min ?? 0})`;
                    }
                    return base;
                },
                title: {
                    formatter: (seriesName, opts) =>
                        resolvedCategories[opts?.dataPointIndex] ?? seriesName,
                },
            },
        },
    };

    const legendItems = [
        {
            color: "#f06548",
            label: "Critical Stock",
        },
        {
            color: "#f7b84b",
            label: "Reorder Now",
        },
        {
            color: "#0ab39c",
            label: "Safe Stock",
        },
    ];

    return (
        <div className="critical-stock-chart-wrapper">
            <ReactApexChart
                dir="ltr"
                className="apex-charts"
                options={options}
                series={series}
                type="bar"
                height={dynamicHeight}
            />

            <div className="px-2 pt-3 mt-2 border-top">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                        <div className="text-muted small mb-1">
                            <strong>Threshold:</strong> Vertical Line = Reorder @ {reorderLine} days of cover.
                        </div>

                        <div className="d-flex flex-wrap gap-3 small">
                            {legendItems.map(({ color, label }) => (
                                <span
                                    key={label}
                                    className="d-flex align-items-center"
                                >
                                    <span
                                        className="me-2 rounded-circle"
                                        style={{
                                            width: 10,
                                            height: 10,
                                            backgroundColor: color,
                                        }}
                                    />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {paginationComponent && (
                        <div className="ms-auto d-flex align-items-center">
                            {paginationComponent}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BarChartOne;