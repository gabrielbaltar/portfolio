import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MapPin, ExternalLink, ChevronRight, Mail, Copy, Phone, Check } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  clampStackLogoRadius,
  DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT,
  DEFAULT_STACK_LOGO_RADIUS,
  getProfileAboutParagraphs,
  isPublicProjectStatus,
  normalizePortfolioSectionOrder,
  type PortfolioSectionId,
} from "@portfolio/core";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { ScrollReveal } from "./scroll-reveal";
import { StaggerChildren, StaggerItem } from "./stagger-children";
import { ContentImage } from "./content-image";
import { ArticlePreviewCard, ProjectPreviewCard } from "./content-preview-cards";
import { sendContactEmail } from "./email-service";
import { copyToClipboard } from "./clipboard-utils";
import { getProfileSocialLinks } from "./profile-social-links";
import { filterVisibleContent, getArticleCardCopy, getProjectCardCopy, isSectionVisible } from "./site-visibility";
import { isRichTextEmpty, RichTextContent } from "./rich-text";

const CERTIFICATIONS_PREVIEW_LIMIT = 6;

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`font-['Inter',sans-serif] mb-0 ${className}`}
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </h2>
  );
}

function hasExternalUrl(value?: string | null) {
  return Boolean(value && value.trim() && value !== "#");
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getHomeGalleryCardLayout(index: number) {
  const layouts = [
    { className: "sm:col-span-7 sm:row-span-2", minHeight: 420 },
    { className: "sm:col-span-5 sm:row-span-1", minHeight: 200 },
    { className: "sm:col-span-5 sm:row-span-1", minHeight: 200 },
    { className: "sm:col-span-4 sm:row-span-1", minHeight: 220 },
    { className: "sm:col-span-8 sm:row-span-1", minHeight: 220 },
    { className: "sm:col-span-6 sm:row-span-1", minHeight: 220 },
  ];

  return layouts[index % layouts.length];
}

export function PortfolioHome() {
  const { data, isTranslating } = useTranslatedCMS();
  const { siteSettings, profile, projects, experiences, education, certifications, stack, awards, recommendations, blogPosts } = data;
  const { lang, locale, t } = useLanguage();
  const [emailCopied, setEmailCopied] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [showAllCertifications, setShowAllCertifications] = useState(false);

  const copyEmail = () => {
    copyToClipboard(profile.email);
    setEmailCopied(true);
    toast.success(t("emailCopied"));
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Contact Form] handleSubmit called", formData);
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t("fillAllFields") || "Preencha todos os campos.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await sendContactEmail(formData);
      console.log("[Contact Form] Result:", result);
      if (result.success) {
        toast.success(t("messageSent"));
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(result.error || "Erro ao enviar mensagem.");
      }
    } catch (err) {
      console.error("[Contact Form] Unexpected error:", err);
      toast.error("Erro inesperado ao enviar mensagem.");
    } finally {
      setSubmitting(false);
    }
  };

  const publishedProjects = filterVisibleContent(
    projects.filter((project) => isPublicProjectStatus(project.status)),
    siteSettings,
    "projects",
  );
  const publishedBlogPosts = filterVisibleContent(
    blogPosts.filter((post) => !post.status || post.status === "published"),
    siteSettings,
    "blogPosts",
  );
  const visibleExperiences = filterVisibleContent(experiences, siteSettings, "experiences");
  const visibleEducation = filterVisibleContent(education, siteSettings, "education");
  const visibleCertifications = filterVisibleContent(certifications, siteSettings, "certifications");
  const visibleStack = filterVisibleContent(stack, siteSettings, "stack");
  const visibleAwards = filterVisibleContent(awards, siteSettings, "awards");
  const visibleRecommendations = filterVisibleContent(recommendations, siteSettings, "recommendations");
  const displayedProjects = publishedProjects.slice(0, 4);
  const displayedBlogPosts = publishedBlogPosts.slice(0, 4);
  const hasHiddenCertifications = visibleCertifications.length > CERTIFICATIONS_PREVIEW_LIMIT;
  const displayedCertifications = showAllCertifications
    ? visibleCertifications
    : visibleCertifications.slice(0, CERTIFICATIONS_PREVIEW_LIMIT);
  const aboutParagraphs = getProfileAboutParagraphs(profile).filter((paragraph) => !isRichTextEmpty(paragraph));
  const hasAboutTitle = !isRichTextEmpty(profile.aboutTitle);
  const stackSectionTitle = (
    lang === "en"
      ? siteSettings.stackSectionTitleEn?.trim()
      : siteSettings.stackSectionTitlePt?.trim()
  ) || t("stackTitle");
  const homeGalleryTitle = (
    lang === "en"
      ? siteSettings.homeGalleryTitleEn?.trim()
      : siteSettings.homeGalleryTitlePt?.trim()
  ) || t("galleryTitle");
  const homeGalleryIntro = (
    lang === "en"
      ? siteSettings.homeGalleryIntroEn?.trim()
      : siteSettings.homeGalleryIntroPt?.trim()
  ) || "";
  const homeGalleryItems = (siteSettings.homeGalleryItems || []).filter((item) => item.image?.trim());
  const orderedHomeSections = normalizePortfolioSectionOrder(siteSettings.homeSectionOrder);
  const homeSectionOrderMap = new Map<PortfolioSectionId, number>(
    orderedHomeSections.map((sectionId, index) => [sectionId, index]),
  );
  const getSectionOrderValue = (sectionId: PortfolioSectionId) =>
    homeSectionOrderMap.get(sectionId) ?? orderedHomeSections.length;
  const displayName = profile.name || siteSettings.siteTitle || "Portfolio";
  const avatarLabel = getInitials(displayName) || "Foto";
  const socialLinks = getProfileSocialLinks(profile, ["twitter", "linkedin"]).filter((item) => hasExternalUrl(item.url));
  const footerSocialLinks = getProfileSocialLinks(profile);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Translating indicator */}
      {/* removed green progress bar */}

      {/* Header / Intro */}
      <header id="intro" className="max-w-[700px] mx-auto px-5 pt-24 md:pt-28">
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="shrink-0"
          >
            <ContentImage
              src={profile.photo}
              alt={displayName}
              emptyLabel={avatarLabel}
              className="rounded-xl object-cover"
              style={{ width: "122px", height: "122px", border: "1px solid var(--border-primary)" }}
            />
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between gap-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center sm:text-left"
              >
                <h1 style={{ fontSize: "22px", lineHeight: "26.4px", color: "var(--text-primary)" }}>
                  {displayName}
                </h1>
                {profile.role && (
                  <p className="mt-1" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                    {profile.role}
                  </p>
                )}
                {profile.location && (
                  <p className="flex items-center justify-center sm:justify-start gap-1 mt-1" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    <MapPin size={14} />
                    {profile.location}
                  </p>
                )}
                {profile.available ? (
                  <p className="flex items-center justify-center sm:justify-start gap-2 mt-2" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    <span className="availability-indicator" aria-hidden="true">
                      <span className="availability-indicator__glow" />
                      <span className="availability-indicator__core" />
                    </span>
                    {profile.availableText}
                  </p>
                ) : profile.currentJobTitle || profile.currentCompany ? (
                  <span style={{ color: "var(--text-secondary)" }}>
                    {profile.currentJobTitle}
                    {profile.currentCompany ? (
                      <>
                        {" @"}
                        {profile.currentCompanyUrl ? (
                          <a
                            href={profile.currentCompanyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-dotted underline-offset-2 transition-colors hover:opacity-80"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {profile.currentCompany}
                          </a>
                        ) : (
                          profile.currentCompany
                        )}
                      </>
                    ) : ""}
                  </span>
                ) : null}
              </motion.div>

              {/* Right links */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col items-center sm:items-end gap-2"
              >
                {hasExternalUrl(siteSettings.templateUrl) && (
                  <a
                    href={siteSettings.templateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 underline underline-offset-2 transition-colors"
                    style={{ fontSize: "16px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                  >
                    <ExternalLink size={16} />
                    {t("getTemplate")}
                  </a>
                )}
                {hasExternalUrl(siteSettings.resumeUrl) && (
                  <a
                    href={siteSettings.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 underline underline-offset-2 transition-colors"
                    style={{ fontSize: "16px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                  >
                    <ExternalLink size={16} />
                    {t("downloadCV")}
                  </a>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Social bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4"
          style={{ borderTop: "1px solid var(--border-primary)" }}
        >
          {profile.email ? (
            <button
              onClick={copyEmail}
              className="flex items-center gap-2 bg-transparent border-none cursor-pointer transition-colors"
              style={{ fontSize: "16px", color: "var(--text-secondary)" }}
            >
              {emailCopied ? <Check size={16} style={{ color: "var(--accent-green)" }} /> : <Copy size={16} />}
              <span>{emailCopied ? t("emailCopied") : profile.email}</span>
            </button>
          ) : <span />}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 transition-colors" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                  <ExternalLink size={14} />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </header>

      <div className="flex flex-col">
      {/* About Me */}
      {isSectionVisible(siteSettings, "about") && (hasAboutTitle || aboutParagraphs.length > 0) && (
        <ScrollReveal
          as="section"
          id="about"
          className="max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("about") }}
        >
          <SectionTitle>
            {hasAboutTitle ? <RichTextContent value={profile.aboutTitle} /> : t("aboutMe")}
          </SectionTitle>
          <div className="mt-6 space-y-4">
            {aboutParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph}`} style={{ fontSize: "16px", lineHeight: "22.4px", color: "var(--text-secondary)" }}>
                <RichTextContent value={paragraph} />
              </p>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Projects */}
      {isSectionVisible(siteSettings, "projects") && displayedProjects.length > 0 && (
        <ScrollReveal
          as="section"
          id="projects"
          className="max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("projects") }}
        >
        <div className="flex items-center justify-between mb-8">
          <SectionTitle>{t("projectsTitle")}</SectionTitle>
          <Link
            to="/projects"
            className="underline underline-offset-2 transition-colors"
            style={{ fontSize: "16px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
          >
            {t("viewAll")}
          </Link>
        </div>
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayedProjects.map((project) => {
            const cardCopy = getProjectCardCopy(project, siteSettings);

            return (
              <StaggerItem key={project.id}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                  <ProjectPreviewCard
                    href={`/projects/${project.slug || project.id}`}
                    title={cardCopy.title}
                    subtitle={cardCopy.subtitle}
                    image={project.cardImage || project.image}
                    imagePosition={project.cardImagePosition || project.imagePosition || "50% 50%"}
                    locked={Boolean((project as any).password && (project as any).password.trim() !== "")}
                  />
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
        </ScrollReveal>
      )}

      {/* Experience */}
      {isSectionVisible(siteSettings, "experience") && visibleExperiences.length > 0 && (
        <ScrollReveal
          as="section"
          id="experience"
          className="max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("experience") }}
        >
        <SectionTitle>{t("experienceTitle")}</SectionTitle>
        <div className="mt-8 space-y-0">
          {visibleExperiences.map((exp) => (
            <div
              key={exp.id}
              className="relative pl-6 pb-10 last:pb-0"
              style={{ borderLeft: "1px solid var(--border-primary)" }}
            >
              {/* Timeline dot */}
              <div
                className="absolute -left-[4px] top-1 w-[7px] h-[7px] rounded-sm"
                style={{ backgroundColor: "var(--text-secondary)" }}
              />
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    {exp.company}
                  </p>
                  <p className="mt-0.5" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                    {exp.role}
                  </p>
                  <p className="mt-0.5" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    {exp.location}
                  </p>
                </div>
                <p className="shrink-0" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {exp.period}
                </p>
              </div>
              {exp.tasks.length > 0 && (
                <ul className="mt-3 space-y-1.5 list-disc list-inside">
                  {exp.tasks.map((task, ti) => (
                    <li
                      key={ti}
                      style={{
                        fontSize: "14px",
                        lineHeight: `${exp.taskLineHeight ?? DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT}px`,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {task}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        </ScrollReveal>
      )}

      {/* Education */}
      {isSectionVisible(siteSettings, "education") && visibleEducation.length > 0 && (
        <ScrollReveal
          as="section"
          id="education"
          className="max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("education") }}
        >
        <SectionTitle>{t("educationTitle")}</SectionTitle>
        <div className="mt-8 space-y-0">
          {visibleEducation.map((edu) => (
            <div
              key={edu.id}
              className="relative pl-6 pb-10 last:pb-0"
              style={{ borderLeft: "1px solid var(--border-primary)" }}
            >
              <div
                className="absolute -left-[4px] top-1 w-[7px] h-[7px] rounded-sm"
                style={{ backgroundColor: "var(--text-secondary)" }}
              />
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div>
                  <p style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                    {edu.degree}
                  </p>
                  <p className="mt-0.5" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    {edu.university}
                  </p>
                  <p className="mt-0.5" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    {edu.location}
                  </p>
                </div>
                <p className="shrink-0" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {edu.period}
                </p>
              </div>
              {edu.description && (
                <p className="mt-3" style={{ fontSize: "14px", lineHeight: "21px", color: "var(--text-secondary)" }}>
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
        </ScrollReveal>
      )}

      {/* Certifications */}
      {isSectionVisible(siteSettings, "certifications") && visibleCertifications.length > 0 && (
        <ScrollReveal
          as="section"
          id="certifications"
          className="w-full max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("certifications") }}
        >
        <SectionTitle>{t("certificationsTitle")}</SectionTitle>
        <div className="mt-8 w-full space-y-4">
          {displayedCertifications.map((cert) => (
            <div
              key={cert.id}
              className="flex w-full items-start justify-between gap-3 py-2 sm:items-center"
              style={{ borderBottom: "1px solid var(--border-primary)" }}
            >
              <div className="min-w-0">
                <p className="break-words" style={{ fontSize: "16px", color: "var(--text-primary)" }}>{cert.title}</p>
                <p className="mt-0.5" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{cert.issuer}</p>
              </div>
              {cert.showLink !== false && cert.link && cert.link !== "#" && (
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 shrink-0"
                  style={{ fontSize: "14px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                >
                  {t("view")}
                </a>
              )}
            </div>
          ))}
          {hasHiddenCertifications && (
            <button
              type="button"
              onClick={() => setShowAllCertifications((current) => !current)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-[6px] px-0 py-2 text-left font-medium transition-opacity hover:opacity-75"
              style={{ fontSize: "14px", color: "var(--text-primary)" }}
              aria-expanded={showAllCertifications}
              aria-controls="certifications"
            >
              {showAllCertifications ? t("showLessCertifications") : t("showMoreCertifications")}
              <ChevronRight
                size={15}
                className={`transition-transform ${showAllCertifications ? "-rotate-90" : "rotate-90"}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        </ScrollReveal>
      )}

      {/* Stack / Tools */}
      {isSectionVisible(siteSettings, "stack") && visibleStack.length > 0 && (
        <ScrollReveal
          as="section"
          id="tools"
          className="w-full max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("stack") }}
        >
        <SectionTitle>{stackSectionTitle}</SectionTitle>
        <StaggerChildren className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleStack.map((item) => (
            <StaggerItem key={item.id} className="w-full">
              <a
                href={item.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center gap-3 rounded-lg p-3 transition-colors"
                style={{
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: item.logo ? "transparent" : (item.color || "var(--border-primary)") }}
                >
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="h-6 w-6 object-contain"
                      style={{ borderRadius: `${clampStackLogoRadius(item.logoRadius ?? DEFAULT_STACK_LOGO_RADIUS)}px` }}
                      draggable={false}
                    />
                  ) : (
                    <span style={{ fontSize: "14px" }}>
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{item.name}</p>
                  <p className="truncate" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.description}</p>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerChildren>
        </ScrollReveal>
      )}

      {isSectionVisible(siteSettings, "gallery") && homeGalleryItems.length > 0 && (
        <ScrollReveal
          as="section"
          id="gallery"
          className="max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("gallery") }}
        >
          <div className="mb-8 space-y-3">
            <SectionTitle>{homeGalleryTitle}</SectionTitle>
            {homeGalleryIntro ? (
              <p style={{ fontSize: "15px", lineHeight: "22px", color: "var(--text-secondary)" }}>
                {homeGalleryIntro}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:auto-rows-[160px]">
            {homeGalleryItems.map((item, index) => {
              const layout = getHomeGalleryCardLayout(index);
              return (
                <motion.article
                  key={item.id}
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.24) }}
                  whileHover={{ y: -4 }}
                  className={`group relative overflow-hidden rounded-[22px] border ${layout.className}`}
                  style={{
                    minHeight: `${layout.minHeight}px`,
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <ContentImage
                    src={item.image}
                    alt={item.title || homeGalleryTitle}
                    position={item.imagePosition || "50% 50%"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.16) 42%, rgba(0,0,0,0.72) 100%)",
                    }}
                  />
                  {(item.title || item.subtitle) ? (
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      {item.title ? (
                        <p style={{ fontSize: "17px", lineHeight: "22px", color: "#fafafa" }}>
                          {item.title}
                        </p>
                      ) : null}
                      {item.subtitle ? (
                        <p className="mt-1.5 max-w-[36ch]" style={{ fontSize: "13px", lineHeight: "19px", color: "rgba(250,250,250,0.76)" }}>
                          {item.subtitle}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </motion.article>
              );
            })}
          </div>
        </ScrollReveal>
      )}

      {/* Awards */}
      {isSectionVisible(siteSettings, "awards") && visibleAwards.length > 0 && (
        <ScrollReveal
          as="section"
          id="awards"
          className="max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("awards") }}
        >
        <SectionTitle>{t("awardsTitle")}</SectionTitle>
        <div className="mt-8 space-y-4">
          {visibleAwards.map((award) => (
            <div
              key={award.id}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: "1px solid var(--border-primary)" }}
            >
              <div>
                <p style={{ fontSize: "16px", color: "var(--text-primary)" }}>{award.title}</p>
                <p className="mt-0.5" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{award.issuer}</p>
              </div>
              {award.link && (
                <a
                  href={award.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 shrink-0"
                  style={{ fontSize: "14px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                >
                  {t("visit")}
                </a>
              )}
            </div>
          ))}
        </div>
        </ScrollReveal>
      )}

      {/* Recommendations */}
      {isSectionVisible(siteSettings, "recommendations") && visibleRecommendations.length > 0 && (
        <ScrollReveal
          as="section"
          id="recommendations"
          className="max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("recommendations") }}
        >
        <SectionTitle>{t("recommendationsTitle")}</SectionTitle>
        <div className="mt-8 space-y-8">
          {visibleRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="pl-5"
              style={{ borderLeft: "2px solid var(--border-primary)" }}
            >
              <p style={{ fontSize: "16px", color: "var(--text-primary)" }}>{rec.name}</p>
              <p className="mt-0.5" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{rec.role}</p>
              <p className="mt-3" style={{ fontSize: "15px", lineHeight: "24px", color: "var(--text-secondary)" }}>
                "{rec.quote}"
              </p>
            </div>
          ))}
        </div>
        </ScrollReveal>
      )}

      {/* Blog / Articles */}
      {isSectionVisible(siteSettings, "blog") && displayedBlogPosts.length > 0 && (
        <ScrollReveal
          as="section"
          id="blog"
          className="max-w-[700px] mx-auto px-5 py-12"
          style={{ order: getSectionOrderValue("blog") }}
        >
        <div className="flex items-center justify-between mb-8">
          <SectionTitle>{t("articlesTitle")}</SectionTitle>
          <Link
            to="/blog"
            className="underline underline-offset-2 transition-colors"
            style={{ fontSize: "16px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
          >
            {t("viewAllPosts")}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {displayedBlogPosts.map((post, i) => {
            const cardCopy = getArticleCardCopy(post);

            return (
            <motion.div
              key={post.id}
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="h-full"
            >
              <ArticlePreviewCard
                href={`/blog/${post.slug || post.id}`}
                title={cardCopy.title}
                description={cardCopy.description}
                image={post.cardImage || post.image}
                imagePosition={post.cardImagePosition || post.imagePosition || "50% 50%"}
                publisher={post.publisher}
                date={post.date}
                category={(post as any).category}
                readTime={(post as any).readTime}
                locked={Boolean((post as any).password && (post as any).password.trim() !== "")}
                ctaLabel={t("readArticle")}
                layout="vertical"
              />
            </motion.div>
            );
          })}
        </div>
        </ScrollReveal>
      )}

      {/* Contact / Let's Talk */}
      {isSectionVisible(siteSettings, "contact") && (
        <ScrollReveal
          as="footer"
          id="contact"
          className="max-w-[700px] mx-auto px-5 py-16"
          style={{ order: getSectionOrderValue("contact") }}
        >
        <SectionTitle>{t("letsTalk")}</SectionTitle>

        <div className="mt-8 flex flex-col md:flex-row gap-8">
          {/* Info column */}
          <div className="pl-4 md:w-[240px] shrink-0 space-y-6" style={{ borderLeft: "1px solid var(--border-primary)" }}>
            <div>
              <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                <span className="mr-2" style={{ color: "var(--text-primary)" }}>{t("timeForMe")}</span>
                {currentTime.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "16px", color: "var(--text-primary)" }}>{t("email")}</p>
              <button onClick={copyEmail} className="flex items-center gap-1 mt-1 cursor-pointer bg-transparent border-none" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                <Copy size={14} /> {profile.email}
              </button>
            </div>
            <div>
              <p style={{ fontSize: "16px", color: "var(--text-primary)" }}>{t("phone")}</p>
              <p className="flex items-center gap-1 mt-1" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                <Phone size={14} /> {profile.phone}
              </p>
            </div>
            <div>
              <p className="mb-2" style={{ fontSize: "16px", color: "var(--text-primary)" }}>{t("socials")}</p>
              <div className="space-y-2">
                {footerSocialLinks.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 transition-colors" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                    <ExternalLink size={14} /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="flex-1">
            <p className="mb-4" style={{ fontSize: "16px", color: "var(--text-primary)" }}>{t("reachOut")}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t("yourName")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none"
                style={{ fontSize: "14px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
              <input
                type="email"
                placeholder={t("yourEmail")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none"
                style={{ fontSize: "14px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
              <textarea
                placeholder={t("message")}
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none resize-none"
                style={{ fontSize: "14px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md py-2.5 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                style={{ fontSize: "16px", backgroundColor: "var(--btn-primary-bg, #fafafa)", color: "var(--btn-primary-text, #121212)" }}
              >
                {submitting ? t("sending") || "Enviando..." : t("sendMessage")}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            {t("designedIn")}{" "}
            <a href="https://figma.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)" }}>Figma</a>{" "}
            {t("by")}{" "}
            <span style={{ color: "var(--text-primary)" }}>Gabriel Baltar</span>
          </p>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            &copy; {t("copyright")} {new Date().getFullYear()}
          </p>
        </div>
        </ScrollReveal>
      )}
      </div>
    </div>
  );
}
