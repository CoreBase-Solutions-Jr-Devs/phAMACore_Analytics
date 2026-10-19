import React from "react";
import { Spinner } from "reactstrap";

// Shared loading / error / empty states for the three monthly trend cards.
const TrendCardBody = ({ loading, error, empty, height = 350, children }) => {
    if (!loading && !error && !empty) return children;

    return (
        <div
            className={`d-flex justify-content-center align-items-center ${error ? "text-danger" : "text-muted"}`}
            style={{ minHeight: height }}
        >
            {loading ? (
                <>
                    <Spinner size="sm" color="primary" className="me-2" />
                    <span>Loading trend data...</span>
                </>
            ) : (
                <span>{error || "No data for the selected period"}</span>
            )}
        </div>
    );
};

export const exportStamp = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

export const money = (value) =>
    Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default TrendCardBody;
