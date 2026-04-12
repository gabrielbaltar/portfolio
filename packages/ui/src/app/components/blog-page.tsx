import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "./language-context";
import { getVisiblePublicTags } from "./public-tag-utils";
import { useTranslatedCMS } from "./use-translated-cms";
import { motion } from "motion/react";
import { ArticlePreviewCard } from "./content-preview-cards";
import { ContentPagination } from "./content-pagination";
import { filterVisibleContent, getArticleCardCopy } from "./site-visibility";

const POSTS_PER_PAGE = 6;

export function BlogPage() {
  const { data } = useTranslatedCMS();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const posts = filterVisibleContent(
    data.blogPosts.filter((post) => !post.status || post.status === "published"),
    data.siteSettings,
    "blogPosts",
  );
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const rawPage = Number(searchParams.get("page") || "1");
  const currentPage = Number.isFinite(rawPage) ? Math.min(Math.max(1, rawPage), totalPages) : 1;
  const paginatedPosts = posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (page <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(page));
    }
    setSearchParams(nextParams);
  };

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
          className="tracking-[-0.02em] text-[22px] leading-[28px] min-[640px]:text-[26px] min-[640px]:leading-[31.2px]"
          style={{ color: "var(--text-primary)" }}
        >
          {t("articlesTitle")}
        </motion.h1>
        <div className="mt-10 grid grid-cols-1 gap-6 min-[560px]:grid-cols-2">
          {paginatedPosts.map((post, i) => {
            const visibleTags = getVisiblePublicTags((post as any).tags);
            const cardCopy = getArticleCardCopy(post);

            return (
              <motion.div
                key={post.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.23, 1, 0.32, 1] }}
                className="h-full"
              >
                <ArticlePreviewCard
                  href={`/blog/${post.slug}`}
                  title={cardCopy.title}
                  description={cardCopy.description}
                  image={post.cardImage || post.image}
                  imagePosition={post.cardImagePosition || post.imagePosition || "50% 50%"}
                  publisher={post.publisher}
                  date={post.date}
                  category={(post as any).category}
                  readTime={(post as any).readTime}
                  locked={Boolean((post as any).password && (post as any).password.trim() !== "")}
                  tags={visibleTags}
                  ctaLabel={t("readArticle")}
                  layout="vertical"
                />
              </motion.div>
            );
          })}
        </div>
        <ContentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          previousLabel={t("previousPage")}
          nextLabel={t("nextPage")}
          pageLabel={t("pageLabel")}
        />
      </div>
    </div>
  );
}
