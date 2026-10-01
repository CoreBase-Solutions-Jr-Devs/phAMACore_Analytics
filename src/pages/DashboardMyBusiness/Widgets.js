import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";

import {
    getInventoryProfitSummaryUser,
    getAccountBalance,
    getCashbookSummary,
} from "../../slices/thunks";

import { getYearToDateApi } from "../utils/dateHelper";
import { formatAmount } from "../../helpers/format_helper";


/**
 * Calculate profit from the Inventory Profit Summary response.
 */
const calculateProfit = (data) => {
    if (!data) return 0;

    const items = Array.isArray(data) ? data : (data.result || []);

    if (!Array.isArray(items) || items.length === 0) {
        if (typeof data === "number") return data;

        if (typeof data === "object") {
            const val =
                data.grossProfit ??
                data.totalGrossProfit ??
                data.netProfit ??
                data.profit;

            if (val !== undefined) return Number(val) || 0;
        }

        return 0;
    }

    // Check if the response is summary metrics
    const summaryProfitItem = items.find(
        (item) =>
            item.metric_name &&
            (
                item.metric_name.toLowerCase().includes("gross profit") ||
                item.metric_name.toLowerCase().includes("net profit") ||
                item.metric_name.toLowerCase().includes("profit")
            )
    );

    if (summaryProfitItem && summaryProfitItem.metric_value) {
        const parsed = parseFloat(
            String(summaryProfitItem.metric_value).replace(/[^0-9.-]+/g, "")
        );

        if (!isNaN(parsed)) return parsed;
    }

    // Default: sum profit across all rows
    return items.reduce((acc, curr) => {
        const val =
            curr.grossProfit ??
            curr.profit ??
            curr.netProfit ??
            curr.totalProfit ??
            0;

        return acc + (Number(val) || 0);
    }, 0);
};


/**
 * Calculate sales from the Inventory Profit Summary response.
 */
const calculateSales = (data) => {
    if (!data) return 0;

    const items = Array.isArray(data) ? data : (data.result || []);

    if (!Array.isArray(items) || items.length === 0) {
        if (typeof data === "number") return data;

        if (typeof data === "object") {
            const val =
                data.salesValueExcl ??
                data.salesValueIncl ??
                data.totalSales ??
                data.sales ??
                data.salesRevenue;

            if (val !== undefined) return Number(val) || 0;
        }

        return 0;
    }

    // Check if the response is summary metrics
    const summarySalesItem =
        items.find(
            (item) =>
                item.metric_name &&
                (
                    item.metric_name.toLowerCase().includes("sales revenue") ||
                    item.metric_name.toLowerCase().includes("total sales")
                )
        ) ||
        items.find(
            (item) =>
                item.metric_name &&
                item.metric_name.toLowerCase().includes("sales") &&
                !item.metric_name.toLowerCase().includes("loss")
        ) ||
        items.find((item) => item.metric_order === 1);

    if (summarySalesItem && summarySalesItem.metric_value) {
        const parsed = parseFloat(
            String(summarySalesItem.metric_value).replace(/[^0-9.-]+/g, "")
        );

        if (!isNaN(parsed)) return parsed;
    }

    // Default: sum sales across all rows
    return items.reduce((acc, curr) => {
        const val =
            curr.salesValueExcl ??
            curr.salesValueIncl ??
            curr.totalSales ??
            curr.sales ??
            curr.salesRevenue ??
            0;

        return acc + (Number(val) || 0);
    }, 0);
};


/**
 * Parse metric values that may contain commas, currency symbols,
 * parentheses for negatives, etc.
 */
const parseMetricValue = (val) => {
    if (val === undefined || val === null) return 0;

    if (typeof val === "number") return val;

    const str = String(val).trim();

    const isNegative =
        (str.startsWith("(") && str.endsWith(")")) ||
        str.startsWith("-");

    const cleaned = str.replace(/[^0-9.]/g, "");

    if (!cleaned) return 0;

    const num = parseFloat(cleaned);

    if (isNaN(num)) return 0;

    return isNegative ? -num : num;
};


/**
 * Calculate available cash from the Cashbook Summary response.
 */
const calculateCashAvailable = (data) => {
    if (!data) return 0;

    const items = Array.isArray(data) ? data : (data.result || []);

    if (!Array.isArray(items) || items.length === 0) {
        if (typeof data === "number") return data;

        if (typeof data === "object") {
            const val =
                data["Total Cash Collections"] ??
                data.totalCashCollections ??
                data.total_cash_collections ??
                data.metric_value ??
                data.value;

            if (val !== undefined && val !== null) {
                return parseMetricValue(val);
            }
        }

        return 0;
    }

    // Find Total Cash Collections
    const totalCashCollectionsItem =
        items.find((item) => {
            const rawName =
                item.metric_name ||
                item.metricName ||
                item.MetricName ||
                item.name ||
                "";

            const normalized = rawName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");

            return (
                normalized === "totalcashcollections" ||
                normalized === "totalcashcollection"
            );
        }) ||
        items.find((item) => {
            const rawName = (
                item.metric_name ||
                item.metricName ||
                item.MetricName ||
                item.name ||
                ""
            ).toLowerCase();

            return rawName.includes("total cash collections");
        }) ||
        items.find((item) => {
            const rawName = (
                item.metric_name ||
                item.metricName ||
                item.MetricName ||
                item.name ||
                ""
            ).toLowerCase();

            return (
                rawName.includes("cash collections") ||
                rawName.includes("total collections")
            );
        });

    if (totalCashCollectionsItem) {
        const rawVal =
            totalCashCollectionsItem.metric_value ??
            totalCashCollectionsItem.metricValue ??
            totalCashCollectionsItem.response ??
            totalCashCollectionsItem.numericalResponse ??
            totalCashCollectionsItem.value ??
            totalCashCollectionsItem.amount ??
            totalCashCollectionsItem.total;

        if (rawVal !== undefined && rawVal !== null) {
            return parseMetricValue(rawVal);
        }
    }

    return 0;
};


/**
 * Calculate collections from the Cashbook Summary response.
 */
const calculateCollections = (data) => {
    if (!data) return 0;

    const items = Array.isArray(data) ? data : (data.result || []);

    if (!Array.isArray(items) || items.length === 0) {
        if (typeof data === "number") return data;

        if (typeof data === "object") {
            const val =
                data.totalCollections ??
                data.collections ??
                data.metric_value;

            if (val !== undefined) return Number(val) || 0;
        }

        return 0;
    }

    const totalCollectionsItem =
        items.find((item) => {
            const name = (
                item.metric_name ||
                item.metricName ||
                item.MetricName ||
                item.name ||
                ""
            ).toLowerCase();

            return (
                name.includes("total cash collections") ||
                name.includes("total collections") ||
                name.includes("collections")
            );
        }) ||
        items.find((item) => item.metric_order === 1);

    if (totalCollectionsItem) {
        const rawVal =
            totalCollectionsItem.metric_value ??
            totalCollectionsItem.metricValue ??
            totalCollectionsItem.response ??
            totalCollectionsItem.value;

        if (rawVal !== undefined && rawVal !== null) {
            return parseMetricValue(rawVal);
        }
    }

    return 0;
};


/**
 * Sum current_balance from Power BI Account Balance response.
 *
 * The API returns one row per customer/supplier. The KPI should
 * represent the total outstanding balance.
 */
const calculateAccountBalance = (data) => {
    if (!Array.isArray(data)) return 0;

    return data.reduce((total, item) => {
        return total + (Number(item.current_balance) || 0);
    }, 0);
};


export default function Widgets() {
    const dispatch = useDispatch();

    /*
     * Redux accountBalance is shared by both AccountType requests.
     * Keep the Customer and Supplier results separately at component
     * level so that the second API response does not overwrite the
     * first KPI's data.
     */
    const [customerAccountBalances, setCustomerAccountBalances] = useState([]);
    const [supplierAccountBalances, setSupplierAccountBalances] = useState([]);

    const {
        inventoryProfitSummaryUser = [],
        accountBalance = [],
        cashbookSummary = [],
        cashbookSummaryMetrics = [],
        filters,

        loadingProfitSummary = false,
        loadingAccountBalance = false,
        loadingCashbookSummary = false,
    } = useSelector(
        (state) =>
            state.DashboardMyBusiness ||
            state.MyBusiness ||
            {}
    );


    /**
     * Fetch the core My Business KPI data.
     */
    useEffect(() => {
        const ytd = getYearToDateApi();
        const startDate = filters?.startDate || ytd.startDate;
        const endDate = filters?.endDate || ytd.endDate;

        // 1. Income Statement KPI (Sales and Stock Profit)
        dispatch(
            getInventoryProfitSummaryUser({
                clientid: 1,
                GroupBy: "SUMMARY",
                StartDate: startDate,
                EndDate: endDate,
            })
        );

        // 2. Cash Available & Collections KPI
        dispatch(
            getCashbookSummary({
                clientid: 1,
                GroupBy: "SUMMARY",
                StartDate: startDate,
                EndDate: endDate,
            })
        );
    }, [dispatch, filters?.startDate, filters?.endDate]);


    /**
     * Fetch Customer and Supplier Account Balances.
     *
     * Because the reducer has one accountBalance property, each
     * response is captured immediately and stored separately.
     */
    useEffect(() => {
        const fetchAccountBalances = async () => {
            try {
                const customerAction = await dispatch(
                    getAccountBalance({
                        clientid: 1,
                        Mode: "SUMMARY",
                        AccountType: "CUSTOMER",
                        branchcode: 0,
                        IncludeZeroBal: false,
                    })
                );

                if (getAccountBalance.fulfilled.match(customerAction)) {
                    const customerData =
                        customerAction.payload?.result ||
                        customerAction.payload ||
                        [];

                    setCustomerAccountBalances(
                        Array.isArray(customerData)
                            ? customerData
                            : []
                    );
                }

                const supplierAction = await dispatch(
                    getAccountBalance({
                        clientid: 1,
                        Mode: "SUMMARY",
                        AccountType: "SUPPLIER",
                        branchcode: 0,
                        IncludeZeroBal: false,
                    })
                );

                if (getAccountBalance.fulfilled.match(supplierAction)) {
                    const supplierData =
                        supplierAction.payload?.result ||
                        supplierAction.payload ||
                        [];

                    setSupplierAccountBalances(
                        Array.isArray(supplierData)
                            ? supplierData
                            : []
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to fetch account balances:",
                    error
                );
            }
        };

        fetchAccountBalances();
    }, [dispatch]);


    const salesValue = useMemo(() => {
        return calculateSales(inventoryProfitSummaryUser);
    }, [inventoryProfitSummaryUser]);


    const incomeStatementValue = useMemo(() => {
        return calculateProfit(inventoryProfitSummaryUser);
    }, [inventoryProfitSummaryUser]);


    const cashAvailableValue = useMemo(() => {
        const data =
            cashbookSummary && cashbookSummary.length > 0
                ? cashbookSummary
                : cashbookSummaryMetrics;

        return calculateCashAvailable(data);
    }, [cashbookSummary, cashbookSummaryMetrics]);


    const collectionsValue = useMemo(() => {
        const data =
            cashbookSummary && cashbookSummary.length > 0
                ? cashbookSummary
                : cashbookSummaryMetrics;

        return calculateCollections(data);
    }, [cashbookSummary, cashbookSummaryMetrics]);


    /**
     * Receivables = SUM(current_balance) for CUSTOMER accounts.
     */
    const receivablesValue = useMemo(() => {
        return calculateAccountBalance(customerAccountBalances);
    }, [customerAccountBalances]);


    /**
     * Payables = SUM(current_balance) for SUPPLIER accounts.
     */
    const payablesValue = useMemo(() => {
        return calculateAccountBalance(supplierAccountBalances);
    }, [supplierAccountBalances]);


    const kpis = [
        {
            title: "Receivables",
            value: receivablesValue,
            prefix: "KES",
            suffix: "",
            icon: "credit-card",
            color: "success",
            subtitle: "Customer balances",
            loading: loadingAccountBalance &&
                customerAccountBalances.length === 0,
            decimals: 2,
        },
        {
            title: "Payables",
            value: payablesValue,
            prefix: "KES",
            suffix: "",
            icon: "shopping-bag",
            color: "danger",
            subtitle: "Supplier balances",
            loading: loadingAccountBalance &&
                supplierAccountBalances.length === 0,
            decimals: 2,
        },
        {
            title: "Cash Available",
            value: cashAvailableValue,
            prefix: "KES",
            suffix: "",
            icon: "dollar-sign",
            color: "success",
            subtitle: "Available cash position",
            loading: loadingCashbookSummary,
            decimals: 2,
        },
        {
            title: "Sales",
            value: salesValue,
            prefix: "KES",
            suffix: "",
            icon: "trending-up",
            color: "primary",
            subtitle: "Current period sales",
            loading: loadingProfitSummary,
            decimals: 2,
        },
        {
            title: "Stock Profit",
            value: incomeStatementValue,
            prefix: "KES",
            suffix: "",
            icon: "package",
            color: "warning",
            subtitle: "Estimated stock profit",
            loading: loadingProfitSummary,
            decimals: 2,
        },
        {
            title: "Collections",
            value: collectionsValue,
            prefix: "KES",
            suffix: "",
            icon: "archive",
            color: "success",
            subtitle: "Customer payments received",
            loading: loadingCashbookSummary,
            decimals: 2,
        },
    ];


    return (
        <React.Fragment>
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                <h4 className="card-title mb-0">
                    KEY METRICS
                </h4>
            </div>

            <Row className="g-2 mb-2">
                {kpis.map((item, index) => (
                    <Col
                        xl={2}
                        lg={4}
                        md={4}
                        sm={6}
                        xs={12}
                        key={index}
                        className="d-flex"
                    >
                        <Card className="card-animate w-100 h-100 mb-0 d-flex flex-column">
                            <CardBody className="p-3 d-flex flex-column justify-content-between">

                                {/* Title */}
                                <div>
                                    <p className="font-medium text-truncate mb-0">
                                        {item.title}
                                    </p>
                                </div>

                                {/* Metric value */}
                                <div className="d-flex align-items-baseline flex-wrap my-2">
                                    {item.prefix && (
                                        <span className="fs-12 fw-medium text-muted me-1">
                                            {item.prefix.trim()}
                                        </span>
                                    )}

                                    <h4
                                        className={`mb-0 ff-secondary fw-semibold text-${item.color} fs-18`}
                                    >
                                        <span className="counter-value">
                                            {item.loading ? (
                                                <span className="placeholder-glow">
                                                    <span className="placeholder col-6 rounded" />
                                                </span>
                                            ) : (
                                                <CountUp
                                                    start={0}
                                                    end={Number(item.value || 0)}
                                                    separator=","
                                                    decimals={
                                                        item.decimals !== undefined
                                                            ? item.decimals
                                                            : 2
                                                    }
                                                    duration={2}
                                                    formattingFn={(val) =>
                                                        formatAmount(
                                                            val,
                                                            item.decimals !== undefined
                                                                ? item.decimals
                                                                : 2
                                                        )
                                                    }
                                                />
                                            )}
                                        </span>
                                    </h4>

                                    {item.suffix && (
                                        <span className="fs-12 fw-medium text-muted ms-1">
                                            {item.suffix.trim()}
                                        </span>
                                    )}
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <p
                                        className="mb-0 text-muted fs-11 text-truncate"
                                        title={item.subtitle}
                                    >
                                        {item.subtitle}
                                    </p>
                                </div>

                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>
        </React.Fragment>
    );
}