import { toast } from "sonner";
import { useParams, Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { ProjectAccessRequestStatus } from "@portfolio/core";
import { ArrowLeft, ExternalLink, Copy, Phone, Lock, Mail, ShieldCheck } from "lucide-react";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { ScrollReveal } from "./scroll-reveal";
import { BlockRenderer } from "./block-renderer";
import { canOpenInImageLightbox, ContentImage } from "./content-image";
import { getLightboxOriginRect, ImageLightbox, type LightboxOpenPayload, type LightboxOriginRect, type LightboxSlide } from "./image-lightbox";
import { ProjectPreviewCard } from "./content-preview-cards";
import { usePassword } from "./password-context";
import { copyToClipboard } from "./clipboard-utils";
import { getBackTarget } from "./navigation-state";
import { getProfileSocialLinks } from "./profile-social-links";
import { filterVisibleContent, getProjectCardCopy } from "./site-visibility";
import { RichTextContent, richTextToPlainText } from "./rich-text";
import {
  PROJECT_SUBTITLE_APPEARANCE_DEFAULTS,
  PROJECT_TITLE_APPEARANCE_DEFAULTS,
  resolveResponsiveTextAppearanceStyle,
  resolveTextAppearanceStyle,
} from "./text-appearance";
import { dataProvider } from "./data-provider";
import { sendProjectAccessRequestEmail } from "./email-service";
import { getProjectAccessVisitorToken } from "./project-access-utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
type ApprovedAccessState = "idle" | "checking" | "granted" | "blocked";

function ImageCard({
  src,
  alt,
  className = "",
  position = "50% 50%",
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  position?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const isLightboxable = canOpenInImageLightbox(src);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!src || !isLightboxable}
      className="block w-full bg-transparent border-none p-0 text-left disabled:cursor-default"
      style={{ cursor: src && isLightboxable ? "pointer" : "default" }}
      aria-label={isLightboxable ? `Ampliar imagem: ${alt}` : alt}
    >
      <ContentImage
        src={src}
        alt={alt}
        emptyLabel="Sem imagem"
        className={`w-full rounded-2xl object-cover ${className}`}
        position={position}
        style={{ height: "525px", maxHeight: "525px", cursor: "pointer" }}
      />
    </button>
  );
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { data } = useTranslatedCMS();
  const { locale, t } = useLanguage();
  const { profile, siteSettings } = data;
  const projects = filterVisibleContent(
    data.projects.filter((project) => !project.status || project.status === "published"),
    siteSettings,
    "projects",
  );
  const { isProjectUnlocked, unlockProject } = usePassword();

  const project = projects.find((p) => p.slug === slug);
  const otherProjects = projects.filter((p) => p.slug !== slug).slice(0, 4);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<LightboxOpenPayload | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: "", email: "", message: "" });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [accessRequestStatus, setAccessRequestStatus] = useState<ProjectAccessRequestStatus | null>(null);
  const [approvedAccessState, setApprovedAccessState] = useState<ApprovedAccessState>("idle");
  const backTo = getBackTarget(location.state, "/projects");
  const socialLinks = getProfileSocialLinks(profile);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    setPasswordInput("");
    setIsUnlocked(false);
    setPasswordError(false);
    setApprovedAccessState("idle");
    setAccessRequestStatus(null);
    setRequestDialogOpen(false);
    setRequestForm({ name: "", email: "", message: "" });
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

  // Check if project requires password
  const needsPassword = Boolean(project?.password && project.password.trim() !== "");
  const sessionUnlocked = project ? isProjectUnlocked(project.id) : false;
  const shouldCheckApprovedAccess = Boolean(project && needsPassword && !isUnlocked && !sessionUnlocked);
  const approvedAccessGranted = approvedAccessState === "granted";
  const isResolvingApprovedAccess =
    shouldCheckApprovedAccess &&
    approvedAccessState !== "granted" &&
    approvedAccessState !== "blocked";
  const projectUnlocked = project ? !needsPassword || isUnlocked || sessionUnlocked || approvedAccessGranted : false;

  useEffect(() => {
    if (!project) {
      setApprovedAccessState("idle");
      return;
    }

    if (!shouldCheckApprovedAccess) {
      setApprovedAccessState("idle");
      return;
    }

    let active = true;
    const visitorToken = getProjectAccessVisitorToken();

    setApprovedAccessState("checking");
    void dataProvider
      .getProjectAccessStatus(project.id, visitorToken)
      .then((status) => {
        if (!active) return;
        setAccessRequestStatus(status.latestStatus);
        setApprovedAccessState(status.hasAccess ? "granted" : "blocked");
      })
      .catch((error) => {
        if (!active) return;
        console.warn("Nao foi possivel verificar o acesso aprovado ao projeto.", error);
        setApprovedAccessState("blocked");
      });

    return () => {
      active = false;
    };
  }, [project?.id, shouldCheckApprovedAccess]);

  const handleAccessRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const name = requestForm.name.trim();
    const email = requestForm.email.trim();
    const message = requestForm.message.trim();

    if (!name || !email || !message) {
      toast.error(t("fillAllFields"));
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      toast.error(t("accessRequestEmailInvalid"));
      return;
    }

    if (!project) return;

    setSubmittingRequest(true);

    try {
      const visitorToken = getProjectAccessVisitorToken();
      const result = await dataProvider.submitProjectAccessRequest({
        projectId: project.id,
        requesterName: name,
        requesterEmail: email,
        requesterMessage: message,
        visitorToken,
      });

      setAccessRequestStatus(result.latestStatus);

      if (result.hasAccess) {
        setApprovedAccessState("granted");
        setRequestDialogOpen(false);
        toast.success(t("accessAlreadyGranted"));
        return;
      }

      if (!result.created) {
        toast.info(t("accessRequestAlreadyPending"));
        setRequestDialogOpen(false);
        return;
      }

      const emailResult = await sendProjectAccessRequestEmail({
        name,
        email,
        message,
        projectTitle: richTextToPlainText(project.title) || "Projeto protegido",
        projectUrl: typeof window !== "undefined" ? window.location.href : `/projects/${project.slug}`,
        recipientEmail: profile.email || undefined,
      });

      setRequestDialogOpen(false);
      setRequestForm({ name: "", email: "", message: "" });
      toast.success(t("accessRequestSent"));

      if (!emailResult.success) {
        toast.info(emailResult.error || t("accessRequestNotificationWarning"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao solicitar acesso ao projeto.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-center">
          <h1 className="mb-4" style={{ fontSize: "26px", color: "var(--text-primary)" }}>{t("projectNotFound")}</h1>
          <Link to={backTo} className="underline" style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
            {t("back")}
          </Link>
        </div>
      </div>
    );
  }

  if (needsPassword && !projectUnlocked && isResolvingApprovedAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif] px-5" style={{ backgroundColor: "var(--bg-primary, #0B0B0D)" }}>
        <motion.div
          className="w-full max-w-[420px] rounded-2xl p-8 text-center"
          style={{ backgroundColor: "var(--bg-secondary, #121212)", border: "1px solid var(--border-primary, #2A2A2A)" }}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "var(--bg-primary, #0B0B0D)", border: "1px solid var(--border-primary, #2A2A2A)" }}
          >
            <ShieldCheck size={22} style={{ color: "var(--text-primary, #fafafa)" }} />
          </div>
          <p className="mx-auto max-w-[280px]" style={{ fontSize: "14px", lineHeight: "22px", color: "var(--text-secondary, #A1A1A1)" }}>
            {t("verifyingProjectAccess")}
          </p>
          <div
            className="mt-6 mx-auto h-7 w-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--border-primary, #2A2A2A)", borderTopColor: "var(--text-primary, #fafafa)" }}
            aria-hidden="true"
          />
        </motion.div>
      </div>
    );
  }

  // Password gate
  if (!projectUnlocked) {
    return (
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif] px-5" style={{ backgroundColor: "var(--bg-primary, #0B0B0D)" }}>
          <motion.div
            className="w-full max-w-[420px] rounded-2xl p-8 text-center"
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
              {t("protectedProjectTitle")}
            </h2>
            <p className="mb-6" style={{ fontSize: "14px", lineHeight: "22px", color: "var(--text-secondary, #888)" }}>
              {t("protectedProjectDescription")}
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={handlePasswordChange}
                placeholder={t("enterPassword")}
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
                  {t("incorrectPassword")}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg py-3 cursor-pointer border-none transition-all hover:-translate-y-0.5"
                style={{ fontSize: "14px", backgroundColor: "var(--btn-primary-bg, #fafafa)", color: "var(--btn-primary-text, #121212)" }}
              >
                {t("accessProject")}
              </button>
            </form>

            <div
              className="mt-6 border-t pt-6 text-left"
              style={{ borderColor: "var(--border-primary, #2A2A2A)" }}
            >
              <div className="mb-3 flex items-center gap-2 text-[#fafafa]">
                <ShieldCheck size={15} />
                <p style={{ fontSize: "13px", lineHeight: "19px" }}>{t("requestProjectAccess")}</p>
              </div>
              <p className="mb-4" style={{ fontSize: "12px", lineHeight: "18px", color: "var(--text-secondary, #777)" }}>
                {t("requestProjectAccessDescription")}
              </p>
              <button
                type="button"
                onClick={() => setRequestDialogOpen(true)}
                disabled={submittingRequest || accessRequestStatus === "pending"}
                className="w-full rounded-lg py-3 cursor-pointer border transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  fontSize: "13px",
                  borderColor: "var(--border-primary, #2A2A2A)",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  color: "var(--text-primary, #fafafa)",
                }}
              >
                {t("requestProjectAccess")}
              </button>
              {accessRequestStatus === "pending" && (
                <p className="mt-3" style={{ fontSize: "12px", lineHeight: "18px", color: "var(--text-secondary, #777)" }}>
                  {t("accessRequestAlreadyPending")}
                </p>
              )}
              {accessRequestStatus === "denied" && (
                <p className="mt-3" style={{ fontSize: "12px", lineHeight: "18px", color: "#f59e0b" }}>
                  {t("accessRequestDeniedNotice")}
                </p>
              )}
            </div>

            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 mt-6 transition-colors hover:opacity-80"
              style={{ fontSize: "13px", color: "var(--text-secondary, #666)" }}
            >
              <ArrowLeft size={13} /> {t("back")}
            </Link>
          </motion.div>
        </div>

        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[460px] rounded-[20px] border p-0"
          style={{ backgroundColor: "var(--bg-secondary, #121212)", borderColor: "var(--border-primary, #2A2A2A)" }}
        >
          <div className="p-6">
            <DialogHeader className="text-left">
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px]"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-primary, #2A2A2A)",
                  color: "var(--text-primary, #fafafa)",
                }}
              >
                <Mail size={16} />
              </div>
              <DialogTitle
                className="text-left font-['Inter',sans-serif]"
                style={{ fontSize: "18px", lineHeight: "24px", color: "var(--text-primary, #fafafa)" }}
              >
                {t("requestProjectAccessDialogTitle")}
              </DialogTitle>
              <DialogDescription
                className="text-left font-['Inter',sans-serif]"
                style={{ fontSize: "13px", lineHeight: "19px", color: "var(--text-secondary, #8A8A8A)" }}
              >
                {t("requestProjectAccessDialogDescription")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAccessRequestSubmit} className="mt-6 space-y-3">
              <input
                type="text"
                value={requestForm.name}
                onChange={(event) => setRequestForm((current) => ({ ...current, name: event.target.value }))}
                placeholder={t("yourName")}
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
                style={{
                  fontSize: "14px",
                  backgroundColor: "var(--bg-primary, #0B0B0D)",
                  border: "1px solid var(--border-primary, #2A2A2A)",
                  color: "var(--text-primary, #fafafa)",
                }}
              />
              <input
                type="email"
                value={requestForm.email}
                onChange={(event) => setRequestForm((current) => ({ ...current, email: event.target.value }))}
                placeholder={t("yourEmail")}
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition-colors"
                style={{
                  fontSize: "14px",
                  backgroundColor: "var(--bg-primary, #0B0B0D)",
                  border: "1px solid var(--border-primary, #2A2A2A)",
                  color: "var(--text-primary, #fafafa)",
                }}
              />
              <textarea
                value={requestForm.message}
                onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))}
                placeholder={t("message")}
                rows={5}
                className="w-full rounded-lg px-4 py-3 resize-none focus:outline-none transition-colors"
                style={{
                  fontSize: "14px",
                  backgroundColor: "var(--bg-primary, #0B0B0D)",
                  border: "1px solid var(--border-primary, #2A2A2A)",
                  color: "var(--text-primary, #fafafa)",
                }}
              />
              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full rounded-lg py-3 cursor-pointer border-none transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ fontSize: "14px", backgroundColor: "var(--btn-primary-bg, #fafafa)", color: "var(--btn-primary-text, #121212)" }}
              >
                {submittingRequest ? t("sendingAccessRequest") : t("submitAccessRequest")}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const heroImage = project.image || "";
  const gallery = (project.galleryImages || []).filter(Boolean);
  const projectTitleText = richTextToPlainText(project.title) || "Projeto";
  const projectSubtitleText = richTextToPlainText(project.subtitle);
  const infoDividerSpacing = Math.max(24, Math.min(160, project.infoDividerSpacing ?? 48));
  const projectGallerySlides: LightboxSlide[] = [
    ...(heroImage ? [{ src: heroImage, alt: projectTitleText }] : []),
    ...gallery.map((img, index) => ({
      src: img,
      alt: `${projectTitleText} gallery ${index + 1}`,
    })),
  ];
  const projectGalleryOffset = heroImage ? 1 : 0;

  const openProjectGalleryLightbox = (index: number, originRect?: LightboxOriginRect | null) => {
    const selectedSlide = projectGallerySlides[index];
    if (!selectedSlide?.src) return;

    setLightboxImage({
      slides: projectGallerySlides.map((slide, slideIndex) => ({
        ...slide,
        originRect: slideIndex === index ? originRect ?? null : null,
      })),
      index,
    });
  };

  // Metadata columns
  const meta = [
    { label: t("categoryLabel"), value: project.category },
    { label: t("servicesLabel"), value: project.services || "Não informado" },
    { label: t("clientLabel"), value: project.client || "Não informado" },
    { label: t("yearLabel"), value: project.year || "Não informado" },
  ];
  const titleStyle = resolveResponsiveTextAppearanceStyle(project.titleAppearance, PROJECT_TITLE_APPEARANCE_DEFAULTS, {
    maxFontSize: 24,
    maxLineHeight: 30,
  });
  const subtitleStyle = resolveTextAppearanceStyle(project.subtitleAppearance, PROJECT_SUBTITLE_APPEARANCE_DEFAULTS);

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
            to={backTo}
            className="flex items-center gap-1.5 transition-colors hover:opacity-80"
            style={{ fontSize: "14px", color: "var(--text-secondary, #7A7A7A)" }}
          >
            <ArrowLeft size={14} />
            {t("back")}
          </Link>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="responsive-page-title mt-4"
          style={titleStyle}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <RichTextContent value={project.title} placeholder="Titulo do case" />
        </motion.h1>

        {projectSubtitleText && (
          <motion.p
            className="mt-2"
            style={subtitleStyle}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <RichTextContent value={project.subtitle} />
          </motion.p>
        )}

        {/* Metadata 4 columns */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 w-full"
          style={{
            borderBottom: "1px solid var(--border-primary, #2A2A2A)",
            paddingBottom: "16px",
          }}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
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

        {heroImage && (
          <motion.div
            style={{ marginTop: `${infoDividerSpacing}px` }}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ImageCard
              src={heroImage}
              alt={projectTitleText}
              position={project.imagePosition || "50% 50%"}
              onClick={(event) => openProjectGalleryLightbox(0, getLightboxOriginRect(event.currentTarget))}
            />
          </motion.div>
        )}
      </div>

      {/* Content blocks */}
      {project.contentBlocks && project.contentBlocks.length > 0 && (
        <div style={{ marginTop: heroImage ? "48px" : `${infoDividerSpacing}px` }}>
          <ScrollReveal className="max-w-[700px] mx-auto px-5">
            <BlockRenderer blocks={project.contentBlocks} imagesClickable onImageClick={setLightboxImage} />
          </ScrollReveal>
        </div>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <div
          className="max-w-[700px] mx-auto px-5 flex flex-col gap-8"
          style={{
            marginTop:
              project.contentBlocks && project.contentBlocks.length > 0
                ? "48px"
                : heroImage
                  ? "48px"
                  : `${infoDividerSpacing}px`,
          }}
        >
          {gallery.map((img, i) => (
            <ScrollReveal key={i}>
              <ImageCard
                src={img}
                alt={`${projectTitleText} gallery ${i + 1}`}
                position={project.galleryPositions?.[i] || "50% 50%"}
                onClick={(event) => openProjectGalleryLightbox(i + projectGalleryOffset, getLightboxOriginRect(event.currentTarget))}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      <ImageLightbox
        open={Boolean(lightboxImage)}
        src={lightboxImage?.slides[lightboxImage?.index || 0]?.src || ""}
        alt={lightboxImage?.slides[lightboxImage?.index || 0]?.alt || ""}
        originRect={lightboxImage?.slides[lightboxImage?.index || 0]?.originRect}
        slides={lightboxImage?.slides}
        initialIndex={lightboxImage?.index || 0}
        onClose={() => setLightboxImage(null)}
      />

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
          {otherProjects.map((p) => {
            const cardCopy = getProjectCardCopy(p, siteSettings);

            return (
              <ProjectPreviewCard
                key={p.id}
                href={`/projects/${p.slug}`}
                title={cardCopy.title}
                subtitle={cardCopy.subtitle}
                image={p.cardImage || p.image || ""}
                imagePosition={p.cardImagePosition || p.imagePosition || "50% 50%"}
                locked={Boolean(p.password && p.password.trim() !== "")}
              />
            );
          })}
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
                {currentTime.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
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
                {socialLinks.map((s) => (
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
