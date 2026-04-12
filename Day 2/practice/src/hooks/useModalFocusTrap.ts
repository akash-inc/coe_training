import { type RefObject, useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled"),
  );
}

/**
 * Keeps keyboard focus inside `containerRef` while `active` is true (Tab / Shift+Tab wrap).
 * Moves focus to the first focusable element when activated; restores the previously focused
 * element on deactivate if focus is still inside the container.
 */
export function useModalFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key !== "Tab") return;
      const nodes = getFocusableElements(container);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey) {
        if (activeEl === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    }

    container.addEventListener("keydown", handleKeyDown);

    queueMicrotask(() => {
      const nodes = getFocusableElements(container);
      if (nodes.length > 0) {
        nodes[0].focus();
      } else {
        container.focus();
      }
    });

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      if (container.contains(document.activeElement)) {
        previousActiveElement?.focus?.();
      }
    };
  }, [active]);
}
