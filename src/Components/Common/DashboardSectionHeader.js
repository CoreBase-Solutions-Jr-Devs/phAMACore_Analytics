import React, { useRef } from "react";
import useStickyState from "../../hooks/useStickyState";

/**
 * Shared dashboard section header with non-sticky KPI export/print actions
 * and a sticky filter summary + Filter trigger bar that stays accessible while scrolling.
 */
const DashboardSectionHeader = ({
  title = "KEY METRICS",
  pageLabel = "",
  isBranchView = false,
  branchDisplayName = "",
  startDate = "",
  endDate = "",
  stockAsOf = null,
  onExportExcel,
  onPrint,
  onFilterClick,
}) => {
  const stickyRef = useRef(null);
  const isStuck = useStickyState(stickyRef);

  return (
    <>
      {/* Top Row: Section Title + KPI Export/Print Actions (scrolls normally) */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h4 className="card-title mb-0">{title}</h4>

        {(onExportExcel || onPrint) && (
          <div className="d-flex align-items-center gap-2 no-print">
            {onExportExcel && (
              <button
                type="button"
                className="btn btn-soft-success btn-export-excel d-flex align-items-center gap-1"
                onClick={onExportExcel}
                title="Export to Excel"
              >
                <i className="ri-file-excel-2-line align-bottom"></i>
                <span>Export Excel</span>
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                className="btn btn-soft-info btn-export-print d-flex align-items-center gap-1"
                onClick={onPrint}
                title="Print Dashboard"
              >
                <i className="ri-printer-line align-bottom"></i>
                <span>Print</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sticky Filter Bar: Remains pinned below the top navbar while scrolling */}
      <div
        ref={stickyRef}
        className={`sticky-filter-container mb-3${isStuck ? " is-stuck" : ""}`}
      >
        <div className="sticky-filter-bar d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap text-muted fs-13">
            {pageLabel && (
              <>
                <span className="fw-semibold text-dark">{pageLabel}</span>
                <span className="mx-1 text-muted">|</span>
              </>
            )}
            {isBranchView && branchDisplayName && (
              <>
                <span>Branch:</span>
                <strong className="text-primary">{branchDisplayName}</strong>
                <span className="mx-1 text-muted">|</span>
              </>
            )}
            <span>Filtered From:</span>
            <strong className="text-dark">{startDate || ""}</strong>
            <span>to</span>
            <strong className="text-dark">{endDate || ""}</strong>
            {stockAsOf && (
              <>
                <span className="mx-1 text-muted">|</span>
                <span>Stock as at:</span>
                <strong className="text-dark">{stockAsOf}</strong>
              </>
            )}
          </div>

          {onFilterClick && (
            <div className="d-flex align-items-center gap-2 no-print">
              <button
                type="button"
                className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
                onClick={onFilterClick}
                title="Filter by Branch & Date Range"
              >
                <i className="ri-filter-fill align-bottom"></i>
                <span>Filter</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardSectionHeader;
