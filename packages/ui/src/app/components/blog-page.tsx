import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "./language-context";
import { getVisiblePublicTags } from "./public-tag-utils";
import { useTranslatedCMS } from "./use-translated-cms";
import { motion } from "motion/react";
import { ArticlePreviewCard } from "./content-preview-cards";
import { filterVisibleContent } from "./site-visibility";

export function BlogPage() {
  const { data } = useTranslatedCMS();
  const { t } = useLanguage();
  const posts = filterVisibleContent(
    data.blogPosts.filter((post) => !post.status || post.status === "published"),
    data.siteSettings,
    "blogPosts",
  );

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
                <ArticlePreviewCard
                  href={`/blog/${post.slug}`}
                  title={post.title}
                  description={post.description}
                  image={post.image}
                  imagePosition={(post as any).imagePosition || "50% 50%"}
                  publisher={post.publisher}
                  date={post.date}
                  category={(post as any).category}
                  readTime={(post as any).readTime}
                  locked={Boolean((post as any).password && (post as any).password.trim() !== "")}
                  tags={visibleTags}
                  ctaLabel={t("readArticle")}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
