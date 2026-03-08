import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowLeft, Copy, Phone, ExternalLink, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { ScrollReveal } from "./scroll-reveal";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { copyToClipboard } from "./clipboard-utils";
import { sendContactEmail } from "./email-service";

import projectImg1 from "figma:asset/41b8590575d31ccb2d14524e52ac80f769b0c27a.png";

const PROJECT_IMAGES: Record<string, string> = {
  "1": projectImg1,
  "2": projectImg1,
  "3": projectImg1,
  "4": projectImg1,
  "5": projectImg1,
  "6": projectImg1,
};

function ProjectCard({ project, index }: { project: { id: string; title: string; category: string; image: string; link: string; slug?: string }; index: number }) {
  const imageSrc = project.image || PROJECT_IMAGES[project.id] || PROJECT_IMAGES["1"];

  return (
    <ScrollReveal>
      <Link
        to={`/projects/${(project as any).slug || project.id}`}
        className="block rounded-lg overflow-hidden cursor-pointer group"
        style={{
          backgroundColor: "var(--bg-secondary, #121212)",
          border: "1px solid var(--border-primary, #363636)",
        }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
          whileHover={{ y: -4 }}
        >
          {/* Thumbnail */}
          <div className="relative overflow-hidden" style={{ aspectRatio: "700/525" }}>
            <ImageWithFallback
              src={imageSrc}
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

          {/* Content footer */}
          <div
            className="px-4 py-3"
            style={{
              backgroundColor: "var(--bg-secondary, #121212)",
              borderTop: "1px solid var(--border-secondary, #242424)",
              minHeight: "74px",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <p
                className="font-['Inter',sans-serif] flex items-center gap-1.5"
                style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-primary, #fafafa)" }}
              >
                {(project as any).password && (project as any).password.trim() !== "" && (
                  <Lock size={13} style={{ color: "#ffa500", opacity: 0.7 }} />
                )}
                {project.title}
              </p>
            </div>
            <p
              className="font-['Inter',sans-serif] mt-1"
              style={{ fontSize: "14px", lineHeight: "21px", color: "var(--text-secondary, #ababab)" }}
            >
              {project.category}
            </p>
          </div>
        </motion.div>
      </Link>
    </ScrollReveal>
  );
}

export function ProjectsPage() {
  const { data } = useTranslatedCMS();
  const { locale, t } = useLanguage();
  const { profile, projects: allProjects } = data;
  const projects = allProjects.filter((p: any) => !p.status || p.status === "published");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
          style={{ fontSize: "26px", lineHeight: "31.2px", color: "var(--text-primary)" }}
        >
          {t("projectsTitle")}
        </motion.h1>
        <div className="mt-10 grid grid-cols-1 min-[560px]:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
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
                {[
                  { label: "Twitter", url: profile.twitter },
                  { label: "Instagram", url: profile.instagram },
                  { label: "LinkedIn", url: profile.linkedin },
                ].map((s) => (
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
