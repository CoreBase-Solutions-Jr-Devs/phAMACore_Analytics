/**
 * Small helpers for reading PowerBI API responses without depending on
 * how the backend cases its column names (CUS_CODE / cuS_CODE / cus_code).
 */

/** Unwrap an axios/API response into a plain array of rows. */
export const toList = (response) => {
  let data = response?.data ?? response;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.result)) return data.result;
  if (data?.result && typeof data.result === "object") return [data.result];
  if (data && typeof data === "object") return [data];
  return [];
};

const normKey = (key) => String(key).toLowerCase().replace(/[^a-z0-9]/g, "");

/** Read the first defined field from a row, ignoring case and underscores. */
export const pick = (row, ...names) => {
  if (!row || typeof row !== "object") return undefined;
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== null) return row[name];
  }
  const wanted = names.map(normKey);
  for (const key of Object.keys(row)) {
    if (wanted.includes(normKey(key)) && row[key] !== null && row[key] !== undefined) {
      return row[key];
    }
  }
  return undefined;
};

/** Parse numbers that may arrive as "1,234.50", "(120.00)" or "25.94%". */
export const num = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined) return 0;
  const str = String(value).trim();
  const negative = str.startsWith("-") || (str.startsWith("(") && str.endsWith(")"));
  const parsed = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(parsed)) return 0;
  return negative ? -parsed : parsed;
};

/** Value of a named metric in a SUMMARY (metric_name / metric_value) response. */
export const metric = (rows, name) => {
  const target = normKey(name);
  const match = (rows || []).find((r) => normKey(pick(r, "metric_name") ?? "") === target);
  return match ? num(pick(match, "metric_value")) : 0;
};
