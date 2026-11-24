import { useCallback, useState } from "react";

/**
 * Provides hover and keyboard-focus handlers that display a FloatingTooltip
 * only when a single-line truncated table cell actually overflows its width.
 */
const useTableCellTooltip = () => {
  const [hoverInfo, setHoverInfo] = useState(null);

  const showOverflowTooltip = useCallback((el, x, y, label, text) => {
    if (!el || el.scrollWidth <= el.clientWidth) {
      setHoverInfo(null);
      return;
    }
    setHoverInfo({
      x,
      y,
      title: label,
      mainValue: text,
      mainColor: "#ffffff",
      badgeColor: "#405189",
    });
  }, []);

  const getCellTooltipHandlers = useCallback(
    (label, text) => ({
      onMouseEnter: (e) => showOverflowTooltip(e.currentTarget, e.clientX, e.clientY, label, text),
      onMouseMove: (e) => {
        if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
          setHoverInfo((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
        }
      },
      onMouseLeave: () => setHoverInfo(null),
      onFocus: (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        showOverflowTooltip(e.currentTarget, rect.left + rect.width / 2, rect.top, label, text);
      },
      onBlur: () => setHoverInfo(null),
    }),
    [showOverflowTooltip]
  );

  const clearTooltip = useCallback(() => setHoverInfo(null), []);

  return { hoverInfo, setHoverInfo, getCellTooltipHandlers, clearTooltip };
};

export default useTableCellTooltip;
