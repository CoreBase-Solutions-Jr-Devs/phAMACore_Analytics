import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VIEWPORT_MARGIN = 12;
const CURSOR_OFFSET = 14;

/**
 * Viewport-aware floating tooltip rendered via a portal so it is never
 * clipped by parent overflow/transform containers or pushed off-screen.
 */
const FloatingTooltip = ({ hoverInfo, maxWidth = 340 }) => {
    const tooltipRef = useRef(null);
    const [pos, setPos] = useState({ left: -9999, top: -9999, ready: false });

    useLayoutEffect(() => {
        if (!hoverInfo || !tooltipRef.current || typeof window === "undefined") {
            return;
        }

        const el = tooltipRef.current;
        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
        const vh = window.innerHeight || document.documentElement.clientHeight || 768;

        const cursorX = Number(hoverInfo.x) || 0;
        const cursorY = Number(hoverInfo.y) || 0;

        // Horizontal: prefer to the right of cursor; flip to left if overflowing right edge
        let left = cursorX + CURSOR_OFFSET;
        if (left + rect.width > vw - VIEWPORT_MARGIN) {
            left = cursorX - rect.width - CURSOR_OFFSET;
        }
        left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - rect.width - VIEWPORT_MARGIN));

        // Vertical: prefer above cursor; flip below if overflowing top edge
        let top = cursorY - rect.height - CURSOR_OFFSET;
        if (top < VIEWPORT_MARGIN) {
            top = cursorY + CURSOR_OFFSET;
        }
        top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - rect.height - VIEWPORT_MARGIN));

        setPos((prev) => {
            if (prev.ready && Math.abs(prev.left - left) < 0.5 && Math.abs(prev.top - top) < 0.5) {
                return prev;
            }
            return { left, top, ready: true };
        });
    }, [hoverInfo]);

    if (!hoverInfo || typeof document === "undefined") {
        return null;
    }

    const title = hoverInfo.title ?? hoverInfo.branch;
    const badgeColor = hoverInfo.badgeColor || hoverInfo.color || "#00e396";

    const tooltipNode = (
        <div
            ref={tooltipRef}
            style={{
                position: "fixed",
                left: `${pos.left}px`,
                top: `${pos.top}px`,
                opacity: pos.ready ? 1 : 0,
                pointerEvents: "none",
                zIndex: 99999,
                backgroundColor: "rgba(33, 37, 41, 0.95)",
                color: "#fff",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "12px",
                lineHeight: "1.4",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25)",
                maxWidth: `${maxWidth}px`,
                width: "max-content",
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                transition: "opacity 0.1s ease",
            }}
        >
            {title && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                        fontWeight: 600,
                        marginBottom: "3px",
                    }}
                >
                    <span
                        style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "50%",
                            backgroundColor: badgeColor,
                            display: "inline-block",
                            flexShrink: 0,
                            marginTop: "4px",
                        }}
                    />
                    <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{title}</span>
                </div>
            )}
            {hoverInfo.mainValue && (
                <div
                    style={{
                        color: hoverInfo.mainColor || "#00e396",
                        fontWeight: 700,
                        fontSize: "13px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                    }}
                >
                    {hoverInfo.mainValue}
                </div>
            )}
            {hoverInfo.subText && (
                <div
                    style={{
                        fontSize: "11px",
                        color: "#adb5bd",
                        marginTop: "2px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                    }}
                >
                    {hoverInfo.subText}
                </div>
            )}
            {hoverInfo.extraText && (
                <div
                    style={{
                        fontSize: "11px",
                        color: "#e9ecef",
                        marginTop: "4px",
                        borderTop: "1px solid rgba(255,255,255,0.12)",
                        paddingTop: "4px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                    }}
                >
                    {hoverInfo.extraText}
                </div>
            )}
        </div>
    );

    return createPortal(tooltipNode, document.body);
};

export default FloatingTooltip;
