import { useEffect } from "react";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { CMSProvider, useCMS } from "./components/cms-data";
import { LanguageProvider } from "./components/language-context";
import { ThemeProvider } from "./components/theme-context";
import { PasswordProvider } from "./components/password-context";
import { NavMenu } from "./components/nav-menu";
import { initEmailService } from "./components/email-service";
import { LoadingScreen } from "./components/loading-screen";

function PublicRootContent() {
  const { loading, error } = useCMS();

  if (loading) {
    return <LoadingScreen label="Carregando portfolio..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ backgroundColor: "#111111", color: "#fafafa" }}>
        <div>
          <h1 style={{ fontSize: "20px" }}>Erro ao carregar o portfolio</h1>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "8px" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavMenu />
      <Outlet />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}

export function PublicRootLayout() {
  useEffect(() => {
    initEmailService();
  }, []);

  return (
    <CMSProvider mode="public">
      <LanguageProvider>
        <ThemeProvider>
          <PasswordProvider>
            <PublicRootContent />
          </PasswordProvider>
        </ThemeProvider>
      </LanguageProvider>
    </CMSProvider>
  );
}
