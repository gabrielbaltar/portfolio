import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./language-context";
import { useTheme } from "./theme-context";
import { Sun, Moon, Globe } from "lucide-react";
import svgPaths from "../../imports/svg-149u5mwuo1";
import { useLocation } from "react-router";
import { useCMS } from "./cms-data";
import { isSectionVisible } from "./site-visibility";
import { normalizePortfolioSectionOrder } from "@portfolio/core";

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { data } = useCMS();
  const menuRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  // Show/hide on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) {
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        // Scrolling down
        setVisible(false);
        if (isOpen) setIsOpen(false);
      } else {
        // Scrolling up
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const orderedSections = normalizePortfolioSectionOrder(data.siteSettings.homeSectionOrder);
  const sectionLinks = orderedSections.flatMap((sectionId) => {
    if (!isSectionVisible(data.siteSettings, sectionId)) {
      return [];
    }

    const baseLink = (label: string, id: string) => [{ label, id }];

    switch (sectionId) {
      case "about":
        return baseLink(t("about"), "about");
      case "projects":
        return baseLink(t("projects"), "projects");
      case "experience":
        return baseLink(t("experience"), "experience");
      case "education":
        return baseLink(t("education"), "education");
      case "certifications":
        return baseLink(t("certificationsTitle"), "certifications");
      case "stack":
        return baseLink(t("tools"), "tools");
      case "gallery":
        return (data.siteSettings.homeGalleryItems || []).some((item) => item.image?.trim())
          ? baseLink(t("galleryTitle"), "gallery")
          : [];
      case "awards":
        return baseLink(t("awardsTitle"), "awards");
      case "recommendations":
        return baseLink(t("recommendationsTitle"), "recommendations");
      case "blog":
        return baseLink(t("blog"), "blog");
      case "contact":
        return baseLink(t("contact"), "contact");
      default:
        return [];
    }
  });
  const desktopSplitIndex = Math.ceil(sectionLinks.length / 2);
  const leftLinks = sectionLinks.slice(0, desktopSplitIndex);
  const rightLinks = sectionLinks.slice(desktopSplitIndex);
  const certificationLink = rightLinks.find((link) => link.id === "certifications");
  const desktopLeftLinks = certificationLink ? [...leftLinks, certificationLink] : leftLinks;
  const desktopRightLinks = certificationLink
    ? rightLinks.filter((link) => link.id !== "certifications")
    : rightLinks;

  const handleClick = (id: string) => {
    setIsOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    window.location.href = `/#${id}`;
  };

  return (
    <motion.div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      ref={menuRef}
      animate={{ y: visible || isOpen ? 0 : -60, opacity: visible || isOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-[10px] h-auto md:h-[40px] flex items-center overflow-hidden shadow-xl backdrop-blur-md w-[220px] md:w-auto"
            style={{ backgroundColor: "var(--nav-bg)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex flex-col md:flex-row items-center px-3 py-3 md:py-0 md:h-full gap-4 md:gap-0 w-full">
              {/* Close button - top on mobile, center on desktop */}
              <div className="flex md:hidden w-full items-center justify-between">
                <span className="font-['Inter',sans-serif] opacity-50" style={{ fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>Menu</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-[6px] w-[30px] h-[30px] shrink-0 cursor-pointer border-none transition-colors"
                  style={{ backgroundColor: "var(--nav-btn-bg)" }}
                >
                  <motion.svg
                    className="w-[11px] h-[11px]"
                    fill="none"
                    viewBox="0 0 12 12"
                    animate={{ rotate: 45 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      clipRule="evenodd"
                      d={svgPaths.p4099a00}
                      fill="var(--text-secondary)"
                      fillRule="evenodd"
                    />
                  </motion.svg>
                </motion.button>
              </div>

              {/* Mobile: vertical links */}
              <div className="flex md:hidden flex-col items-center gap-3 w-full">
                {[...leftLinks, ...rightLinks].map((link, i) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                    whileHover={{ opacity: 1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleClick(link.id)}
                    className="whitespace-nowrap cursor-pointer font-['Inter',sans-serif] bg-transparent border-none w-full text-center py-1 transition-opacity duration-150"
                    style={{ fontSize: "14px", color: "var(--text-secondary)" }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>

              {/* Mobile: bottom controls */}
              <div className="flex md:hidden items-center gap-4 pt-2 w-full justify-center" style={{ borderTop: "1px solid var(--border-primary)" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLang(lang === "pt" ? "en" : "pt")}
                  className="flex items-center gap-1.5 cursor-pointer bg-transparent border-none transition-colors font-['Inter',sans-serif]"
                  style={{ color: "var(--text-secondary)", fontSize: "13px" }}
                >
                  <Globe size={14} />
                  <span>{lang === "pt" ? "EN" : "PT"}</span>
                </motion.button>
                <div className="w-px h-4" style={{ backgroundColor: "var(--border-primary)" }} />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="flex items-center justify-center cursor-pointer bg-transparent border-none transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </motion.button>
              </div>

              {/* Desktop: Left links + lang/theme */}
              <div className="hidden md:flex items-center gap-5 flex-1 justify-end">
                {desktopLeftLinks.map((link, i) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    whileHover={{ opacity: 1, y: -1, transition: { duration: 0.1 } }}
                    onClick={() => handleClick(link.id)}
                    className="whitespace-nowrap cursor-pointer font-['Inter',sans-serif] bg-transparent border-none transition-all duration-100"
                    style={{ fontSize: "13px", lineHeight: "19.6px", color: "var(--text-secondary)" }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>

              {/* Desktop: Center close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="hidden md:flex mx-5 items-center justify-center rounded-[6px] w-[30px] h-[30px] shrink-0 cursor-pointer border-none transition-colors"
                style={{ backgroundColor: "var(--nav-btn-bg)" }}
              >
                <motion.svg
                  className="w-[11px] h-[11px]"
                  fill="none"
                  viewBox="0 0 12 12"
                  animate={{ rotate: 45 }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    clipRule="evenodd"
                    d={svgPaths.p4099a00}
                    fill="var(--text-secondary)"
                    fillRule="evenodd"
                  />
                </motion.svg>
              </motion.button>

              {/* Desktop: Right links + controls */}
              <div className="hidden md:flex items-center gap-5 flex-1 justify-start">
                {desktopRightLinks.map((link, i) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    transition={{ delay: 0.05 * (i + desktopLeftLinks.length), duration: 0.3 }}
                    whileHover={{ opacity: 1, y: -1, transition: { duration: 0.1 } }}
                    onClick={() => handleClick(link.id)}
                    className="whitespace-nowrap cursor-pointer font-['Inter',sans-serif] bg-transparent border-none transition-all duration-100"
                    style={{ fontSize: "13px", lineHeight: "19.6px", color: "var(--text-secondary)" }}
                  >
                    {link.label}
                  </motion.button>
                ))}

                {/* Separator */}
                <div className="w-px h-5 shrink-0" style={{ backgroundColor: "var(--border-primary)" }} />

                {/* Language toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLang(lang === "pt" ? "en" : "pt")}
                  className="flex items-center gap-1 cursor-pointer bg-transparent border-none transition-colors shrink-0 font-['Inter',sans-serif]"
                  style={{ color: "var(--text-secondary)", fontSize: "12px" }}
                  title={lang === "pt" ? "Switch to English" : "Mudar para Portugues"}
                >
                  <Globe size={13} />
                  <span>{lang === "pt" ? "EN" : "PT"}</span>
                </motion.button>

                {/* Theme toggle */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="flex items-center justify-center cursor-pointer bg-transparent border-none transition-colors shrink-0"
                  style={{ color: "var(--text-secondary)" }}
                  title={theme === "dark" ? "Modo claro" : "Modo escuro"}
                >
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center cursor-pointer border-none backdrop-blur-md"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: "var(--nav-bg)",
              border: "1px solid var(--border-primary)",
              boxShadow: theme === "dark"
                ? "0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3)"
                : "0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
            }}
          >
            <svg className="w-[12px] h-[12px]" fill="none" viewBox="0 0 12 12">
              <path
                clipRule="evenodd"
                d={svgPaths.p4099a00}
                fill="var(--text-secondary)"
                fillRule="evenodd"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
