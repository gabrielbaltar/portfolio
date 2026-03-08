import { toast } from "sonner";
import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, ExternalLink, Copy, Phone, Lock } from "lucide-react";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { ScrollReveal } from "./scroll-reveal";
import { BlockRenderer } from "./block-renderer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { usePassword } from "./password-context";
import { copyToClipboard } from "./clipboard-utils";

import projectImg1 from "figma:asset/41b8590575d31ccb2d14524e52ac80f769b0c27a.png";
import projectImg2 from "figma:asset/6152ef9e71bb7cd6e66a5a401a0c518b8b77fde7.png";
import projectImg3 from "figma:asset/f74e8c8e6ce6a8687ceb8511bee3d4fab9235e7a.png";
import projectImg4 from "figma:asset/a8a2910330eef4e894aef9565ddca1a5ca0a0df0.png";
import projectImg5 from "figma:asset/fdfa8c140757c8eb1cd3df086c85525d05145841.png";

const PROJECT_IMAGES: Record<string, string> = {
  "1": projectImg1,
  "2": projectImg2,
  "3": projectImg3,
  "4": projectImg4,
  "5": projectImg5,
  "6": projectImg1,
};

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1702479744062-1880502275b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwbGFuZGluZyUyMHBhZ2UlMjBzY3JlZW5zaG90JTIwZGFya3xlbnwxfHx8fDE3NzI1OTkwOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1704018731280-6617b0ca1dbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBhZ2VuY3klMjB3ZWJwYWdlJTIwZGFyayUyMG1vY2t1cHxlbnwxfHx8fDE3NzI1OTkwOTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1741346198346-f68e0ce3821b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjBwcm9qZWN0cyUyMGdhbGxlcnklMjBkYXJrfGVufDF8fHx8MTc3MjU5OTA5Nnww&ixlib=rb-4.1.0&q=80&w=1080",
];

function ImageCard({ src, alt, className = "", position = "50% 50%" }: { src: string; alt: string; className?: string; position?: string }) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      className={`w-full rounded-2xl object-cover ${className}`}
      style={{ height: "525px", maxHeight: "525px", objectPosition: position }}
    />
  );
}

function ProjectCard({ project, imageSrc }: { project: { id: string; title: string; category: string; slug: string }; imageSrc: string }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="block rounded-lg overflow-hidden group transition-transform hover:-translate-y-1"
      style={{
        backgroundColor: "var(--bg-secondary, #121212)",
        border: "1px solid var(--border-primary, #363636)",
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "350/260" }}>
        <ImageWithFallback
          src={imageSrc}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div
        className="px-4 py-3"
        style={{ borderTop: "1px solid var(--border-secondary, #242424)" }}
      >
        <div className="flex items-center justify-between">
          <p className="font-['Inter',sans-serif]" style={{ fontSize: "15px", color: "var(--text-primary, #fafafa)" }}>
            {project.title}
          </p>
          <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-secondary)" }} />
        </div>
        <p className="font-['Inter',sans-serif] mt-0.5" style={{ fontSize: "13px", color: "var(--text-secondary, #ababab)" }}>
          {project.category}
        </p>
      </div>
    </Link>
  );
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { data } = useTranslatedCMS();
  const { t } = useLanguage();
  const { profile, projects } = data;
  const { isProjectUnlocked, unlockProject } = usePassword();

  const project = projects.find((p) => p.slug === slug);
  const otherProjects = projects.filter((p) => p.slug !== slug).slice(0, 4);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const copyEmail = () => {
    copyToClipboard(profile.email);
    toast.success(t("emailCopied"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("messageSent"));
    setFormData({ name: "", email: "", message: "" });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
    setPasswordError(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project && passwordInput === project.password) {
      setIsUnlocked(true);
      setPasswordError(false);
      // Persist unlock in context so navigation within session works
      unlockProject(project.id);
    } else {
      setPasswordError(true);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-center">
          <h1 className="mb-4" style={{ fontSize: "26px", color: "var(--text-primary)" }}>Projeto nao encontrado</h1>
          <Link to="/projects" className="underline" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
            Voltar aos projetos
          </Link>
        </div>
      </div>
    );
  }

  // Check if project requires password
  const needsPassword = project.password && project.password.trim() !== "";
  const projectUnlocked = !needsPassword || isUnlocked || isProjectUnlocked(project.id);

  // Password gate
  if (!projectUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif] px-5" style={{ backgroundColor: "var(--bg-primary, #0B0B0D)" }}>
        <motion.div
          className="w-full max-w-[400px] rounded-2xl p-8 text-center"
          style={{ backgroundColor: "var(--bg-secondary, #121212)", border: "1px solid var(--border-primary, #2A2A2A)" }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "var(--bg-primary, #0B0B0D)", border: "1px solid var(--border-primary, #2A2A2A)" }}
          >
            <Lock size={22} style={{ color: "var(--text-secondary, #888)" }} />
          </div>
          <h2 className="mb-2" style={{ fontSize: "20px", color: "var(--text-primary, #fafafa)" }}>
            Projeto protegido
          </h2>
          <p className="mb-6" style={{ fontSize: "14px", lineHeight: "22px", color: "var(--text-secondary, #888)" }}>
            Este projeto esta sob NDA ou contem informacoes sensiveis. Digite a senha para acessar.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={handlePasswordChange}
              placeholder="Digite a senha"
              autoFocus
              className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
              style={{
                fontSize: "14px",
                backgroundColor: "var(--bg-primary, #0B0B0D)",
                border: passwordError ? "1px solid #ef4444" : "1px solid var(--border-primary, #2A2A2A)",
                color: "var(--text-primary, #fafafa)",
              }}
            />
            {passwordError && (
              <p style={{ fontSize: "12px", color: "#ef4444" }}>
                Senha incorreta. Tente novamente.
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg py-3 cursor-pointer border-none transition-all hover:-translate-y-0.5"
              style={{ fontSize: "14px", backgroundColor: "var(--btn-primary-bg, #fafafa)", color: "var(--btn-primary-text, #121212)" }}
            >
              Acessar projeto
            </button>
          </form>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 mt-6 transition-colors hover:opacity-80"
            style={{ fontSize: "13px", color: "var(--text-secondary, #666)" }}
          >
            <ArrowLeft size={13} /> Voltar aos projetos
          </Link>
        </motion.div>
      </div>
    );
  }

  const heroImage = project.image || PROJECT_IMAGES[project.id] || PROJECT_IMAGES["1"];
  const gallery = project.galleryImages && project.galleryImages.length > 0
    ? project.galleryImages
    : GALLERY_IMAGES;

  // Metadata columns
  const meta = [
    { label: "Category", value: project.category },
    { label: "Services", value: project.services || "Web Design" },
    { label: "Client", value: project.client || "Framer Template" },
    { label: "Year", value: project.year || "2024" },
  ];

  return (
    <div className="min-h-screen font-['Inter',sans-serif]" style={{ backgroundColor: "var(--bg-primary, #0B0B0D)" }}>

      {/* Header */}
      <div className="max-w-[700px] mx-auto px-5 pt-24 md:pt-28">
        {/* Breadcrumb */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link
            to="/projects"
            className="flex items-center gap-1.5 transition-colors hover:opacity-80"
            style={{ fontSize: "14px", color: "var(--text-secondary, #7A7A7A)" }}
          >
            <ArrowLeft size={14} />
            {t("projectsTitle")}
          </Link>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="mt-4"
          style={{ fontSize: "28px", lineHeight: "36px", color: "var(--text-primary, #EDEDED)" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {project.title} {project.subtitle ? `- ${project.subtitle}` : ""}
        </motion.h1>

        {/* Visit Website link */}
        {project.link && project.link !== "#" && (
          <motion.a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ fontSize: "13px", color: "var(--text-secondary, #CFCFCF)" }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Visit Website <ExternalLink size={12} />
          </motion.a>
        )}

        {/* Description */}
        <motion.p
          className="mt-6"
          style={{ fontSize: "15px", lineHeight: "26px", color: "var(--text-secondary, #A6A6A6)" }}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {project.description}
        </motion.p>

        {/* Metadata 4 columns */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pb-8 w-full"
          style={{ borderBottom: "1px solid var(--border-primary, #2A2A2A)" }}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {meta.map((m) => (
            <div key={m.label} className="min-w-0">
              <p className="font-['Inter',sans-serif] break-words" style={{ fontSize: "11px", color: "var(--text-secondary, #6F6F6F)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {m.label}
              </p>
              <p className="mt-1 font-['Inter',sans-serif] break-words" style={{ fontSize: "14px", color: "var(--text-primary, #D6D6D6)" }}>
                {m.value}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Hero Image */}
      <ScrollReveal className="max-w-[700px] mx-auto px-5 mt-10">
        <ImageCard src={heroImage} alt={project.title} position={project.imagePosition || "50% 50%"} />
      </ScrollReveal>

      {/* Content blocks */}
      {project.contentBlocks && project.contentBlocks.length > 0 && (
        <ScrollReveal className="max-w-[700px] mx-auto px-5 mt-12">
          <BlockRenderer blocks={project.contentBlocks} />
        </ScrollReveal>
      )}

      {/* Gallery */}
      <div className="max-w-[700px] mx-auto px-5 mt-12 flex flex-col gap-8">
        {gallery.map((img, i) => (
          <ScrollReveal key={i}>
            <ImageCard src={img} alt={`${project.title} gallery ${i + 1}`} position={project.galleryPositions?.[i] || "50% 50%"} />
          </ScrollReveal>
        ))}
      </div>

      {/* View more projects */}
      <ScrollReveal className="max-w-[700px] mx-auto px-5 mt-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-['Inter',sans-serif]" style={{ fontSize: "18px", color: "var(--text-primary, #fafafa)" }}>
            View more projects
          </h2>
          <Link
            to="/projects"
            className="underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ fontSize: "13px", color: "var(--text-secondary, #CFCFCF)" }}
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {otherProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              imageSrc={p.image || PROJECT_IMAGES[p.id] || PROJECT_IMAGES["1"]}
            />
          ))}
        </div>
      </ScrollReveal>

      {/* Contact / Let's talk */}
      <ScrollReveal as="footer" className="max-w-[700px] mx-auto px-5 py-16 mt-8">
        <h2 className="font-['Inter',sans-serif]" style={{ fontSize: "20px", color: "var(--text-primary, #fafafa)" }}>
          {t("letsTalk")}
        </h2>

        <div className="mt-8 flex flex-col md:flex-row gap-8">
          {/* Info column */}
          <div className="pl-4 md:w-[240px] shrink-0 space-y-6" style={{ borderLeft: "1px solid var(--border-primary, #363636)" }}>
            <div>
              <p style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}>
                <span className="font-['Inter',sans-serif] mr-2" style={{ color: "var(--text-primary, #fafafa)" }}>{t("timeForMe")}</span>
                {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="font-['Inter',sans-serif]" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>{t("email")}</p>
              <button onClick={copyEmail} className="flex items-center gap-1 mt-1 cursor-pointer bg-transparent border-none" style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}>
                <Copy size={14} /> {profile.email}
              </button>
            </div>
            <div>
              <p className="font-['Inter',sans-serif]" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>{t("phone")}</p>
              <p className="flex items-center gap-1 mt-1" style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}>
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
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 transition-colors" style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}>
                    <ExternalLink size={14} /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="flex-1">
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
                className="w-full rounded-md py-2.5 cursor-pointer border-none"
                style={{ fontSize: "16px", backgroundColor: "var(--btn-primary-bg, #fafafa)", color: "var(--btn-primary-text, #121212)" }}
                whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                {t("sendMessage")}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderTop: "1px solid var(--border-primary, #363636)" }}>
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