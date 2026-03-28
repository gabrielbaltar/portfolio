import type { LucideIcon } from "lucide-react";
import {
  Facebook,
  Instagram,
  Link2,
  Linkedin,
  MessageCircle,
  Share2,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "./clipboard-utils";
import { useLanguage } from "./language-context";

function buildShareUrl(baseUrl: string, params: Record<string, string>) {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    url.searchParams.set(key, value);
  });

  return url.toString();
}

function openPopup(url: string) {
  if (typeof window === "undefined") return;

  const width = 720;
  const height = 680;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
  const features = [
    "popup=yes",
    "noopener=yes",
    "noreferrer=yes",
    `width=${width}`,
    `height=${height}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
  ].join(",");

  const popup = window.open(url, "_blank", features);
  if (!popup) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function ShareActionButton({
  icon: Icon,
  label,
  mobileLabel,
  emphasized = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  mobileLabel?: string;
  emphasized?: boolean;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: emphasized ? "rgba(250, 250, 250, 0.18)" : "var(--border-primary, #2A2A2A)",
        backgroundColor: emphasized ? "rgba(250, 250, 250, 0.08)" : "transparent",
        color: "var(--text-primary, #FAFAFA)",
      }}
    >
      <Icon size={14} />
      <span
        className="font-['Inter',sans-serif]"
        style={{ fontSize: "13px", lineHeight: "18px" }}
      >
        <span className="min-[520px]:hidden">{mobileLabel || label}</span>
        <span className="hidden min-[520px]:inline">{label}</span>
      </span>
    </button>
  );
}

export function ArticleShareActions({
  title,
  description,
  url,
}: {
  title: string;
  description?: string;
  url: string;
}) {
  const { t } = useLanguage();
  const shareText = title.trim();
  const shareDescription = description?.trim() || "";

  const handleCopyLink = async () => {
    await copyToClipboard(url);
    toast.success(t("articleLinkCopied"));
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: shareDescription || shareText,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyToClipboard(url);
    toast.success(t("nativeShareFallback"));
  };

  const handleInstagramShare = async () => {
    await copyToClipboard(url);
    toast.success(t("instagramShareFallback"));
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const xShareUrl = buildShareUrl("https://x.com/intent/post", {
    text: shareText,
    url,
  });
  const facebookShareUrl = buildShareUrl("https://www.facebook.com/sharer/sharer.php", {
    u: url,
  });
  const linkedInShareUrl = buildShareUrl("https://www.linkedin.com/sharing/share-offsite/", {
    url,
  });
  const whatsappShareUrl = buildShareUrl("https://wa.me/", {
    text: `${shareText}\n${url}`,
  });

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <ShareActionButton
        icon={Share2}
        label={t("shareNatively")}
        emphasized
        onClick={handleNativeShare}
      />
      <ShareActionButton
        icon={Link2}
        label={t("copyLink")}
        emphasized
        onClick={handleCopyLink}
      />
      <ShareActionButton
        icon={Twitter}
        label={t("shareOnX")}
        mobileLabel="X"
        onClick={() => openPopup(xShareUrl)}
      />
      <ShareActionButton
        icon={Facebook}
        label={t("shareOnFacebook")}
        mobileLabel="Fb"
        onClick={() => openPopup(facebookShareUrl)}
      />
      <ShareActionButton
        icon={Linkedin}
        label={t("shareOnLinkedIn")}
        mobileLabel="In"
        onClick={() => openPopup(linkedInShareUrl)}
      />
      <ShareActionButton
        icon={MessageCircle}
        label={t("shareOnWhatsApp")}
        mobileLabel="WA"
        onClick={() => {
          window.open(whatsappShareUrl, "_blank", "noopener,noreferrer");
        }}
      />
      <ShareActionButton
        icon={Instagram}
        label={t("shareOnInstagram")}
        mobileLabel="Ig"
        onClick={handleInstagramShare}
      />
    </div>
  );
}
