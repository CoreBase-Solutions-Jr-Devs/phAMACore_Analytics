import { useEffect, useState } from "react";

/**
 * Finds the nearest scrollable ancestor of `node`, or `null` for the viewport.
 */
function getScrollParent(node) {
  if (!node || node === document.body || node === document.documentElement) {
    return null;
  }
  if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
    const { overflow } = getComputedStyle(node);
    if (overflow !== "visible" && overflow !== "clip") {
      return node;
    }
  }
  return getScrollParent(node.parentNode);
}

/**
 * Tracks whether a `position: sticky` container is currently stuck at its top offset.
 * Uses IntersectionObserver as a fallback for browsers without CSS `scroll-state()` support
 * (e.g. Firefox and Safari).
 *
 * @param {React.RefObject<HTMLElement>} ref - Ref attached to the sticky container element.
 * @returns {boolean} Whether the element is currently in its stuck state.
 */
export default function useStickyState(ref) {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const el = ref?.current;
    if (!el || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    // Native CSS @container scroll-state(stuck: top) handles this without JS in supported browsers.
    if (window.CSS?.supports?.("container-type: scroll-state")) {
      return undefined;
    }

    const root = getScrollParent(el);
    const topOffset = parseFloat(getComputedStyle(el).top) || 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(entry.intersectionRatio < 1);
      },
      {
        root,
        threshold: [1],
        rootMargin: `-${topOffset + 1}px 0px 0px 0px`,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isStuck;
}
