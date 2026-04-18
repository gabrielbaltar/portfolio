import { useEffect } from "react";
import { useLocation } from "react-router";
import { usePostHog } from "@posthog/react";

const PAGEVIEW_DEDUP_WINDOW_MS = 1500;
const recentPageviews = new Map<string, number>();

function shouldCapturePageview(pageKey: string) {
  const now = Date.now();
  const lastCapturedAt = recentPageviews.get(pageKey);

  if (lastCapturedAt && now - lastCapturedAt < PAGEVIEW_DEDUP_WINDOW_MS) {
    return false;
  }

  recentPageviews.set(pageKey, now);

  if (recentPageviews.size > 128) {
    for (const [key, capturedAt] of recentPageviews) {
      if (now - capturedAt > 5 * 60 * 1000) {
        recentPageviews.delete(key);
      }
    }
  }

  return true;
}

export function PostHogRouteTracker({ appName }: { appName: string }) {
  const posthog = usePostHog();
  const location = useLocation();

  useEffect(() => {
    const currentUrl = window.location.href;
    const pageKey = `${appName}:${currentUrl}`;

    if (!shouldCapturePageview(pageKey)) {
      return;
    }

    posthog.capture("$pageview", {
      app_name: appName,
      $current_url: currentUrl,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [appName, location.hash, location.pathname, location.search, posthog]);

  return null;
}
