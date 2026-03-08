import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MapPin, ExternalLink, ArrowUpRight, ChevronRight, Mail, Copy, Phone, Check, Lock } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { ScrollReveal } from "./scroll-reveal";
import { StaggerChildren, StaggerItem } from "./stagger-children";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { sendContactEmail } from "./email-service";
import { copyToClipboard } from "./clipboard-utils";
import profilePhoto from "figma:asset/e8291c3a362b891f8907c1dda2d130a4b807f1b9.png";

import projectThumb1 from "figma:asset/41b8590575d31ccb2d14524e52ac80f769b0c27a.png";
import projectThumb2 from "figma:asset/6152ef9e71bb7cd6e66a5a401a0c518b8b77fde7.png";
import projectThumb3 from "figma:asset/f74e8c8e6ce6a8687ceb8511bee3d4fab9235e7a.png";
import projectThumb4 from "figma:asset/a8a2910330eef4e894aef9565ddca1a5ca0a0df0.png";
import projectThumb5 from "figma:asset/fdfa8c140757c8eb1cd3df086c85525d05145841.png";

const PROJECT_IMAGES = [
  projectThumb1,
  projectThumb2,
  projectThumb3,
  projectThumb4,
  projectThumb5,
];

const BLOG_IMAGES = [
  "https://images.unsplash.com/photo-1635069243450-e13812625d8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjB0cmVuZHMlMjBmdXR1cmlzdGljJTIwbGFwdG9wfGVufDF8fHx8MTc3MjU5MjgyMXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNwb25zaXZlJTIwZGVzaWduJTIwZGV2aWNlcyUyMHNjcmVlbnN8ZW58MXx8fHwxNzcyNTkyODIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1608682285597-156feb50eb4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd29ya3NwYWNlJTIwY2xlYW4lMjBkZXNrfGVufDF8fHx8MTc3MjU5MjgyMnww&ixlib=rb-4.1.0&q=80&w=1080",
];

const PROFILE_IMAGE = profilePhoto;

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
            <ImageWithFallback
              src={profile.photo || PROFILE_IMAGE}
              alt={profile.name}
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
                  {profile.name}
                </h1>
                <p className="mt-1" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                  {profile.role}
                </p>
                <p className="flex items-center justify-center sm:justify-start gap-1 mt-1" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  <MapPin size={14} />
                  {profile.location}
                </p>
                {profile.available ? (
                  <p className="flex items-center justify-center sm:justify-start gap-2 mt-2" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-green, #22c55e)" }} />
                    {profile.availableText}
                  </p>
                ) : (
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
                )}
              </motion.div>

              {/* Right links */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col items-center sm:items-end gap-2"
              >
                <a
                  href={siteSettings.templateUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 underline underline-offset-2 transition-colors"
                  style={{ fontSize: "16px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                >
                  <ExternalLink size={16} />
                  {t("getTemplate")}
                </a>
                <a
                  href={siteSettings.resumeUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 underline underline-offset-2 transition-colors"
                  style={{ fontSize: "16px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                >
                  <ExternalLink size={16} />
                  {t("downloadCV")}
                </a>
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
          <button
            onClick={copyEmail}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer transition-colors"
            style={{ fontSize: "16px", color: "var(--text-secondary)" }}
          >
            {emailCopied ? <Check size={16} style={{ color: "var(--accent-green)" }} /> : <Copy size={16} />}
            <span>{emailCopied ? t("emailCopied") : profile.email}</span>
          </button>
          <div className="flex items-center gap-4">
            <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 transition-colors" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
              <ExternalLink size={14} />
              Twitter
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 transition-colors" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
              <ExternalLink size={14} />
              LinkedIn
            </a>
          </div>
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
              <Link
                to={`/projects/${project.slug || project.id}`}
                className="block rounded-lg overflow-hidden cursor-pointer group"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                  <div className="relative overflow-hidden" style={{ aspectRatio: "700/525" }}>
                    <ImageWithFallback
                      src={project.image || PROJECT_IMAGES[i % PROJECT_IMAGES.length]}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{ objectPosition: (project as any).imagePosition || "50% 50%" }}
                    />
                    {(project as any).password && (project as any).password.trim() !== "" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Lock size={16} style={{ color: "rgba(255, 255, 255, 0.8)" }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="px-4 py-3"
                    style={{ borderTop: "1px solid var(--border-secondary)" }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                        {(project as any).password && (project as any).password.trim() !== "" && (
                          <Lock size={13} style={{ color: "#ffa500", opacity: 0.7 }} />
                        )}
                        {project.title}
                      </p>
                      <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-secondary)" }} />
                    </div>
                    <p className="mt-1" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                      {project.category}
                    </p>
                  </div>
                </motion.div>
              </Link>
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
            <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="flex flex-col sm:flex-row gap-4 group">
              <div
                className="w-full sm:w-[280px] shrink-0 aspect-[3/2] rounded-lg overflow-hidden"
                style={{ border: "1px solid var(--border-secondary)" }}
              >
                <ImageWithFallback
                  src={post.image || BLOG_IMAGES[i % BLOG_IMAGES.length]}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ objectPosition: (post as any).imagePosition || "50% 50%" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="flex items-center gap-1.5" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                  {(post as any).password && (post as any).password.trim() !== "" && (
                    <Lock size={13} style={{ color: "#ffa500", opacity: 0.7 }} />
                  )}
                  {post.title}
                </h3>
                <p className="mt-2" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {post.publisher}, {post.date}
                  {(post as any).category && <> / {(post as any).category}</>}
                </p>
                {(post as any).subtitle && (
                  <p className="mt-1" style={{ fontSize: "14px", color: "var(--text-secondary)", opacity: 0.8 }}>
                    {(post as any).subtitle}
                  </p>
                )}
                <p className="mt-3 line-clamp-3" style={{ fontSize: "15px", lineHeight: "22.4px", color: "var(--text-secondary)" }}>
                  {post.description}
                </p>
                <span
                  className="underline underline-offset-4 inline-flex items-center gap-1 mt-3"
                  style={{ fontSize: "16px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                >
                  {t("readArticle")} <ExternalLink size={14} />
                </span>
              </div>
            </Link>
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
                {[
                  { label: "Twitter", url: profile.twitter },
                  { label: "Instagram", url: profile.instagram },
                  { label: "LinkedIn", url: profile.linkedin },
                ].map((s) => (
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
