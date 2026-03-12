import { useParams, Link, useLocation } from "react-router";
import { ArrowLeft, ExternalLink, Copy, Phone, Lock, Tag, Clock, User } from "lucide-react";
import { ContentImage } from "./content-image";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { motion } from "motion/react";
import { BlockRenderer } from "./block-renderer";
import { ScrollReveal } from "./scroll-reveal";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { sendContactEmail } from "./email-service";
import { usePassword } from "./password-context";
import { copyToClipboard } from "./clipboard-utils";
import { getVisiblePublicTags } from "./public-tag-utils";
import { ArticlePreviewCard } from "./content-preview-cards";
import { getBackTarget } from "./navigation-state";
import { getProfileSocialLinks } from "./profile-social-links";
import { filterVisibleContent } from "./site-visibility";

function ImageCard({ src, alt, className = "", position = "50% 50%" }: { src: string; alt: string; className?: string; position?: string }) {
  return (
    <ContentImage
      src={src}
      alt={alt}
      emptyLabel="Sem imagem"
      className={`w-full rounded-2xl object-cover ${className}`}
      position={position}
      style={{ height: "525px", maxHeight: "525px" }}
    />
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { data } = useTranslatedCMS();
  const { locale, t } = useLanguage();
  const { profile, siteSettings } = data;
  const blogPosts = filterVisibleContent(
    data.blogPosts.filter((post) => !post.status || post.status === "published"),
    siteSettings,
    "blogPosts",
  );
  const { isProjectUnlocked, unlockProject } = usePassword();

  const post = blogPosts.find((p) => p.slug === slug);
  const otherPosts = blogPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const backTo = getBackTarget(location.state, "/blog");
  const socialLinks = getProfileSocialLinks(profile);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Contact Form Blog] handleSubmit called", formData);
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t("fillAllFields") || "Preencha todos os campos.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await sendContactEmail(formData);
      console.log("[Contact Form Blog] Result:", result);
      if (result.success) {
        toast.success(t("messageSent"));
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(result.error || "Erro ao enviar mensagem.");
      }
    } catch (err) {
      console.error("[Contact Form Blog] Unexpected error:", err);
      toast.error("Erro inesperado ao enviar mensagem.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
    setPasswordError(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (post && passwordInput === post.password) {
      setIsUnlocked(true);
      setPasswordError(false);
      unlockProject(post.id);
    } else {
      setPasswordError(true);
    }
  };

  if (!post) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <h1 className="mb-4" style={{ fontSize: "26px", color: "var(--text-primary)" }}>
            {t("articleNotFound")}
          </h1>
          <Link
            to={backTo}
            className="underline"
            style={{ fontSize: "16px", color: "var(--text-secondary)" }}
          >
            {t("back")}
          </Link>
        </div>
      </div>
    );
  }

  const visibleTags = getVisiblePublicTags(post.tags);

  // Check if post requires password
  const needsPassword = post.password && post.password.trim() !== "";
  const postUnlocked = !needsPassword || isUnlocked || isProjectUnlocked(post.id);

  // Password gate
  if (!postUnlocked) {
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
            {t("protectedArticleTitle")}
          </h2>
          <p className="mb-6" style={{ fontSize: "14px", lineHeight: "22px", color: "var(--text-secondary, #888)" }}>
            {t("protectedArticleDescription")}
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
              {t("accessArticle")}
            </button>
          </form>
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 mt-6 transition-colors hover:opacity-80"
            style={{ fontSize: "13px", color: "var(--text-secondary, #666)" }}
          >
            <ArrowLeft size={13} /> {t("back")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const heroImage = post.image || "";
  const hasContentBlocks = post.contentBlocks && post.contentBlocks.length > 0;
  const hasLegacyContent = Boolean(post.content && post.content.trim());
  const galleryImages = (post.galleryImages || []).filter(Boolean);
  const hasGallery = galleryImages.length > 0;

  // Metadata
  const meta = [
    post.author ? { label: t("authorLabel"), value: post.author, icon: User } : null,
    post.date ? { label: t("dateLabel"), value: post.date, icon: Clock } : null,
    post.readTime ? { label: t("readingTimeLabel"), value: post.readTime, icon: Clock } : null,
    post.category ? { label: t("categoryLabel"), value: post.category, icon: Tag } : null,
    post.services ? { label: t("topicsLabel"), value: post.services, icon: Tag } : null,
  ].filter(Boolean) as { label: string; value: string; icon: typeof User }[];

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-primary, #0B0B0D)" }}
    >
      {/* ======== HEADER ======== */}
      <div className="max-w-[700px] mx-auto px-5 pt-24 md:pt-28">
        {/* Back / Breadcrumb */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to={backTo}
            className="flex items-center gap-1.5 transition-colors hover:opacity-80"
            style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}
          >
            <ArrowLeft size={16} />
            {t("back")}
          </Link>
        </motion.div>

        {/* Date & Category */}
        <motion.div
          className="mt-6 flex items-center gap-3 flex-wrap"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span style={{ fontSize: "14px", color: "var(--text-secondary, #ababab)" }}>
            {post.date}
          </span>
          {post.category && (
            <>
              <span style={{ fontSize: "14px", color: "var(--border-primary, #363636)" }}>/</span>
              <span style={{ fontSize: "14px", color: "var(--text-secondary, #ababab)" }}>
                {post.category}
              </span>
            </>
          )}
          {post.readTime && (
            <>
              <span style={{ fontSize: "14px", color: "var(--border-primary, #363636)" }}>/</span>
              <span className="flex items-center gap-1" style={{ fontSize: "14px", color: "var(--text-secondary, #ababab)" }}>
                <Clock size={12} /> {post.readTime}
              </span>
            </>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          className="mt-3"
          style={{ fontSize: "26px", lineHeight: "31.2px", color: "var(--text-primary, #fafafa)" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {post.title}
        </motion.h1>

        {/* Subtitle */}
        {post.subtitle && (
          <motion.p
            className="mt-2"
            style={{ fontSize: "18px", lineHeight: "26px", color: "var(--text-secondary, #ababab)" }}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {post.subtitle}
          </motion.p>
        )}

        {/* Description */}
        <motion.p
          className="mt-4 max-w-[600px]"
          style={{ fontSize: "16px", lineHeight: "22.4px", color: "var(--text-secondary, #ababab)" }}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {post.description}
        </motion.p>

        {/* External link */}
        {post.link && post.link.trim() !== "" && (
          <motion.a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ fontSize: "13px", color: "var(--text-secondary, #CFCFCF)" }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t("originalPublication")} <ExternalLink size={12} />
          </motion.a>
        )}

        {/* Tags */}
        {visibleTags.length > 0 && (
          <motion.div
            className="mt-5 flex flex-wrap gap-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md font-['Inter',sans-serif]"
                style={{
                  fontSize: "12px",
                  backgroundColor: "var(--bg-secondary, #121212)",
                  border: "1px solid var(--border-primary, #2A2A2A)",
                  color: "var(--text-secondary, #ababab)",
                }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* Metadata row */}
        {meta.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-6 mt-6 pb-6"
            style={{ borderBottom: "1px solid var(--border-primary, #2A2A2A)" }}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {meta.map((m) => (
              <div key={m.label} className="min-w-0">
                <p className="font-['Inter',sans-serif]" style={{ fontSize: "11px", color: "var(--text-secondary, #6F6F6F)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {m.label}
                </p>
                <p className="mt-1 font-['Inter',sans-serif]" style={{ fontSize: "14px", color: "var(--text-primary, #D6D6D6)" }}>
                  {m.value}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Hero Image */}
        <motion.div
          className="mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ImageCard
            src={heroImage}
            alt={post.title}
            position={post.imagePosition || "50% 50%"}
          />
        </motion.div>
      </div>

      {/* ======== ARTICLE BODY ======== */}
      <div className="max-w-[700px] mx-auto px-5 mt-12">
        {hasContentBlocks ? (
          <ScrollReveal>
            <div className="max-w-[640px]">
              <BlockRenderer blocks={post.contentBlocks} />
            </div>
          </ScrollReveal>
        ) : hasLegacyContent ? (
          <div className="max-w-[640px] space-y-6">
            {post.content
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <ScrollReveal key={index}>
                  <p
                    className="font-['Inter',sans-serif] whitespace-pre-wrap"
                    style={{
                      fontSize: "16px",
                      lineHeight: "22.4px",
                      color: "var(--text-secondary, #ababab)",
                    }}
                  >
                    {paragraph}
                  </p>
                </ScrollReveal>
              ))}
          </div>
        ) : (
          <div className="max-w-[640px]">
            <ScrollReveal>
              <p
                className="font-['Inter',sans-serif]"
                style={{
                  fontSize: "16px",
                  lineHeight: "22.4px",
                  color: "var(--text-secondary, #ababab)",
                }}
              >
                {post.description || "Este artigo ainda nao possui blocos ou texto adicional publicados."}
              </p>
            </ScrollReveal>
          </div>
        )}
      </div>

      {/* ======== GALLERY ======== */}
      {hasGallery && (
        <div className="max-w-[700px] mx-auto px-5 mt-12 flex flex-col gap-8">
          {galleryImages.map((img, i) => (
            <ScrollReveal key={i}>
              <ImageCard
                src={img}
                alt={`${post.title} gallery ${i + 1}`}
                position={post.galleryPositions?.[i] || "50% 50%"}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* ======== READ MORE ARTICLES ======== */}
      {otherPosts.length > 0 && (
        <ScrollReveal className="max-w-[700px] mx-auto px-5 mt-20">
          <div
            className="pt-10"
            style={{ borderTop: "1px solid var(--border-primary, #2A2A2A)" }}
          >
            {/* Section header */}
            <div className="flex items-center justify-between mb-10">
              <h2
                className="font-['Inter',sans-serif]"
                style={{ fontSize: "20px", lineHeight: "24px", color: "var(--text-primary, #fafafa)" }}
              >
                {t("readMoreArticles") || "Read more articles"}
              </h2>
              <Link
                to="/blog"
                className="flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}
              >
                {t("viewAllPosts") || "View all posts"} <ExternalLink size={14} />
              </Link>
            </div>

            {/* Related articles list */}
            <div className="space-y-10">
              {otherPosts.map((relatedPost) => (
                <ScrollReveal key={relatedPost.id}>
                  <ArticlePreviewCard
                    href={`/blog/${relatedPost.slug}`}
                    title={relatedPost.title}
                    description={relatedPost.description}
                    image={relatedPost.image || ""}
                    imagePosition={(relatedPost as any).imagePosition || "50% 50%"}
                    galleryImages={relatedPost.galleryImages}
                    galleryPositions={relatedPost.galleryPositions}
                    publisher={relatedPost.publisher}
                    date={relatedPost.date}
                    category={(relatedPost as any).category}
                    readTime={(relatedPost as any).readTime}
                    locked={Boolean((relatedPost as any).password && (relatedPost as any).password.trim() !== "")}
                    tags={getVisiblePublicTags((relatedPost as any).tags)}
                    ctaLabel={t("readArticle") || "Read article"}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ======== CONTACT / LET'S TALK FOOTER ======== */}
      <ScrollReveal as="footer" className="max-w-[700px] mx-auto px-5 py-16 mt-8">
        <h2
          className="font-['Inter',sans-serif]"
          style={{ fontSize: "20px", color: "var(--text-primary, #fafafa)" }}
        >
          {t("letsTalk")}
        </h2>

        <div className="mt-8 flex flex-col md:flex-row gap-8">
          {/* Info column */}
          <div
            className="pl-4 md:w-[240px] shrink-0 space-y-6"
            style={{ borderLeft: "1px solid var(--border-primary, #363636)" }}
          >
            <div>
              <p style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}>
                <span className="font-['Inter',sans-serif] mr-2" style={{ color: "var(--text-primary, #fafafa)" }}>
                  {t("timeForMe")}
                </span>
                {currentTime.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="font-['Inter',sans-serif]" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>
                {t("email")}
              </p>
              <button
                onClick={copyEmail}
                className="flex items-center gap-1 mt-1 cursor-pointer bg-transparent border-none"
                style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}
              >
                <Copy size={14} /> {profile.email}
              </button>
            </div>
            <div>
              <p className="font-['Inter',sans-serif]" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>
                {t("phone")}
              </p>
              <p
                className="flex items-center gap-1 mt-1"
                style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}
              >
                <Phone size={14} /> {profile.phone}
              </p>
            </div>
            <div>
              <p className="font-['Inter',sans-serif] mb-2" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>
                {t("socials")}
              </p>
              <div className="space-y-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 transition-colors"
                    style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}
                  >
                    <ExternalLink size={14} /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="flex-1">
            <p className="font-['Inter',sans-serif] mb-4" style={{ fontSize: "16px", color: "var(--text-primary, #fafafa)" }}>
              {t("reachOut")}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t("yourName")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none"
                style={{
                  fontSize: "14px",
                  backgroundColor: "var(--bg-secondary, #242424)",
                  border: "1px solid var(--border-primary, #363636)",
                  color: "var(--text-primary, #fafafa)",
                }}
              />
              <input
                type="email"
                placeholder={t("yourEmail")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none"
                style={{
                  fontSize: "14px",
                  backgroundColor: "var(--bg-secondary, #242424)",
                  border: "1px solid var(--border-primary, #363636)",
                  color: "var(--text-primary, #fafafa)",
                }}
              />
              <textarea
                placeholder={t("message")}
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none resize-none"
                style={{
                  fontSize: "14px",
                  backgroundColor: "var(--bg-secondary, #242424)",
                  border: "1px solid var(--border-primary, #363636)",
                  color: "var(--text-primary, #fafafa)",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md py-2.5 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                style={{
                  fontSize: "16px",
                  backgroundColor: "var(--btn-primary-bg, #fafafa)",
                  color: "var(--btn-primary-text, #121212)",
                }}
              >
                {submitting ? (t("sending") || "Enviando...") : t("sendMessage")}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="mt-12 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ borderTop: "1px solid var(--border-primary, #363636)" }}
        >
          <p style={{ fontSize: "14px", color: "var(--text-secondary, #ababab)" }}>
            {t("designedIn")}{" "}
            <a href="https://figma.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary, #fafafa)" }}>
              Figma
            </a>{" "}
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
