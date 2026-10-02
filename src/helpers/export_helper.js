/**
 * Export Helper for phAMACore Analytics
 * Supports generating and downloading Excel-compatible CSV files with UTF-8 BOM,
 * and triggering browser print for dashboards.
 */

// Format numbers or escape strings containing commas, quotes, or newlines
const formatCell = (val) => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Converts array of rows/objects or structured sections into a CSV string with BOM
 */
export const generateCsvContent = (data, headers = null) => {
  if (!Array.isArray(data) || data.length === 0) return "";

  const lines = [];

  if (headers && Array.isArray(headers)) {
    lines.push(headers.map(formatCell).join(","));
    data.forEach((row) => {
      if (Array.isArray(row)) {
        lines.push(row.map(formatCell).join(","));
      } else if (typeof row === "object" && row !== null) {
        lines.push(headers.map((h) => formatCell(row[h] ?? "")).join(","));
      }
    });
  } else if (typeof data[0] === "object" && !Array.isArray(data[0])) {
    const keys = Object.keys(data[0]);
    lines.push(keys.map(formatCell).join(","));
    data.forEach((row) => {
      lines.push(keys.map((k) => formatCell(row[k] ?? "")).join(","));
    });
  } else {
    data.forEach((row) => {
      if (Array.isArray(row)) {
        lines.push(row.map(formatCell).join(","));
      } else {
        lines.push(formatCell(row));
      }
    });
  }

  // Prepend UTF-8 BOM so Microsoft Excel correctly parses UTF-8 encoding
  return "\uFEFF" + lines.join("\r\n");
};

/**
 * Download a CSV file that opens directly in Microsoft Excel
 */
export const downloadExcelCsv = (csvContent, fileName = "Export") => {
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const cleanFileName = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  link.setAttribute("download", cleanFileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export tabular data to Excel
 */
export const exportToExcel = (data, fileName = "Export", headers = null) => {
  const csv = generateCsvContent(data, headers);
  downloadExcelCsv(csv, fileName);
};

/**
 * Export a structured multi-section dashboard report to Excel
 */
export const exportDashboardReportToExcel = (
  { title, metadata = [], sections = [] },
  fileName = "Dashboard_Report"
) => {
  const lines = [];

  // Title
  if (title) {
    lines.push([`=== ${title.toUpperCase()} ===`]);
    lines.push([]);
  }

  // Metadata
  if (metadata.length > 0) {
    metadata.forEach((m) => {
      lines.push([m.label, m.value]);
    });
    lines.push([]);
  }

  // Sections
  sections.forEach((sec) => {
    if (sec.title) {
      lines.push([`--- ${sec.title.toUpperCase()} ---`]);
    }
    if (sec.headers && Array.isArray(sec.headers)) {
      lines.push(sec.headers);
    }
    if (Array.isArray(sec.data)) {
      sec.data.forEach((row) => {
        if (Array.isArray(row)) {
          lines.push(row);
        } else if (typeof row === "object" && row !== null && sec.headers) {
          lines.push(sec.headers.map((h) => row[h] ?? ""));
        } else if (typeof row === "object" && row !== null) {
          lines.push(Object.values(row));
        }
      });
    }
    lines.push([]); // blank line between sections
  });

  const formattedLines = lines.map((row) => row.map(formatCell).join(","));
  const csvContent = "\uFEFF" + formattedLines.join("\r\n");
  downloadExcelCsv(csvContent, fileName);
};

/**
 * Native Browser Print Trigger
 */
export const triggerPrint = () => {
  if (typeof window !== "undefined") {
    window.print();
  }
};
