import React, { useEffect, useMemo } from 'react';
import { Row, Col, Card, CardBody } from "reactstrap";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { useDispatch, useSelector } from "react-redux";
import { getInventoryProfitSummaryUser, getCashbookSummary } from "../../slices/thunks";
import { getYearToDateApi } from "../utils/dateHelper";

const calculateProfit = (data) => {
    if (!data) return 0;

    const items = Array.isArray(data) ? data : (data.result || []);
    if (!Array.isArray(items) || items.length === 0) {
        if (typeof data === "number") return data;
        if (typeof data === "object") {
            const val = data.grossProfit ?? data.totalGrossProfit ?? data.netProfit ?? data.profit;
            if (val !== undefined) return Number(val) || 0;
        }
        return 0;
    }

    // Check if the response is summary metrics array (e.g. from GroupBy=SUMMARY)
    const summaryProfitItem = items.find((item) =>
        item.metric_name && (
            item.metric_name.toLowerCase().includes("gross profit") ||
            item.metric_name.toLowerCase().includes("net profit") ||
            item.metric_name.toLowerCase().includes("profit")
        )
    );
    if (summaryProfitItem && summaryProfitItem.metric_value) {
        const parsed = parseFloat(String(summaryProfitItem.metric_value).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(parsed)) return parsed;
    }

    // Default: sum grossProfit across all user rows
    return items.reduce((acc, curr) => {
        const val = curr.grossProfit ?? curr.profit ?? curr.netProfit ?? curr.totalProfit ?? 0;
        return acc + (Number(val) || 0);
    }, 0);
};

const calculateSales = (data) => {
    if (!data) return 0;

    const items = Array.isArray(data) ? data : (data.result || []);
    if (!Array.isArray(items) || items.length === 0) {
        if (typeof data === "number") return data;
        if (typeof data === "object") {
            const val = data.salesValueExcl ?? data.salesValueIncl ?? data.totalSales ?? data.sales ?? data.salesRevenue;
            if (val !== undefined) return Number(val) || 0;
        }
        return 0;
    }

    // Check if the response is summary metrics array (e.g. from GroupBy=SUMMARY)
    const summarySalesItem = items.find((item) =>
        item.metric_name && (
            item.metric_name.toLowerCase().includes("sales revenue") ||
            item.metric_name.toLowerCase().includes("total sales")
        )
    ) || items.find((item) =>
        item.metric_name &&
        item.metric_name.toLowerCase().includes("sales") &&
        !item.metric_name.toLowerCase().includes("loss")
    ) || items.find((item) => item.metric_order === 1);

    if (summarySalesItem && summarySalesItem.metric_value) {
        const parsed = parseFloat(String(summarySalesItem.metric_value).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(parsed)) return parsed;
    }

    // Default: sum sales across all user rows
    return items.reduce((acc, curr) => {
        const val = curr.salesValueExcl ?? curr.salesValueIncl ?? curr.totalSales ?? curr.sales ?? curr.salesRevenue ?? 0;
        return acc + (Number(val) || 0);
    }, 0);
};

const calculateCollections = (data) => {
    if (!data) return 0;

    const items = Array.isArray(data) ? data : (data.result || []);
    if (!Array.isArray(items) || items.length === 0) {
        if (typeof data === "number") return data;
        if (typeof data === "object") {
            const val = data.totalCollections ?? data.collections ?? data.metric_value;
            if (val !== undefined) return Number(val) || 0;
        }
        return 0;
    }

    // 1. Look for metric_name containing "Total Collections" or "Collections"
    const totalCollectionsItem = items.find((item) =>
        item.metric_name && item.metric_name.toLowerCase().includes("total collections")
    ) || items.find((item) =>
        item.metric_name && item.metric_name.toLowerCase().includes("collections")
    ) || items.find((item) => item.metric_order === 1);

    if (totalCollectionsItem && totalCollectionsItem.metric_value) {
        const parsed = parseFloat(String(totalCollectionsItem.metric_value).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(parsed)) return parsed;
    }

    return 0;
};

export default function Widgets() {
    const dispatch = useDispatch();

    const {
        inventoryProfitSummaryUser = [],
        cashbookSummary = [],
        loadingProfitSummary = false,
        loadingCashbookSummary = false,
    } = useSelector((state) => state.DashboardMyBusiness || state.MyBusiness || {});

    useEffect(() => {
        const ytd = getYearToDateApi();

        // 1. Income Statement KPI: PowerBI Inventory Profit Summary API
        dispatch(
            getInventoryProfitSummaryUser({
                clientid: 1,
                GroupBy: "SUMMARY",
            })
        );

        // 2. Collections KPI: PowerBI Cashbook Summary API - Year to Date & GroupBy SUMMARY
        dispatch(
            getCashbookSummary({
                clientid: 1,
                GroupBy: "SUMMARY",
                StartDate: ytd.startDate,
                EndDate: ytd.endDate,
            })
        );
    }, [dispatch]);

    const salesValue = useMemo(() => {
        return calculateSales(inventoryProfitSummaryUser);
    }, [inventoryProfitSummaryUser]);

    const incomeStatementValue = useMemo(() => {
        return calculateProfit(inventoryProfitSummaryUser);
    }, [inventoryProfitSummaryUser]);

    const collectionsValue = useMemo(() => {
        return calculateCollections(cashbookSummary);
    }, [cashbookSummary]);

    const kpis = [
        {
            title: "Receivables",
            value: 0,
            prefix: "KES ",
            suffix: "",
            icon: "credit-card",
            color: "success",
            subtitle: "Customer balances"
        },
        {
            title: "Payables",
            value: 0,
            prefix: "KES ",
            suffix: "",
            icon: "shopping-bag",
            color: "danger",
            subtitle: "Supplier balances"
        },
        {
            title: "Cash Available",
            value: 0,
            prefix: "KES ",
            suffix: "",
            icon: "dollar-sign",
            color: "success",
            subtitle: "Available cash position"
        },
        {
            title: "Sales",
            value: salesValue,
            prefix: "KES ",
            suffix: "",
            icon: "trending-up",
            color: "primary",
            subtitle: "Current period sales",
            loading: loadingProfitSummary,
            decimals: 2
        },
        {
            title: "Stock Profit",
            value: 0,
            prefix: "KES ",
            suffix: "",
            icon: "package",
            color: "warning",
            subtitle: "Estimated stock profit"
        },
        {
            title: "Income Statement",
            value: incomeStatementValue,
            prefix: "KES ",
            suffix: "",
            icon: "bar-chart-2",
            color: "secondary",
            subtitle: "Net profit after expenses",
            loading: loadingProfitSummary,
            decimals: 2
        },
        {
            title: "Collections",
            value: collectionsValue,
            prefix: "KES ",
            suffix: "",
            icon: "archive",
            color: "success",
            subtitle: "Customer payments received",
            loading: loadingCashbookSummary,
            decimals: 2
        },
        {
            title: "Ageing",
            value: 0,
            prefix: "",
            suffix: "",
            icon: "clock",
            color: "info",
            subtitle: "Invoices over 90 days"
        }
    ];

    return (
        <React.Fragment>
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">
                <h4 className="card-title mb-0">
                    KEY METRICS
                    {/* {branchName !== "All Branches" && ` - ${branchName}`} */}
                </h4>
            </div>

  <Row className="g-2 mb-2">
    {kpis.map((item, index) => (
        <Col xl={3} lg={4} md={6} sm={12} key={index}>
            <Card className="card-animate h-80 w-100">
                <CardBody className="p-2">
                    <div className="d-flex justify-content-between align-items-center">

                                    {/* Left content */}
                                    <div>
                                        <p className="font-medium mb-0">
                                            {item.title}
                                        </p>

                            <h2 className={`mt-2 ff-secondary fw-semibold text-${item.color}`}>
                                <span className="counter-value">
                                    {item.prefix}
                                    {Number(item.value || 0)}
                                    {item.suffix}
                                </span>
                            </h2>

                                        <p className="mb-0 text-muted">
                                            {item.subtitle}
                                        </p>
                                    </div>

                        {/* Right icon */}
                        {/* <div className="avatar-sm flex-shrink-0">
                            <span className={`avatar-title bg-${item.color}-subtle rounded-circle fs-2`}>
                                <FeatherIcon
                                    icon={item.icon}
                                    className={`text-${item.color}`}
                                />
                            </span>
                        </div> */}

                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>
        </React.Fragment>
    );
}
