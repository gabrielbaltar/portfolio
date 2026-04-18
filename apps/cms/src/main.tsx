import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PostHogProvider } from "@posthog/react";
import App from "./App";
import "@portfolio/ui/styles/index.css";

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY?.trim();
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (posthogKey) {
  const options = {
    api_host: posthogHost,
    defaults: "2026-01-30",
    capture_pageview: false,
  } as const;

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <PostHogProvider apiKey={posthogKey} options={options}>
        <App />
      </PostHogProvider>
    </StrictMode>,
  );
} else {
  console.warn("[PostHog] VITE_PUBLIC_POSTHOG_KEY is missing; analytics disabled for apps/cms.");
  createRoot(document.getElementById("root")!).render(app);
}
