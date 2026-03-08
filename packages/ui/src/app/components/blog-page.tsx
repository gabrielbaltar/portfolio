import { Link } from "react-router";
import { ArrowLeft, ExternalLink, Lock, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "./language-context";
import { getVisiblePublicTags } from "./public-tag-utils";
import { useTranslatedCMS } from "./use-translated-cms";
import { motion } from "motion/react";

import blogThumb1 from "figma:asset/blog-thumb-01.png";
import blogThumb2 from "figma:asset/blog-thumb-02.png";

const BLOG_IMAGES = [
  blogThumb1,
  blogThumb2,
];

export function BlogPage() {
  const { data } = useTranslatedCMS();
  const { t } = useLanguage();
  const posts = data.blogPosts.filter((post: any) => !post.status || post.status === "published");

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-[700px] mx-auto px-4 min-[480px]:px-5 lg:px-0 pt-[64px] pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-[32px] transition-colors"
          style={{ fontSize: "16px", color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={16} /> {t("back")}
        </Link>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="tracking-[-0.02em]"
          style={{ fontSize: "26px", lineHeight: "31.2px", color: "var(--text-primary)" }}
        >
          {t("articlesTitle")}
        </motion.h1>
        <div className="mt-10 space-y-10 min-[480px]:space-y-[40px]">
          {posts.map((post, i) => {
            const visibleTags = getVisiblePublicTags((post as any).tags);

            return (
              <motion.div
                key={post.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.23, 1, 0.32, 1] }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex flex-col min-[640px]:flex-row gap-4 group"
                >
                  <div
                    className="w-full min-[640px]:w-[342px] shrink-0 rounded-[10px] overflow-hidden"
                    style={{
                      border: "1px solid var(--border-secondary)",
                      aspectRatio: "342 / 233",
                    }}
                  >
                    <ImageWithFallback
                      src={post.image || BLOG_IMAGES[i % BLOG_IMAGES.length]}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      style={{ objectPosition: (post as any).imagePosition || "50% 50%" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 min-[640px]:max-w-[302px]">
                    <h3
                      className="font-['Inter',sans-serif] flex items-start gap-1.5 tracking-[-0.01em]"
                      style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-primary)" }}
                    >
                      {(post as any).password && (post as any).password.trim() !== "" && (
                        <Lock size={13} className="mt-[5px] shrink-0" style={{ color: "#ffa500", opacity: 0.7 }} />
                      )}
                      <span>{post.title}</span>
                    </h3>
                    <div className="mt-2 min-[640px]:mt-2">
                      <p style={{ fontSize: "14px", lineHeight: "21px", color: "var(--text-secondary)" }}>
                        {post.publisher}, {post.date}
                      </p>
                      {(post as any).readTime && (
                        <p
                          className="mt-2 inline-flex items-center gap-1.5"
                          style={{ fontSize: "14px", lineHeight: "21px", color: "var(--text-secondary)" }}
                        >
                          <Clock size={11} /> {(post as any).readTime}
                        </p>
                      )}
                    </div>
                    <p
                      className="mt-3 line-clamp-4"
                      style={{ fontSize: "16px", lineHeight: "22.4px", color: "var(--text-secondary)" }}
                    >
                      {post.description}
                    </p>
                    {visibleTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {visibleTags.slice(0, 4).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 rounded-[8px]"
                            style={{
                              height: "22.5px",
                              lineHeight: "16.5px",
                              fontSize: "11px",
                              backgroundColor: "var(--bg-secondary)",
                              border: "1px solid var(--border-primary)",
                              color: "var(--text-secondary)",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span
                      className="underline underline-offset-4 inline-flex items-center gap-1 mt-3"
                      style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-primary)", textDecorationColor: "var(--border-primary)" }}
                    >
                      {t("readArticle")} <ExternalLink size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
