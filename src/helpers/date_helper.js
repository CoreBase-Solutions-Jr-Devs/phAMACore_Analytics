/**
 * dateHelper.js
 * Reusable date utilities for dashboard/API requests.
 */

/**
 * Format a Date object as DD/MM/YYYY.
 */
export const formatDate = (date) => {
  return date.toLocaleDateString("en-GB");
};

/**
 * Convert DD/MM/YYYY to the same date in the previous year.
 */
export const getPreviousYearDate = (dateString) => {
  const [day, month, year] = dateString.split("/");

  return `${day}/${month}/${Number(year) - 1}`;
};

/**
 * Get YYYYMM period from DD/MM/YYYY.
 * Example: 07/10/2026 -> 202610
 */
export const getPeriod = (dateString) => {
  const [day, month, year] = dateString.split("/");

  return `${year}${month}`;
};

/**
 * Get commonly used dashboard date ranges.
 */
export const getDateRanges = () => {
  const today = new Date();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  return {
    // Current year
    currentYearStart: formatDate(
      new Date(currentYear, 0, 1)
    ),

    // Current month
    currentMonthStart: formatDate(
      new Date(currentYear, currentMonth, 1)
    ),

    // Today
    today: formatDate(today),

    // Previous year
    lastYearStart: formatDate(
      new Date(currentYear - 1, 0, 1)
    ),

    // Same month last year
    lastYearMonthStart: formatDate(
      new Date(currentYear - 1, currentMonth, 1)
    ),

    // Same day last year
    lastYearToday: formatDate(
      new Date(currentYear - 1, currentMonth, currentDay)
    ),
  };
};