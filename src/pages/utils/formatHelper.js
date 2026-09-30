/**
 * formatHelper.js
 * Number and currency formatting utilities.
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

export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const num = Number(value);

  if (isNaN(num)) {
    return "0";
  }

  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (
  value,
  currency = "KES",
  decimals = 2
) => {
  const formatted = formatAmount(value, decimals);

  return currency ? `${currency} ${formatted}` : formatted;
};

export const formatCompact = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const num = Number(value);

  if (isNaN(num)) {
    return "0";
  }

  const abs = Math.abs(num);

  if (abs >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }

  if (abs >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }

  return num.toLocaleString("en-US");
};

export default {
  formatAmount,
  formatNumber,
  formatCurrency,
  formatCompact,
};