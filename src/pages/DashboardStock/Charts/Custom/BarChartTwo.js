import React, { useMemo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";
import { Spinner } from "reactstrap";

const BRANCH_COLORS = { MAIN: "#405189", CENTRAL: "#4b9fd4", WESTLANDS: "#0ab39c", "WESTLANDS BRANCH": "#0ab39c", WAREHOUSE: "#299cdb", MOMBASA: "#2a9d8f", "MOMBASA BRANCH": "#2a9d8f", KAKAMEGA: "#e76f51", "KAKAMEGA BRANCH": "#e76f51", WAJIR: "#f4a261", "WAJIR BRANCH": "#f4a261", KAMPALA: "#8e44ad", "KAMPALA BRANCH": "#8e44ad", THIKA: "#f7b84b", "THIKA BRANCH": "#f7b84b", TESTING: "#556ee6", "TEST BRANCH": "#34c38f" };

const FALLBACK_PALETTE = [ "#405189", "#4b9fd4", "#0ab39c", "#299cdb", "#f7b84b", "#f06548", "#8e44ad", "#e76f51", "#556ee6"];

const resolveBranchColor = (branch, index) => {
    if (!branch) return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
    const key = branch.toUpperCase().trim();
    const shortKey = key.replace(/\s+BRANCH$/, "").trim();
    return (
        BRANCH_COLORS[key] || BRANCH_COLORS[shortKey] || FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
    );
};

const BarChartTwo = () => {
    const {
        totalStockValueByBranch = [],
        loadingTotalStockValueByBranch,
    } = useSelector((state) => state.StockInventory);

    const containerRef = useRef(null);
    const [hoverInfo, setHoverInfo] = useState(null);

    const chartData = useMemo(() => {
        if (!totalStockValueByBranch || !totalStockValueByBranch.length) {
            return {
                branches: [],
                values: [],
                rawValues: [],
            };
        }

        const sorted = [...totalStockValueByBranch]
            .map((item) => {
                const branch =
                    item.branch_name || item.branchName ||
                    `Branch ${item.branch_id ?? ""}`;
                const rawValue = Number(item.total_stock_value || 0);
                return {
                    branch,
                    value: rawValue / 1000000,
                    rawValue,
                };
            })
            .sort((a, b) => b.value - a.value);

        return {
            branches: sorted.map((x) => x.branch),
            values: sorted.map((x) => Number(x.value.toFixed(2))),
            rawValues: sorted.map((x) => x.rawValue),
        };
    }, [totalStockValueByBranch]);

    const colors = chartData.branches.map((branch, i) =>
        resolveBranchColor(branch, i)
    );

    const axisMax =
        chartData.values.length > 0
            ? Math.ceil(Math.max(...chartData.values) * 1.3)
            : 10;

    // All value annotations placed on the far right (x: axisMax)
    const pointAnnotations = chartData.values.map((val, i) => ({
        x: axisMax,
        y: chartData.branches[i],
        marker: { size: 0 },
        id: `val-anno-${i}`,
        label: {
            text: `${val.toFixed(2)}M`,
            textAnchor: "end",
            offsetX: -4,
            offsetY: 5,
            borderWidth: 0,
            style: {
                background: "transparent",
                color: colors[i] || "#000",
                fontSize: "12px",
                fontWeight: 700,
                cssClass: `val-anno-label-${i}`,
            },
        },
    }));

    const isSingleBranch = chartData.branches.length === 1;

    // Attach native SVG titles for accessibility & hover fallbacks
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !chartData.branches.length) return;

        const timer = setTimeout(() => {
            // Y-axis labels
            const yLabels = container.querySelectorAll(".apexcharts-yaxis-texts-g text");
            yLabels.forEach((el) => {
                const rawText = (el.querySelector("tspan")?.textContent || el.childNodes[0]?.textContent || el.textContent || "").trim().toUpperCase();
                const idx = chartData.branches.findIndex(
                    (b) => b.toUpperCase().trim() === rawText ||
                           rawText.includes(b.toUpperCase().trim()) ||
                           b.toUpperCase().trim().includes(rawText)
                );
                if (idx !== -1) {
                    const formatted = `KES ${Number(chartData.rawValues[idx] || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`;
                    const titleText = `${chartData.branches[idx]}: ${formatted} (${chartData.values[idx].toFixed(2)}M)`;
                    el.setAttribute("title", titleText);
                    let titleEl = el.querySelector("title");
                    if (!titleEl) {
                        titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
                        el.appendChild(titleEl);
                    }
                    titleEl.textContent = titleText;
                }
            });

            // Point Annotations (values on the right)
            const annoLabels = container.querySelectorAll(".apexcharts-point-annotations text");
            annoLabels.forEach((el, idx) => {
                const classAttr = String(el.getAttribute("class") || el.className?.baseVal || "");
                const m = classAttr.match(/val-anno-label-(\d+)/);
                const i = m ? parseInt(m[1], 10) : idx;
                if (i >= 0 && i < chartData.branches.length) {
                    const formatted = `KES ${Number(chartData.rawValues[i] || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`;
                    const titleText = `${chartData.branches[i]}: ${formatted}`;
                    el.setAttribute("title", titleText);
                    let titleEl = el.querySelector("title");
                    if (!titleEl) {
                        titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
                        el.appendChild(titleEl);
                    }
                    titleEl.textContent = titleText;
                }
            });
        }, 150);

        return () => clearTimeout(timer);
    }, [chartData]);

    const handleMouseMove = (e) => {
        const container = containerRef.current;
        if (!container || !chartData.branches.length) return;

        const target = e.target;
        if (!target) return;

        // 1. Check if hovering on a Y-axis label (branch names on the left)
        const yaxisEl = target.closest(".apexcharts-yaxis-label, .apexcharts-yaxis-texts-g text");
        if (yaxisEl) {
            const tspan = yaxisEl.querySelector("tspan");
            const rawText = (tspan ? tspan.textContent : (yaxisEl.childNodes[0]?.textContent || yaxisEl.textContent) || "").trim().toUpperCase();

            const idx = chartData.branches.findIndex(
                (b) => b.toUpperCase().trim() === rawText ||
                       rawText.includes(b.toUpperCase().trim()) ||
                       b.toUpperCase().trim().includes(rawText)
            );

            if (idx !== -1) {
                const rect = container.getBoundingClientRect();
                setHoverInfo({
                    branch: chartData.branches[idx],
                    rawValue: chartData.rawValues[idx],
                    valM: chartData.values[idx],
                    color: colors[idx],
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
                return;
            }
        }

        // 2. Check if hovering on a point annotation (values on the right)
        const annoEl = target.closest(
            "[class*='val-anno-label-'], [class*='val-anno-'], .apexcharts-point-annotations text, .apexcharts-point-annotation-label"
        );
        if (annoEl) {
            const classAttr = String(annoEl.getAttribute("class") || annoEl.className?.baseVal || "");
            const m = classAttr.match(/val-anno-label-(\d+)/) || classAttr.match(/val-anno-(\d+)/);
            let idx = m ? parseInt(m[1], 10) : -1;

            if (idx === -1) {
                const allAnno = Array.from(container.querySelectorAll(".apexcharts-point-annotations text"));
                idx = allAnno.indexOf(annoEl);
            }

            if (idx >= 0 && idx < chartData.branches.length) {
                const rect = container.getBoundingClientRect();
                setHoverInfo({
                    branch: chartData.branches[idx],
                    rawValue: chartData.rawValues[idx],
                    valM: chartData.values[idx],
                    color: colors[idx],
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
                return;
            }
        }

        // If mouse is elsewhere on the chart, clear custom hover info
        if (hoverInfo) {
            setHoverInfo(null);
        }
    };

    const handleMouseLeave = () => {
        setHoverInfo(null);
    };

    const options = {
        chart: {
            type: "bar",
            height: 380,
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                barHeight: isSingleBranch ? "30%" : "55%",
                distributed: true,
                horizontal: true,
            },
        },
        colors,
        dataLabels: { enabled: false },
        annotations: {
            points: pointAnnotations,
        },
        xaxis: {
            min: 0,
            max: axisMax,
            tickAmount: 4,
            categories: chartData.branches,
            labels: {
                formatter: (val) => `${Math.round(val)}M`,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                maxWidth: 140,
            },
        },
        grid: {
            borderColor: "rgba(0,0,0,0.08)",
        },
        legend: {
            show: false,
        },
        tooltip: {
            y: {
                formatter: (val, opts) => {
                    const raw = chartData.rawValues?.[opts?.dataPointIndex];
                    if (raw !== undefined) {
                        return `KES ${raw.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`;
                    }
                    return `KES ${(val * 1000000).toLocaleString()}`;
                },
            },
        },
    };

    const series = [
        {
            name: "Stock Value",
            data: chartData.values,
        },
    ];

    if (loadingTotalStockValueByBranch) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center py-5 my-3"
                style={{ height: "380px" }}
            >
                <Spinner color="primary" className="mb-3">
                    {" "}
                    Loading...{" "}
                </Spinner>
                <div className="text-muted fw-semibold">
                    Loading branch stock values...
                </div>
            </div>
        );
    }

    if (!chartData.branches.length) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center py-5 my-3 text-center"
                style={{ height: "380px" }}
            >
                <i className="ri-bar-chart-line text-muted display-4 mb-2"></i>
                <div className="text-muted fw-medium">
                    No stock value data available
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ position: "relative" }}
        >
            <style>{`
                .apexcharts-yaxis-label,
                .apexcharts-yaxis-texts-g text,
                .apexcharts-point-annotation-label,
                .apexcharts-point-annotations text,
                [class*="val-anno-label-"] {
                    cursor: pointer !important;
                    pointer-events: all !important;
                }
            `}</style>

            <ReactApexChart
                options={options}
                series={series}
                type="bar"
                height={380}
            />

            {hoverInfo && (
                <div
                    style={{
                        position: "absolute",
                        left: `${hoverInfo.x}px`,
                        top: `${hoverInfo.y}px`,
                        transform:
                            hoverInfo.x > 250
                                ? hoverInfo.y < 50
                                    ? "translate(-100%, 15px)"
                                    : "translate(-100%, -120%)"
                                : hoverInfo.y < 50
                                ? "translate(10px, 15px)"
                                : "translate(10px, -120%)",
                        pointerEvents: "none",
                        zIndex: 9999,
                        backgroundColor: "rgba(33, 37, 41, 0.95)",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        lineHeight: "1.4",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25)",
                        whiteSpace: "nowrap",
                        transition: "opacity 0.1s ease",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: 600,
                            marginBottom: "3px",
                        }}
                    >
                        <span
                            style={{
                                width: "9px",
                                height: "9px",
                                borderRadius: "50%",
                                backgroundColor: hoverInfo.color,
                                display: "inline-block",
                            }}
                        />
                        <span>{hoverInfo.branch}</span>
                    </div>
                    <div
                        style={{
                            color: "#00e396",
                            fontWeight: 700,
                            fontSize: "13px",
                        }}
                    >
                        KES{" "}
                        {Number(hoverInfo.rawValue || 0).toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}
                    </div>
                    <div
                        style={{
                            fontSize: "11px",
                            color: "#adb5bd",
                            marginTop: "2px",
                        }}
                    >
                        Valuation: {hoverInfo.valM.toFixed(2)}M
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarChartTwo;