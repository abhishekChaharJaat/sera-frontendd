"use client";

import { useEffect, useRef } from "react";

/**
 * Fixes the mobile keyboard layout issue on iOS Safari.
 * Attach the returned ref to the outermost page container.
 * The container must have `position: fixed; inset-x: 0; top: 0`.
 * This hook sets the container's height and top offset to match
 * the actual visible viewport, so nothing is hidden behind the keyboard.
 */
export function useViewportFix() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const el = ref.current;
      if (!el) return;
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return ref;
}
