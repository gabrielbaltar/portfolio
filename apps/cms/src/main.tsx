import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PostHogProvider } from "@posthog/react";
import App from "./App";
import "@portfolio/ui/styles/index.css";

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (posthogKey && posthogHost) {
  const options = {
    api_host: posthogHost,
    defaults: "2026-01-30",
  } as const;

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <PostHogProvider apiKey={posthogKey} options={options}>
        <App />
      </PostHogProvider>
    </StrictMode>,
  );
} else {
  createRoot(document.getElementById("root")!).render(app);
}
