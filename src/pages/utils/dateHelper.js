// ===============================
// FORMAT HELPERS
// ===============================

// API FORMAT: DD/MM/YYYY
export const formatToApiDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// UI FORMAT: YYYY-MM-DD (for input type="date")
export const formatToInputDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

// ===============================
// TODAY / YESTERDAY
// ===============================

export const getTodayApi = () => {
  return formatToApiDate(new Date());
};

export const getTodayInput = () => {
  return formatToInputDate(new Date());
};

export const getYesterdayApi = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatToApiDate(d);
};

export const getYesterdayInput = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatToInputDate(d);
};

// ===============================
// LAST 7 DAYS
// ===============================

export const getLast7DaysApi = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  return {
    startDate: formatToApiDate(start),
    endDate: formatToApiDate(end),
  };
};

export const getLast7DaysInput = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  return {
    startDate: formatToInputDate(start),
    endDate: formatToInputDate(end),
  };
};

// ===============================
// YEAR TO DATE
// ===============================

export const getYearToDateApi = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);

  return {
    startDate: formatToApiDate(start),
    endDate: formatToApiDate(today),
  };
};

export const getYearToDateInput = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);

  return {
    startDate: formatToInputDate(start),
    endDate: formatToInputDate(today),
  };
};

// ===============================
// MONTH TO DATE (default dashboard range)
// ===============================

export const DEFAULT_DATE_RANGE = "Month to Date";

export const getMonthToDateApi = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    startDate: formatToApiDate(start),
    endDate: formatToApiDate(today),
  };
};

// ===============================
// RANGE HELPERS (DD/MM/YYYY)
// ===============================

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// DD/MM/YYYY -> local Date (null if not parseable)
export const parseApiDate = (value) => {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || "").trim());
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return isNaN(date.getTime()) ? null : date;
};

// Inclusive number of days in a range, e.g. 01/10 - 11/10 = 11 days
export const getInclusiveDays = (startDate, endDate) => {
  const start = parseApiDate(startDate);
  const end = parseApiDate(endDate);
  if (!start || !end) return 1;
  return Math.max(Math.round((end - start) / 86400000) + 1, 1);
};

export const addDaysApi = (days, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return formatToApiDate(d);
};

/**
 * Split a date range into one window per calendar month, clamped to the range.
 * 01/10/2026 - 11/10/2026 -> [{ key: "2026-10", label: "Oct", ... }]
 * Month to Date therefore costs one request per series instead of one per month of the year.
 */
export const getMonthlyRanges = (startDate, endDate) => {
  const fallback = getMonthToDateApi();
  let start = parseApiDate(startDate) || parseApiDate(fallback.startDate);
  let end = parseApiDate(endDate) || parseApiDate(fallback.endDate);
  if (start > end) [start, end] = [end, start];

  const multiYear = start.getFullYear() !== end.getFullYear();
  const ranges = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end && ranges.length < 36) {
    const monthStart = cursor < start ? start : cursor;
    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const monthEnd = lastDay > end ? end : lastDay;
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const label = MONTH_LABELS[cursor.getMonth()];

    ranges.push({
      key: `${cursor.getFullYear()}-${month}`,
      label: multiYear ? `${label} ${String(cursor.getFullYear()).slice(2)}` : label,
      startDate: formatToApiDate(monthStart),
      endDate: formatToApiDate(monthEnd),
    });

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return ranges;
};
