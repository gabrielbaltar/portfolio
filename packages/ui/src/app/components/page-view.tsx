import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "./language-context";
import { useTranslatedCMS } from "./use-translated-cms";
import { BlockRenderer } from "./block-renderer";

export function PageView() {
  const { slug = "" } = useParams();
  const { data } = useTranslatedCMS();
  const { t } = useLanguage();
  const page = data.pages.find((item) => item.slug === slug && item.status === "published");

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]" style={{ backgroundColor: "var(--bg-primary, #111111)" }}>
        <div className="text-center">
          <h1 className="mb-4" style={{ fontSize: "26px", color: "var(--text-primary, #fafafa)" }}>
            {t("pageNotFound")}
          </h1>
          <Link to="/" className="underline" style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}>
            {t("backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Inter',sans-serif]" style={{ backgroundColor: "var(--bg-primary, #111111)" }}>
      <div className="max-w-[700px] mx-auto px-5 py-16">
        <Link
          to="/"
          className="flex items-center gap-2 mb-8 transition-colors"
          style={{ fontSize: "16px", color: "var(--text-secondary, #ababab)" }}
        >
          <ArrowLeft size={16} /> {t("back")}
        </Link>
        <h1 style={{ fontSize: "28px", lineHeight: "36px", color: "var(--text-primary, #fafafa)" }}>{page.title}</h1>
        {page.description && (
          <p className="mt-4" style={{ fontSize: "16px", lineHeight: "24px", color: "var(--text-secondary, #ababab)" }}>
            {page.description}
          </p>
        )}
        <div className="mt-10">
          <BlockRenderer blocks={page.contentBlocks} />
        </div>
      </div>
    </div>
  );
}
