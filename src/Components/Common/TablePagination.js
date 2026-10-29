import React, { useEffect, useState } from "react";

const DOTS = "dots";
const MOBILE_QUERY = "(max-width: 575.98px)";

// Windowed page list: first, last, current ± siblings, with ellipses between.
// Never more than 5 + 2 * siblings slots, however many pages there are.
export const getPageRange = (pageIndex, pageCount, siblings = 1) => {
    const maxSlots = 5 + 2 * siblings;
    if (pageCount <= maxSlots) return Array.from({ length: pageCount }, (_, i) => i);

    const last = pageCount - 1;
    const left = Math.max(pageIndex - siblings, 1);
    const right = Math.min(pageIndex + siblings, last - 1);
    const edgeSpan = 3 + 2 * siblings; // pages shown when the window touches an edge

    if (left <= 2) return [...Array.from({ length: edgeSpan }, (_, i) => i), DOTS, last];
    if (right >= last - 2) return [0, DOTS, ...Array.from({ length: edgeSpan }, (_, i) => last - edgeSpan + 1 + i)];

    const middle = Array.from({ length: right - left + 1 }, (_, i) => left + i);
    return [0, DOTS, ...middle, DOTS, last];
};

const useIsMobile = () => {
    const getMatch = () => typeof window !== "undefined" && window.matchMedia?.(MOBILE_QUERY).matches;
    const [isMobile, setIsMobile] = useState(getMatch);

    useEffect(() => {
        const mql = window.matchMedia?.(MOBILE_QUERY);
        if (!mql) return undefined;
        const onChange = (e) => setIsMobile(e.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return isMobile;
};

const PageButton = ({ disabled, active, onClick, label, children }) => (
    <li className={`page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`}>
        <button
            type="button"
            className="page-link"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-current={active ? "page" : undefined}
        >
            {children}
        </button>
    </li>
);

const TablePagination = ({ pageIndex, pageCount, totalResults, pageSize, onPageChange }) => {
    const isMobile = useIsMobile();
    const pages = getPageRange(pageIndex, pageCount, isMobile ? 0 : 1);
    const start = totalResults === 0 ? 0 : pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, totalResults);

    return (
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 mt-2">
            <div className="text-muted small text-center text-sm-start">
                Showing <span className="fw-semibold">{start.toLocaleString()}</span> -{" "}
                <span className="fw-semibold">{end.toLocaleString()}</span> of{" "}
                <span className="fw-semibold">{totalResults.toLocaleString()}</span> Results
            </div>

            {pageCount > 1 && (
                <ul className="pagination pagination-separated pagination-sm flex-wrap justify-content-center mb-0">
                    <PageButton disabled={pageIndex === 0} onClick={() => onPageChange(pageIndex - 1)} label="Previous page">
                        <i className="ri-arrow-left-s-line align-middle"></i>
                        <span className="d-none d-sm-inline ms-1">Previous</span>
                    </PageButton>

                    {pages.map((page, i) =>
                        page === DOTS ? (
                            <li key={`dots-${i}`} className="page-item disabled">
                                <span className="page-link">…</span>
                            </li>
                        ) : (
                            <PageButton
                                key={page}
                                active={page === pageIndex}
                                onClick={() => onPageChange(page)}
                                label={`Page ${page + 1}`}
                            >
                                {page + 1}
                            </PageButton>
                        )
                    )}

                    <PageButton disabled={pageIndex >= pageCount - 1} onClick={() => onPageChange(pageIndex + 1)} label="Next page">
                        <span className="d-none d-sm-inline me-1">Next</span>
                        <i className="ri-arrow-right-s-line align-middle"></i>
                    </PageButton>
                </ul>
            )}
        </div>
    );
};

export default TablePagination;