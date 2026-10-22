/**
 * format_helper.js
 * Utility functions for formatting numbers, currency, and metrics across dashboards.
 */

/**
 * Formats a number with comma separators (thousands) and a fixed number of decimals.
 * Example: formatAmount(1234567.89, 2) => "1,234,567.89"
 *
 * @param {number|string} value - The numerical value to format.
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {string} Formatted number string with commas.
 */
export const formatAmount = (value, decimals = 2) => {
    if (value === null || value === undefined || value === "") {
        return "0" + (decimals > 0 ? "." + "0".repeat(decimals) : "");
    }
    const num = Number(value);
    if (isNaN(num)) {
        return "0" + (decimals > 0 ? "." + "0".repeat(decimals) : "");
    }
    return num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * Formats a number with comma separators and optional decimals (defaults to 0 decimals).
 * Example: formatNumber(1234567) => "1,234,567"
 *
 * @param {number|string} value - The numerical value to format.
 * @param {number} [decimals=0] - Number of decimal places.
 * @returns {string} Formatted number string with commas.
 */
export const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined || value === "") return "0";
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * Formats a number as currency with a prefix and commas.
 * Example: formatCurrency(1234567.89, "KES", 2) => "KES 1,234,567.89"
 *
 * @param {number|string} value - The numerical value to format.
 * @param {string} [currency="KES"] - Currency symbol/code prefix.
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (value, currency = "KES", decimals = 2) => {
    const formatted = formatAmount(value, decimals);
    return currency ? `${currency} ${formatted}` : formatted;
};

/**
 * Formats large numbers compactly with suffixes (K, M, B).
 * Example: formatCompact(1500000) => "1.5M"
 *
 * @param {number|string} value - The numerical value to format.
 * @returns {string} Compact formatted string.
 */
export const formatCompact = (value) => {
    if (value === null || value === undefined || value === "") return "0";
    const num = Number(value);
    if (isNaN(num)) return "0";
    const abs = Math.abs(num);
    if (abs >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1) + "B";
    }
    if (abs >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + "M";
    }
    if (abs >= 1_000) {
        return (num / 1_000).toFixed(1) + "K";
    }
    return num.toLocaleString("en-US");
};

export default {
    formatAmount,
    formatNumber,
    formatCurrency,
    formatCompact,
};
