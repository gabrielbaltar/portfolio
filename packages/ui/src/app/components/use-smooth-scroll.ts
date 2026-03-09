import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const SMOOTH_SCROLL_MEDIA = "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function normalizeWheelDelta(event: WheelEvent) {
  const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 28 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
  return event.deltaY * multiplier;
}

function canElementScroll(element: HTMLElement, deltaY: number) {
  const overflowY = window.getComputedStyle(element).overflowY;
  const scrollable = ["auto", "scroll", "overlay"].includes(overflowY);
  if (!scrollable || element.scrollHeight <= element.clientHeight + 1) return false;

  if (deltaY < 0) {
    return element.scrollTop > 0;
  }

  if (deltaY > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }

  return false;
}

function shouldPreserveNativeScroll(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof HTMLElement)) return false;

  if (target.closest("input, textarea, select, [contenteditable='true'], [data-native-scroll='true']")) {
    return true;
  }

  let current: HTMLElement | null = target;
  while (current && current !== document.body) {
    if (canElementScroll(current, deltaY)) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
}

export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(SMOOTH_SCROLL_MEDIA);
    let cleanupActiveScroll: (() => void) | null = null;

    const setupSmoothScroll = () => {
      if (!mediaQuery.matches) return null;

      let targetY = window.scrollY;
      let tween: gsap.core.Tween | null = null;

      const syncTarget = () => {
        if (!tween?.isActive()) {
          targetY = window.scrollY;
        }
      };

      const animateToTarget = () => {
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        targetY = gsap.utils.clamp(0, maxScroll, targetY);

        tween?.kill();
        tween = gsap.to(window, {
          duration: 0.9,
          ease: "power3.out",
          overwrite: true,
          scrollTo: {
            y: targetY,
            autoKill: false,
          },
          onComplete: () => {
            tween = null;
            targetY = window.scrollY;
          },
        });
      };

      const handleWheel = (event: WheelEvent) => {
        if (document.body.style.overflow === "hidden") return;
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

        const deltaY = normalizeWheelDelta(event);
        if (Math.abs(deltaY) < 1) return;
        if (shouldPreserveNativeScroll(event.target, deltaY)) return;

        event.preventDefault();
        targetY += deltaY * 1.08;
        animateToTarget();
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("scroll", syncTarget, { passive: true });

      return () => {
        tween?.kill();
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("scroll", syncTarget);
      };
    };

    const refresh = () => {
      cleanupActiveScroll?.();
      cleanupActiveScroll = setupSmoothScroll();
    };

    refresh();
    mediaQuery.addEventListener("change", refresh);

    return () => {
      cleanupActiveScroll?.();
      mediaQuery.removeEventListener("change", refresh);
    };
  }, []);
}
