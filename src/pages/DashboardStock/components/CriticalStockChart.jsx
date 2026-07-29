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

const chartData = useMemo(() => ({

    categories: ["ARVs (Tenofovir)","Amoxicillin 500mg","Co-Artem 20/120mg","ORS Sachets","Metformin 500mg","Insulin Actrapid","Paracetamol 500mg","Omeprazole 20mg","Ciprofloxacin 250mg","Brufen 400mg"],
    data: [2.2, 3.4, 4.1, 5.6, 6.3, 7.7, 11.9, 14.2, 18.9, 22.6],
    colors: ["#f06548","#f06548","#f06548","#f06548","#f7b84b","#f7b84b","#f7b84b","#0ab39c","#0ab39c","#0ab39c"],

}), []);

    // if (loadingStock) {
    //     return (
    //         <div className="d-flex flex-column align-items-center justify-content-center py-5">
    //             <div
    //                 className="spinner-border text-primary mb-3"
    //                 role="status"
    //                 style={{ width: "3rem", height: "3rem" }}
    //             >
    //                 <span className="visually-hidden">Loading...</span>
    //             </div>

    //             <h6 className="text-muted mb-1">
    //                 Loading Critical Stock Levels
    //             </h6>

    //             <small className="text-muted">
    //                 Calculating days of stock cover...
    //             </small>
    //         </div>
    //     );
    // }

    // if (errorStock) {
    //     return (
    //         <div className="text-danger text-center py-5">
    //             {errorStock}
    //         </div>
    //     );
    // }

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