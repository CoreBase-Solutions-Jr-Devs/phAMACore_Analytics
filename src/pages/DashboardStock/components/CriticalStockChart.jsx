import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import BarChartOne from "../Charts/Custom/BarChartOne";

const PERIOD_DAYS = 30;

const CriticalStockChart = () => {
    const {
        dailyClosingStock = [],
        loadingStock,
        errorStock,
    } = useSelector((state) => state.StockInventory);

    const chartData = useMemo(() => {
        if (!Array.isArray(dailyClosingStock)) {
            return {
                categories: [],
                data: [],
                colors: [],
            };
        }

        const grouped = new Map();

        dailyClosingStock.forEach((row) => {
            const key = row.item_code;

            const existing = grouped.get(key);

            if (existing) {
                existing.closingQty += Number(
                    row.closing_qty ?? 0
                );

                existing.qtySold += Number(
                    row.qty_sold ?? 0
                );
            } else {
                grouped.set(key, {
                    itemCode: row.item_code,
                    name: row.item_Name,
                    closingQty: Number(
                        row.closing_qty ?? 0
                    ),
                    qtySold: Number(
                        row.qty_sold ?? 0
                    ),
                });
            }
        });

        const criticalItems = Array.from(grouped.values())
            .map((item) => {
                const avgDailySales = item.qtySold > 0
                    ? item.qtySold / PERIOD_DAYS
                    : 0;

                const daysOfCover = avgDailySales > 0
                    ? item.closingQty / avgDailySales
                    : Number.MAX_SAFE_INTEGER;

                return {
                    ...item,
                    daysOfCover,
                };
            })
            .filter((item) =>
                item.closingQty > 0 && item.qtySold > 0
            )
            .sort((a, b) =>
                a.daysOfCover - b.daysOfCover
            )
            .slice(0, 10);

        console.log("Grouped Critical Items", criticalItems);

        return {
            categories: criticalItems.map(
                (item) =>
                    item.name?.length > 40
                        ? `${item.name.substring(
                            0,
                            40
                        )}...`
                        : item.name
            ),

            data: criticalItems.map((item) =>
                Number(
                    item.daysOfCover.toFixed(1)
                )
            ),

            colors: criticalItems.map(
                (item) => {
                    if (
                        item.daysOfCover <= 7
                    )
                        return "#f06548";

                    if (
                        item.daysOfCover <= 14
                    )
                        return "#f7b84b";

                    return "#0ab39c";
                }
            ),
        };
    }, [dailyClosingStock]);

    if (loadingStock) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>

                <h6 className="text-muted mb-1">
                    Loading Critical Stock Levels
                </h6>

                <small className="text-muted">
                    Calculating days of stock cover...
                </small>
            </div>
        );
    }

    if (errorStock) {
        return (
            <div className="text-danger text-center py-5">
                {errorStock}
            </div>
        );
    }

    if (!chartData.data.length) {
        return (
            <div className="text-center py-5">
                No critical stock items found.
            </div>
        );
    }

    return (
        <BarChartOne
            categories={chartData.categories}
            data={chartData.data}
            colors={chartData.colors}
            reorderLine={14}
        />
    );
};

export default CriticalStockChart;