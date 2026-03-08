import { Outlet } from "react-router";
import { NavMenu } from "./nav-menu";
import { Toaster } from "sonner";
import { CMSProvider } from "./cms-data";
import { LanguageProvider } from "./language-context";
import { ThemeProvider } from "./theme-context";
import { useEffect } from "react";
import { initEmailService } from "./email-service";
import { PasswordProvider } from "./password-context";

export function RootLayout() {
  useEffect(() => {
    initEmailService();
  }, []);

  return (
    <CMSProvider>
      <LanguageProvider>
        <ThemeProvider>
          <PasswordProvider>
            <NavMenu />
            <Outlet />
            <Toaster theme="dark" position="bottom-right" />
          </PasswordProvider>
        </ThemeProvider>
      </LanguageProvider>
    </CMSProvider>
  );
}