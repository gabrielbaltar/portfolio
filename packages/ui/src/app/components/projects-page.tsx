import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Copy, Phone, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { isPublicProjectStatus } from "@portfolio/core";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { ScrollReveal } from "./scroll-reveal";
import { ContentPagination } from "./content-pagination";
import { ProjectPreviewCard } from "./content-preview-cards";
import { copyToClipboard } from "./clipboard-utils";
import { sendContactEmail } from "./email-service";
import { getProfileSocialLinks } from "./profile-social-links";
import { filterVisibleContent, getProjectCardCopy } from "./site-visibility";
import { getVisiblePublicTags } from "./public-tag-utils";

const PROJECTS_PER_PAGE = 6;

export function ProjectsPage() {
  const { data } = useTranslatedCMS();
  const { locale, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, projects: allProjects, siteSettings } = data;
  const projects = filterVisibleContent(
    allProjects.filter((project) => isPublicProjectStatus(project.status)),
    siteSettings,
    "projects",
  );
  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  const rawPage = Number(searchParams.get("page") || "1");
  const currentPage = Number.isFinite(rawPage) ? Math.min(Math.max(1, rawPage), totalPages) : 1;
  const paginatedProjects = projects.slice((currentPage - 1) * PROJECTS_PER_PAGE, currentPage * PROJECTS_PER_PAGE);
  const socialLinks = getProfileSocialLinks(profile);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (page <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(page));
    }
    setSearchParams(nextParams);
  };

  const copyEmail = () => {
    copyToClipboard(profile.email);
    toast.success(t("emailCopied"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t("fillAllFields") || "Preencha todos os campos.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendContactEmail(formData);
      if (result.success) {
        toast.success(t("messageSent"));
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(result.error || "Erro ao enviar mensagem.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-[700px] mx-auto px-4 min-[480px]:px-5 lg:px-0 pt-[64px]">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-[32px] transition-colors"
            style={{ fontSize: "16px", color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={16} /> {t("back")}
          </Link>
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-[22px] leading-[28px] min-[640px]:text-[26px] min-[640px]:leading-[31.2px]"
          style={{ color: "var(--text-primary)" }}
        >
          {t("projectsTitle")}
        </motion.h1>
        <div className="mt-10 grid grid-cols-1 min-[560px]:grid-cols-2 gap-6">
          {paginatedProjects.map((project, i) => {
            const cardCopy = getProjectCardCopy(project, siteSettings);

            return (
              <ScrollReveal key={project.id}>
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <ProjectPreviewCard
                    href={`/projects/${(project as any).slug || project.id}`}
                    title={cardCopy.title}
                    subtitle={cardCopy.subtitle}
                    image={project.cardImage || project.image}
                    imagePosition={project.cardImagePosition || project.imagePosition || "50% 50%"}
                    locked={Boolean((project as any).password && (project as any).password.trim() !== "")}
                    tags={getVisiblePublicTags(project.tags)}
                  />
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
        <ContentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          previousLabel={t("previousPage")}
          nextLabel={t("nextPage")}
          pageLabel={t("pageLabel")}
        />
      </div>

      {/* Contact / Let's talk */}
      <ScrollReveal as="footer" className="w-full max-w-[700px] mx-auto px-4 min-[480px]:px-5 lg:px-0 py-16 mt-8">
        <h2 className="font-['Inter',sans-serif]" style={{ fontSize: "20px", color: "var(--text-primary, #fafafa)" }}>
          {t("letsTalk")}
        </h2>

        <div className="mt-8 flex flex-col min-[720px]:flex-row gap-8 min-[720px]:gap-8">
          {/* Info column */}
          <div className="pl-[17px] min-[720px]:w-[240px] shrink-0 space-y-6" style={{ borderLeft: "1px solid var(--border-primary, #363636)" }}>
            <div>
              <p style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-secondary, #ababab)" }}>
                <span className="font-['Inter',sans-serif] mr-0" style={{ color: "var(--text-primary, #fafafa)" }}>{t("timeForMe")}</span>
                {currentTime.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="font-['Inter',sans-serif]" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>{t("email")}</p>
              <button onClick={copyEmail} className="flex items-center gap-1 mt-1 cursor-pointer bg-transparent border-none" style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-secondary, #ababab)" }}>
                <Copy size={14} /> {profile.email}
              </button>
            </div>
            <div>
              <p className="font-['Inter',sans-serif]" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>{t("phone")}</p>
              <p className="flex items-center gap-1 mt-1" style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-secondary, #ababab)" }}>
                <Phone size={14} /> {profile.phone}
              </p>
            </div>
            <div>
              <p className="font-['Inter',sans-serif] mb-2" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>{t("socials")}</p>
              <div className="space-y-2">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 transition-colors" style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-secondary, #ababab)" }}>
                    <ExternalLink size={14} /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="flex-1 min-[720px]:max-w-[388px]">
            <p className="font-['Inter',sans-serif] mb-4" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>{t("reachOut")}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t("yourName")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none"
                style={{ fontSize: "14px", backgroundColor: "var(--bg-secondary, #242424)", border: "1px solid var(--border-primary, #363636)", color: "var(--text-primary, #fafafa)" }}
              />
              <input
                type="email"
                placeholder={t("yourEmail")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none"
                style={{ fontSize: "14px", backgroundColor: "var(--bg-secondary, #242424)", border: "1px solid var(--border-primary, #363636)", color: "var(--text-primary, #fafafa)" }}
              />
              <textarea
                placeholder={t("message")}
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none resize-none"
                style={{ fontSize: "14px", backgroundColor: "var(--bg-secondary, #242424)", border: "1px solid var(--border-primary, #363636)", color: "var(--text-primary, #fafafa)" }}
              />
              <motion.button
                type="submit"
                className="w-full rounded-md py-2.5 cursor-pointer border-none disabled:opacity-60"
                style={{ fontSize: "16px", backgroundColor: "var(--btn-primary-bg, #fafafa)", color: "var(--btn-primary-text, #121212)" }}
                whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
              >
                {submitting ? "Enviando..." : t("sendMessage")}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-4 flex flex-col min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between gap-2" style={{ borderTop: "1px solid var(--border-primary, #363636)" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary, #ababab)" }}>
            {t("designedIn")}{" "}
            <a href="https://figma.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary, #fafafa)" }}>Figma</a>{" "}
            {t("by")}{" "}
            <span style={{ color: "var(--text-primary, #fafafa)" }}>Gabriel Baltar</span>
          </p>
          <p style={{ fontSize: "14px", color: "var(--text-secondary, #ababab)" }}>
            &copy; {t("copyright")} {new Date().getFullYear()}
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
