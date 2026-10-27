import React, { useState } from "react";
import { Spinner } from "reactstrap";
import FloatingTooltip from "../../../../Components/Common/FloatingTooltip";

const formatGap = (gap = 0) => `${gap > 0 ? "+" : ""}${Number(gap).toFixed(1)}%`;

const ImbalanceAlertList = ({
    alerts = [],
    searchTerm = "",
    statusFilter = "ALL",
    branchFilter = "",
    isLoading = false,
    error = null,
}) => {
    const [hoverInfo, setHoverInfo] = useState(null);

    const handleCellHover = (e, info) => {
        setHoverInfo({
            ...info,
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleMouseMove = (e) => {
        if (hoverInfo) {
            setHoverInfo((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
        }
    };

    const handleMouseLeave = () => {
        setHoverInfo(null);
    };

    if (isLoading && (!alerts || alerts.length === 0)) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center"
                style={{ minHeight: "180px" }}
            >
                <Spinner size="sm" color="primary" className="mb-2" />
                <small className="text-muted">Loading transfer suggestions...</small>
            </div>
        );
    }

    if (error && (!alerts || alerts.length === 0)) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-danger"
                style={{ minHeight: "180px" }}
            >
                <i className="ri-error-warning-line display-6 mb-2"></i>
                <small>{typeof error === "string" ? error : "Failed to load branch imbalance data."}</small>
            </div>
        );
    }

    if (!alerts?.length) {
        if (searchTerm || statusFilter !== "ALL" || (branchFilter && branchFilter !== "ALL")) {
            return (
                <div
                    className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted"
                    style={{ minHeight: "180px" }}
                >
                    <i className="ri-search-line display-6 mb-2"></i>
                    <div className="fw-medium text-dark fs-13">No matching imbalance alerts</div>
                    <small className="text-muted">
                        {searchTerm
                            ? `No alerts match "${searchTerm}". Try adjusting your search query.`
                            : "No inter-branch imbalances match your filter."}
                    </small>
                </div>
            );
        }

        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted"
                style={{ minHeight: "180px" }}
            >
                <div className="avatar-sm mb-2">
                    <div className="avatar-title bg-success-subtle text-success rounded-circle fs-20">
                        <i className="ri-checkbox-circle-line"></i>
                    </div>
                </div>
                <div className="fw-medium text-dark fs-13">No Imbalance Detected</div>
                <small className="text-muted">
                    Stock levels are balanced across branches. No inter-branch transfers or replenishments needed.
                </small>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <div
                className="table-responsive"
                style={{ maxHeight: "400px", overflowY: "auto" }}
                onMouseLeave={handleMouseLeave}
            >
                <table className="table table-borderless table-centered mb-0 w-100">
                    <thead className="text-muted table-light sticky-top" style={{ zIndex: 1 }}>
                        <tr>
                            <th scope="col" className="text-nowrap">Product</th>
                            <th scope="col" className="text-nowrap">Branch</th>
                            <th scope="col" className="text-center text-nowrap">Status &amp; Gap</th>
                            <th scope="col" className="text-end text-nowrap">Branch Stock</th>
                            <th scope="col" className="text-end text-nowrap">Branch Sales</th>
                            <th scope="col" className="text-center text-nowrap">Required Transfer</th>
                            <th scope="col" style={{ width: "100%", minWidth: "280px" }}>Network Counterpart &amp; Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map((item, i) => {
                            const tone = item.deficit ? "danger" : "success";
                            const toneColor = item.deficit ? "#f06548" : "#0ab39c";

                            return (
                                <tr key={item.id || i} data-id={i}>
                                    <th
                                        scope="row"
                                        className="fw-medium text-nowrap"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: item.product,
                                                badgeColor: toneColor,
                                                mainValue: item.itemCode ? `SKU: ${item.itemCode}` : item.product,
                                                mainColor: "#299cdb",
                                                subText: `Category: ${item.group || "General"} · Branch: ${item.branch}`,
                                                extraText: item.actionInsight || undefined,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.product}
                                        <small className="text-muted d-block fw-normal">
                                            {[item.itemCode, item.group].filter((v) => v && v !== "-").join(" · ")}
                                        </small>
                                    </th>
                                    <td
                                        className="text-nowrap"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: item.branch,
                                                badgeColor: "#405189",
                                                mainValue: `${item.stock.toLocaleString()} units in stock`,
                                                mainColor: "#00e396",
                                                subText: `Sales in window: ${item.sales.toLocaleString()} units`,
                                                extraText: `Imbalance Status: ${item.deficit ? "Deficit (Needs stock)" : "Surplus (Excess stock)"}`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="badge bg-light text-body fs-12 fw-medium">{item.branch || "-"}</span>
                                    </td>
                                    <td
                                        className="text-center text-nowrap"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: `${item.deficit ? "Deficit" : "Surplus"} Alert`,
                                                badgeColor: toneColor,
                                                mainValue: `${formatGap(item.gap)} Imbalance Gap`,
                                                mainColor: toneColor,
                                                subText: `Stock share (${item.stockShare.toFixed(1)}%) vs Sales share (${item.salesShare.toFixed(1)}%)`,
                                                extraText: `Required Transfer: ${item.qty.toLocaleString()} units`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span
                                            className={`badge rounded-pill border border-${tone} text-${tone} bg-${tone}-subtle fs-11 fw-normal px-2 py-1`}
                                        >
                                            {item.deficit ? "Deficit" : "Surplus"}
                                        </span>
                                        <small className={`d-block fw-semibold text-${tone}`}>{formatGap(item.gap)} gap</small>
                                    </td>
                                    <td
                                        className="text-end text-nowrap"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: `${item.branch} Stock`,
                                                badgeColor: "#299cdb",
                                                mainValue: `${item.stock.toLocaleString()} units`,
                                                mainColor: "#00e396",
                                                subText: `${item.stockShare.toFixed(1)}% of total company stock (${item.companyStock.toLocaleString()} units)`,
                                                extraText: `Product: ${item.product}`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="fw-semibold">{item.stock.toLocaleString()} u</span>
                                        <small className="text-muted d-block">
                                            {item.stockShare.toFixed(1)}% of {item.companyStock.toLocaleString()}
                                        </small>
                                    </td>
                                    <td
                                        className="text-end text-nowrap"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: `${item.branch} Sales`,
                                                badgeColor: "#0ab39c",
                                                mainValue: `${item.sales.toLocaleString()} units sold`,
                                                mainColor: "#00e396",
                                                subText: `${item.salesShare.toFixed(1)}% of total company sales (${item.companySales.toLocaleString()} units)`,
                                                extraText: `Disparity Gap: ${formatGap(item.gap)}`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="fw-semibold">{item.sales.toLocaleString()} u</span>
                                        <small className="text-muted d-block">
                                            {item.salesShare.toFixed(1)}% of {item.companySales.toLocaleString()}
                                        </small>
                                    </td>
                                    <td
                                        className="text-center text-nowrap"
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: "Required Inter-Branch Transfer",
                                                badgeColor: "#405189",
                                                mainValue: `${item.deficit ? "Receive" : "Transfer Out"} ${item.qty.toLocaleString()} units`,
                                                mainColor: "#00e396",
                                                subText: item.actionInsight,
                                                extraText: `Network Context: ${item.networkContext}`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="badge bg-primary-subtle text-primary fs-12 fw-semibold px-2 py-1">
                                            <i className="ri-arrow-left-right-line me-1 align-middle"></i>
                                            {item.qty.toLocaleString()} u
                                        </span>
                                    </td>
                                    <td
                                        style={{ minWidth: "280px", whiteSpace: "normal" }}
                                        onMouseEnter={(e) =>
                                            handleCellHover(e, {
                                                title: "Network Counterpart & Action",
                                                badgeColor: "#f7b84b",
                                                mainValue: item.networkContext,
                                                mainColor: "#f7b84b",
                                                subText: `Recommended Action: ${item.actionInsight}`,
                                                extraText: `Suggested Transfer: ${item.qty.toLocaleString()} units (${item.deficit ? "Deficit" : "Surplus"})`,
                                            })
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="fs-12 fw-medium text-dark" style={{ lineHeight: "1.35" }}>
                                            {item.networkContext}
                                        </div>
                                        <div className="text-muted d-block mt-1 fs-11" style={{ lineHeight: "1.35" }}>
                                            <i className="ri-information-line text-primary me-1 align-middle"></i>
                                            {item.actionInsight}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Custom Floating Hover Tooltip matching Stock Value By Branch (BarChartTwo) */}
            <FloatingTooltip hoverInfo={hoverInfo} />
        </div>
    );
};

export default ImbalanceAlertList;
