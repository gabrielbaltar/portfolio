import { useEffect, useState, type ReactNode } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

function CMSViewportGate({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1000;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1000px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  if (isDesktop) {
    return <>{children}</>;
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
    >
      <div className="max-w-[320px]">
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[14px]"
          style={{ backgroundColor: "#141414", border: "1px solid #242424" }}
        >
          <span style={{ fontSize: "20px", lineHeight: 1 }}>+</span>
        </div>
        <h1 style={{ fontSize: "20px", lineHeight: "30px" }}>Use o CMS no computador</h1>
        <p style={{ fontSize: "13px", lineHeight: "19.5px", color: "#666", marginTop: "8px" }}>
          O painel administrativo foi otimizado para larguras a partir de 1000px.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CMSViewportGate>
      <div className="cms-app min-h-screen">
        <RouterProvider router={router} />
      </div>
    </CMSViewportGate>
  );
}
