import React, { useCallback, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const LEGEND_ITEMS = [
    { color: '#f06548', label: 'Critical Stock' },
    { color: '#f7b84b', label: 'Reorder Now' },
    { color: '#0ab39c', label: 'Safe Stock' },
];

const sameLayout = (a, b) =>
    a && b &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5 &&
    Math.abs(a.right - b.right) < 0.5;

const BarChartOne = ({
    categories = [],
    data = [],
    colors = [],
    metadata = [],
    reorderLine = 7,
    height = 440,
    paginationComponent = null,
}) => {
    // Plot-area geometry read back from ApexCharts, used to pin the
    // right-hand value labels to the exact centre of each bar row.
    const [layout, setLayout] = useState(null);

    const captureLayout = useCallback((chartContext) => {
        const g = chartContext?.w?.globals;
        if (!g) return;
        const next = {
            top: g.translateY,                    // top of plot area
            height: g.gridHeight,                 // height of plot area
            right: g.translateX + g.gridWidth,    // right edge of plot area (x)
        };
        setLayout((prev) => (sameLayout(prev, next) ? prev : next));
    }, []);

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

    const maxVal = Math.max(...resolvedData);
    const axisMax = Math.max(reorderLine * 3, Math.ceil(maxVal * 1.3), 15);

    const series = [{ name: 'Days of Cover', data: resolvedData }];

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
            events: {
                mounted: captureLayout,
                updated: captureLayout,
            },
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

    const rowHeight = layout ? layout.height / resolvedCategories.length : 0;

    return (
        <div className="critical-stock-chart-wrapper">
            <div style={{ position: 'relative' }}>
                <ReactApexChart
                    dir="ltr"
                    className="apex-charts"
                    options={options}
                    series={series}
                    type="bar"
                    height={dynamicHeight}
                />

                {/* Right-hand "days of cover" values, centred on each bar row */}
                {layout && (
                    <div
                        aria-hidden="true"
                        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                    >
                        {resolvedData.map((val, i) => (
                            <span
                                key={`${resolvedCategories[i]}-${i}`}
                                style={{
                                    position: 'absolute',
                                    top: layout.top + rowHeight * (i + 0.5),
                                    left: layout.right - 4,
                                    transform: 'translate(-100%, -50%)',
                                    lineHeight: 1,
                                    whiteSpace: 'nowrap',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: resolvedColors[i] || '#f06548',
                                }}
                            >
                                {`${parseFloat(val).toFixed(1)}d`}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-2 pt-3 mt-2 border-top">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                        <div className="text-muted small mb-1">
                            <strong>Threshold:</strong> Vertical Line = Reorder @ {reorderLine} days of cover.
                        </div>

                        <div className="d-flex flex-wrap gap-3 small">
                            {LEGEND_ITEMS.map(({ color, label }) => (
                                <span key={label} className="d-flex align-items-center">
                                    <span
                                        className="me-2 rounded-circle"
                                        style={{ width: 10, height: 10, backgroundColor: color }}
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