import { Link } from "react-router";
import { ArrowLeft, ExternalLink, Lock, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { motion } from "motion/react";

const BLOG_IMAGES = [
  "https://images.unsplash.com/photo-1635069243450-e13812625d8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjB0cmVuZHMlMjBmdXR1cmlzdGljJTIwbGFwdG9wfGVufDF8fHx8MTc3MjU5MjgyMXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNwb25zaXZlJTIwZGVzaWduJTIwZGV2aWNlcyUyMHNjcmVlbnN8ZW58MXx8fHwxNzcyNTkyODIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1608682285597-156feb50eb4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd29ya3NwYWNlJTIwY2xlYW4lMjBkZXNrfGVufDF8fHx8MTc3MjU5MjgyMnww&ixlib=rb-4.1.0&q=80&w=1080",
];

export function BlogPage() {
  const { data } = useTranslatedCMS();
  const { t } = useLanguage();

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-[700px] mx-auto px-5 py-16">
        <Link
          to="/"
          className="flex items-center gap-2 mb-8 transition-colors"
          style={{ fontSize: "16px", color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={16} /> {t("back")}
        </Link>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: "26px", lineHeight: "31.2px", color: "var(--text-primary)" }}
        >
          {t("articlesTitle")}
        </motion.h1>
        <div className="mt-10 space-y-10">
          {data.blogPosts.filter((p: any) => !p.status || p.status === "published").map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link to={`/blog/${post.slug}`} className="flex flex-col sm:flex-row gap-4 group">
                <div
                  className="w-full sm:w-[342px] shrink-0 aspect-[3/2] rounded-lg overflow-hidden"
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
                  <h3 className="font-['Inter',sans-serif] flex items-center gap-1.5" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                    {(post as any).password && (post as any).password.trim() !== "" && (
                      <Lock size={13} style={{ color: "#ffa500", opacity: 0.7 }} />
                    )}
                    {post.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 flex-wrap" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    <span>{post.publisher}, {post.date}</span>
                    {(post as any).category && (
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "11px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                        {(post as any).category}
                      </span>
                    )}
                    {(post as any).readTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {(post as any).readTime}
                      </span>
                    )}
                  </p>
                  {(post as any).subtitle && (
                    <p className="mt-1.5" style={{ fontSize: "14px", color: "var(--text-secondary)", opacity: 0.8 }}>
                      {(post as any).subtitle}
                    </p>
                  )}
                  <p className="mt-3 line-clamp-4" style={{ fontSize: "16px", lineHeight: "22.4px", color: "var(--text-secondary)" }}>
                    {post.description}
                  </p>
                  {(post as any).tags && (post as any).tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(post as any).tags.slice(0, 4).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md"
                          style={{ fontSize: "11px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span
                    className="underline underline-offset-4 inline-flex items-center gap-1 mt-3"
                    style={{ fontSize: "16px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                  >
                    {t("readArticle")} <ExternalLink size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}