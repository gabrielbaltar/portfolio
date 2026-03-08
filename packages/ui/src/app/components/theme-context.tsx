import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// CSS custom properties for each theme
const themes = {
  dark: {
    "--bg-primary": "#111111",
    "--bg-secondary": "#242424",
    "--bg-tertiary": "#1a1a1a",
    "--border-primary": "#363636",
    "--border-secondary": "#242424",
    "--text-primary": "#fafafa",
    "--text-secondary": "#ababab",
    "--text-muted": "#555555",
    "--accent-green": "#00ff3c",
    "--btn-primary-bg": "#fafafa",
    "--btn-primary-text": "#111111",
    "--nav-bg": "#242424",
    "--nav-btn-bg": "#111111",
  },
  light: {
    "--bg-primary": "#f5f5f5",
    "--bg-secondary": "#ffffff",
    "--bg-tertiary": "#e8e8e8",
    "--border-primary": "#d4d4d4",
    "--border-secondary": "#e5e5e5",
    "--text-primary": "#111111",
    "--text-secondary": "#555555",
    "--text-muted": "#999999",
    "--accent-green": "#00c22e",
    "--btn-primary-bg": "#111111",
    "--btn-primary-text": "#fafafa",
    "--nav-bg": "#ffffff",
    "--nav-btn-bg": "#f0f0f0",
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem("portfolio-theme");
      return (stored as Theme) || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const vars = themes[theme];
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for rendering outside provider (e.g. Figma preview)
    return { theme: "dark" as Theme, toggleTheme: () => {} };
  }
  return ctx;
}