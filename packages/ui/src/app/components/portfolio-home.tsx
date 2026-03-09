import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MapPin, ExternalLink, ChevronRight, Mail, Copy, Phone, Check } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { ScrollReveal } from "./scroll-reveal";
import { StaggerChildren, StaggerItem } from "./stagger-children";
import { ContentImage } from "./content-image";
import { ArticlePreviewCard, ProjectPreviewCard } from "./content-preview-cards";
import { sendContactEmail } from "./email-service";
import { copyToClipboard } from "./clipboard-utils";
import { getProfileSocialLinks } from "./profile-social-links";

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

export function PortfolioHome() {
  const { data, isTranslating } = useTranslatedCMS();
  const { siteSettings, profile, projects, experiences, education, certifications, stack, awards, recommendations, blogPosts } = data;
  const { locale, t } = useLanguage();
  const [emailCopied, setEmailCopied] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

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

  const publishedProjects = projects.filter((p: any) => !p.status || p.status === "published");
  const publishedBlogPosts = blogPosts.filter((b: any) => !b.status || b.status === "published");
  const displayedProjects = publishedProjects.slice(0, 4);
  const displayedBlogPosts = publishedBlogPosts.slice(0, 3);
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
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-green, #22c55e)" }} />
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

      {/* About Me */}
      <ScrollReveal as="section" id="about" className="max-w-[700px] mx-auto px-5 py-12">
        <SectionTitle>{t("aboutMe")}</SectionTitle>
        <div className="mt-6 space-y-4">
          <p style={{ fontSize: "16px", lineHeight: "22.4px", color: "var(--text-secondary)" }}>{profile.aboutParagraph1}</p>
          <p style={{ fontSize: "16px", lineHeight: "22.4px", color: "var(--text-secondary)" }}>{profile.aboutParagraph2}</p>
        </div>
      </ScrollReveal>

      {/* Projects */}
      <ScrollReveal as="section" id="projects" className="max-w-[700px] mx-auto px-5 py-12">
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
          {displayedProjects.map((project, i) => (
            <StaggerItem key={project.id}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                <ProjectPreviewCard
                  href={`/projects/${project.slug || project.id}`}
                  title={project.title}
                  category={project.category}
                  image={project.image}
                  imagePosition={(project as any).imagePosition || "50% 50%"}
                  locked={Boolean((project as any).password && (project as any).password.trim() !== "")}
                />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </ScrollReveal>

      {/* Experience */}
      <ScrollReveal as="section" id="experience" className="max-w-[700px] mx-auto px-5 py-12">
        <SectionTitle>{t("experienceTitle")}</SectionTitle>
        <div className="mt-8 space-y-0">
          {experiences.map((exp, i) => (
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
                    <li key={ti} style={{ fontSize: "14px", lineHeight: "21px", color: "var(--text-secondary)" }}>
                      {task}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Education */}
      <ScrollReveal as="section" id="education" className="max-w-[700px] mx-auto px-5 py-12">
        <SectionTitle>{t("educationTitle")}</SectionTitle>
        <div className="mt-8 space-y-0">
          {education.map((edu) => (
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

      {/* Certifications */}
      <ScrollReveal as="section" className="max-w-[700px] mx-auto px-5 py-12">
        <SectionTitle>{t("certificationsTitle")}</SectionTitle>
        <div className="mt-8 space-y-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="flex items-start sm:items-center justify-between gap-3 py-2"
              style={{ borderBottom: "1px solid var(--border-primary)" }}
            >
              <div className="min-w-0">
                <p className="break-words" style={{ fontSize: "16px", color: "var(--text-primary)" }}>{cert.title}</p>
                <p className="mt-0.5" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{cert.issuer}</p>
              </div>
              {cert.link && (
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
        </div>
      </ScrollReveal>

      {/* Stack / Tools */}
      <ScrollReveal as="section" id="tools" className="max-w-[700px] mx-auto px-5 py-12">
        <SectionTitle>{t("stackTitle")}</SectionTitle>
        <StaggerChildren className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stack.map((item) => (
            <StaggerItem key={item.id}>
              <a
                href={item.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors group"
                style={{
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: item.color || "var(--border-primary)" }}
                >
                  <span style={{ fontSize: "14px" }}>
                    {item.name.charAt(0)}
                  </span>
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

      {/* Awards */}
      <ScrollReveal as="section" className="max-w-[700px] mx-auto px-5 py-12">
        <SectionTitle>{t("awardsTitle")}</SectionTitle>
        <div className="mt-8 space-y-4">
          {awards.map((award) => (
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

      {/* Recommendations */}
      <ScrollReveal as="section" className="max-w-[700px] mx-auto px-5 py-12">
        <SectionTitle>{t("recommendationsTitle")}</SectionTitle>
        <div className="mt-8 space-y-8">
          {recommendations.map((rec) => (
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

      {/* Blog / Articles */}
      <ScrollReveal as="section" id="blog" className="max-w-[700px] mx-auto px-5 py-12">
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
        <div className="space-y-10">
          {displayedBlogPosts.map((post, i) => (
            <ArticlePreviewCard
              key={post.id}
              href={`/blog/${post.slug || post.id}`}
              title={post.title}
              description={post.description}
              image={post.image}
              imagePosition={(post as any).imagePosition || "50% 50%"}
              publisher={post.publisher}
              date={post.date}
              category={(post as any).category}
              locked={Boolean((post as any).password && (post as any).password.trim() !== "")}
              ctaLabel={t("readArticle")}
            />
          ))}
        </div>
      </ScrollReveal>

      {/* Contact / Let's Talk */}
      <ScrollReveal as="footer" id="contact" className="max-w-[700px] mx-auto px-5 py-16">
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
    </div>
  );
}
