import { useParams, Link } from "react-router";
import { ArrowLeft, ExternalLink, Copy, Phone, Lock, Tag, Clock, User } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
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

const BLOG_IMAGES = [
  "https://images.unsplash.com/photo-1649451844931-57e22fc82de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwd2ViJTIwZGVzaWduJTIwaW50ZXJmYWNlJTIwZGFyayUyMHNjcmVlbiUyMGNvZGV8ZW58MXx8fHwxNzcyNjAxMjg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNwb25zaXZlJTIwZGVzaWduJTIwbXVsdGlwbGUlMjBkZXZpY2VzJTIwc2NyZWVuc3xlbnwxfHx8fDE3NzI2MDEyODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1618788372246-79faff0c3742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaW50ZXJhY3Rpb24lMjBkZXNpZ24lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcyNjAxMjg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1615540127498-12c3049eded0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjB0cmVuZHMlMjBtb2Rlcm4lMjBsYXB0b3AlMjBjcmVhdGl2ZXxlbnwxfHx8fDE3NzI2MDEyODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

// Default article content sections for fallback when no contentBlocks exist
const DEFAULT_ARTICLE_ITEMS = [
  {
    title: "1. Immersive Experiences with Augmented Reality (AR) and Virtual Reality (VR)",
    text: "Augmented Reality (AR) and Virtual Reality (VR) are no longer just buzzwords—they are becoming integral parts of web design. In 2024, we expect to see more websites incorporating AR and VR elements to create immersive experiences. From virtual try-ons in e-commerce to interactive virtual tours, these technologies will enhance user engagement and provide unique, memorable experiences.",
  },
  {
    title: "2. AI-Driven Personalization",
    text: "Artificial Intelligence (AI) is revolutionizing how we interact with websites. AI-driven personalization will take center stage in 2024, enabling websites to deliver customized content and experiences based on user behavior and preferences. This means more relevant product recommendations, personalized marketing messages, and dynamic content that adapts to individual users in real time.",
  },
  {
    title: "3. Dark Mode and Low Light Design",
    text: "Dark mode has gained popularity over the past few years, and its dominance will continue in 2024. Beyond aesthetic appeal, dark mode reduces eye strain and saves battery life on devices with OLED screens. Designers will also explore low light design, creating interfaces that are easy on the eyes without sacrificing usability or visual appeal.",
  },
  {
    title: "4. Micro-Interactions for Enhanced User Engagement",
    text: "Micro-interactions are subtle animations or design elements that provide feedback to users and enhance their overall experience. In 2024, we will see an increase in the use of micro-interactions to guide users through websites, provide instant feedback, and make interactions more intuitive and enjoyable. These small touches can significantly improve user satisfaction and engagement.",
  },
  {
    title: "5. Minimalism and Simplicity",
    text: "Minimalist design continues to be a strong trend in web design. In 2024, simplicity will be key, with clean layouts, ample white space, and a focus on essential content. This approach not only enhances readability and usability but also ensures that websites load faster and perform better on various devices.",
  },
  {
    title: "6. Voice User Interface (VUI)",
    text: "With the rise of smart speakers and voice-activated devices, Voice User Interfaces (VUI) are becoming more prevalent. In 2024, more websites will integrate voice search and voice navigation features, making it easier for users to find information and interact with content without typing. This trend will be particularly important for accessibility and improving the user experience for people with disabilities.",
  },
  {
    title: "7. Sustainable Web Design",
    text: "As environmental awareness grows, sustainable web design is emerging as a crucial trend. Designers are now considering the environmental impact of their work, focusing on energy-efficient design practices, optimizing website performance, and reducing digital waste. This includes everything from using eco-friendly hosting services to designing lightweight websites that consume less data.",
  },
  {
    title: "8. Advanced Typography",
    text: "Typography plays a critical role in web design, and in 2024, we will see more innovative uses of type. Variable fonts, which allow for more flexible and responsive text, will become more common. Additionally, designers will experiment with unique typefaces and creative text layouts to create distinctive and memorable websites.",
  },
  {
    title: "9. 3D Elements and Illustrations",
    text: "Incorporating 3D elements and illustrations will continue to be a popular trend in 2024. These elements add depth and realism to web designs, making them more engaging and visually appealing. From 3D product models to interactive illustrations, these features will help websites stand out and capture user attention.",
  },
  {
    title: "10. Enhanced Accessibility",
    text: "Accessibility will remain a top priority in 2024. Designers will focus on creating inclusive websites that are accessible to all users, including those with disabilities. This involves adhering to WCAG (Web Content Accessibility Guidelines) standards, using semantic HTML, and ensuring that all interactive elements are keyboard and screen reader friendly.",
  },
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

function RelatedArticleCard({
  post,
  image,
}: {
  post: { title: string; publisher: string; date: string; description: string; slug: string };
  image: string;
}) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="flex flex-col sm:flex-row gap-4 rounded-lg overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div
        className="w-full sm:w-[280px] md:w-[342px] shrink-0 aspect-[3/2] rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--border-secondary, #242424)" }}
      >
        <ImageWithFallback
          src={image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <h3
            className="font-['Inter',sans-serif]"
            style={{ fontSize: "16px", lineHeight: "19.2px", color: "var(--text-primary, #fafafa)" }}
          >
            {post.title}
          </h3>
          <p
            className="mt-1.5 font-['Inter',sans-serif]"
            style={{ fontSize: "14px", color: "var(--text-secondary, #ababab)" }}
          >
            {post.publisher}, {post.date}
          </p>
          <p
            className="mt-3 font-['Inter',sans-serif] line-clamp-3"
            style={{ fontSize: "16px", lineHeight: "22.4px", color: "var(--text-secondary, #ababab)" }}
          >
            {post.description}
          </p>
        </div>
        <span
          className="mt-4 inline-flex items-center gap-1 font-['Inter',sans-serif] underline underline-offset-4"
          style={{
            fontSize: "16px",
            color: "var(--text-primary, #fafafa)",
            textDecorationColor: "var(--border-primary, #363636)",
          }}
        >
          Read article <ExternalLink size={14} />
        </span>
      </div>
    </Link>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const { data } = useTranslatedCMS();
  const { locale, t } = useLanguage();
  const { profile, blogPosts } = data;
  const { isProjectUnlocked, unlockProject } = usePassword();

  const post = blogPosts.find((p) => p.slug === slug);
  const otherPosts = blogPosts
    .filter((p) => p.slug !== slug && (!p.status || p.status === "published"))
    .slice(0, 3);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
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
            to="/blog"
            className="underline"
            style={{ fontSize: "16px", color: "var(--text-secondary)" }}
          >
            {t("backToBlog")}
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
            to="/blog"
            className="inline-flex items-center gap-1.5 mt-6 transition-colors hover:opacity-80"
            style={{ fontSize: "13px", color: "var(--text-secondary, #666)" }}
          >
            <ArrowLeft size={13} /> {t("backToBlog")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const heroImage = post.image || BLOG_IMAGES[0];
  const hasContentBlocks = post.contentBlocks && post.contentBlocks.length > 0;
  const hasRichContent = hasContentBlocks && post.contentBlocks.length > 4;
  const hasGallery = post.galleryImages && post.galleryImages.length > 0;

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
            to="/blog"
            className="flex items-center gap-1.5 transition-colors hover:opacity-80"
            style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}
          >
            <ArrowLeft size={16} />
            {t("blog")}
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
        {/* Use BlockRenderer if there are rich content blocks from CMS */}
        {hasRichContent ? (
          <ScrollReveal>
            <div className="max-w-[640px]">
              <BlockRenderer blocks={post.contentBlocks} />
            </div>
          </ScrollReveal>
        ) : (
          /* Fallback: render the default article body with numbered sections */
          <div className="max-w-[640px] space-y-0">
            {/* Intro paragraph (from CMS content blocks or fallback) */}
            {hasContentBlocks && post.contentBlocks.some((b) => b.type === "paragraph") ? (
              <ScrollReveal>
                <p
                  className="font-['Inter',sans-serif]"
                  style={{
                    fontSize: "16px",
                    lineHeight: "22.4px",
                    color: "var(--text-secondary, #ababab)",
                  }}
                >
                  {post.contentBlocks.find((b) => b.type === "paragraph")?.text ||
                    "As we step into 2024, the web design landscape continues to evolve at a rapid pace. Designers are constantly seeking new ways to create engaging, user-friendly, and visually appealing websites. Here are some of the key trends that are set to shape the future of web design in 2024:"}
                </p>
              </ScrollReveal>
            ) : (
              <ScrollReveal>
                <p
                  className="font-['Inter',sans-serif]"
                  style={{
                    fontSize: "16px",
                    lineHeight: "22.4px",
                    color: "var(--text-secondary, #ababab)",
                  }}
                >
                  As we step into 2024, the web design landscape continues to evolve at a rapid pace.
                  Designers are constantly seeking new ways to create engaging, user-friendly, and
                  visually appealing websites. Here are some of the key trends that are set to shape
                  the future of web design in 2024:
                </p>
              </ScrollReveal>
            )}

            {/* Numbered article sections */}
            {DEFAULT_ARTICLE_ITEMS.map((item, i) => (
              <ScrollReveal key={i}>
                <div className="mt-8">
                  <h3
                    className="font-['Inter',sans-serif]"
                    style={{
                      fontSize: "16px",
                      lineHeight: "19.2px",
                      color: "var(--text-primary, #fafafa)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-4 font-['Inter',sans-serif]"
                    style={{
                      fontSize: "16px",
                      lineHeight: "22.4px",
                      color: "var(--text-secondary, #ababab)",
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* ======== GALLERY ======== */}
      {hasGallery && (
        <div className="max-w-[700px] mx-auto px-5 mt-12 flex flex-col gap-8">
          {post.galleryImages!.map((img, i) => (
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
              {otherPosts.map((relatedPost, i) => (
                <ScrollReveal key={relatedPost.id}>
                  <RelatedArticleCard
                    post={relatedPost}
                    image={relatedPost.image || BLOG_IMAGES[(i + 1) % BLOG_IMAGES.length]}
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
                {[
                  { label: "Twitter", url: profile.twitter },
                  { label: "Instagram", url: profile.instagram },
                  { label: "LinkedIn", url: profile.linkedin },
                ].map((s) => (
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
