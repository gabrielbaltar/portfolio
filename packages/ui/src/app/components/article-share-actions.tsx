import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

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

function ShareTriggerButton({
  label,
}: {
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: "var(--border-primary, #2A2A2A)",
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        color: "var(--text-primary, #FAFAFA)",
      }}
    >
      <Share2 size={14} />
      <span
        className="font-['Inter',sans-serif]"
        style={{ fontSize: "13px", lineHeight: "18px" }}
      >
        {label}
      </span>
    </button>
  );
}

function ShareActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      title={label}
      aria-label={label}
      className="flex min-h-[44px] items-center gap-2 rounded-[12px] border px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: "var(--border-primary, #2A2A2A)",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        color: "var(--text-primary, #FAFAFA)",
      }}
    >
      <Icon size={14} />
      <span className="min-w-0 font-['Inter',sans-serif]" style={{ fontSize: "13px", lineHeight: "18px" }}>
        {label}
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
  const [open, setOpen] = useState(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ShareTriggerButton label={t("shareNatively")} />
      </DialogTrigger>

      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[360px] gap-0 rounded-[18px] border p-0 shadow-2xl"
        style={{
          backgroundColor: "var(--bg-primary, #111111)",
          borderColor: "var(--border-primary, #2A2A2A)",
        }}
      >
        <div className="p-5">
          <DialogHeader className="text-left">
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px]"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-primary, #2A2A2A)",
                color: "var(--text-primary, #FAFAFA)",
              }}
            >
              <Share2 size={16} />
            </div>
            <DialogTitle
              className="font-['Inter',sans-serif] text-left"
              style={{ fontSize: "18px", lineHeight: "24px", color: "var(--text-primary, #FAFAFA)", fontWeight: 500 }}
            >
              {t("shareArticle")}
            </DialogTitle>
            <DialogDescription
              className="mt-1 text-left font-['Inter',sans-serif]"
              style={{ fontSize: "13px", lineHeight: "19px", color: "var(--text-secondary, #8A8A8A)" }}
            >
              {shareText}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <ShareActionButton
              icon={Share2}
              label={t("shareNatively")}
              onClick={async () => {
                setOpen(false);
                await handleNativeShare();
              }}
            />
            <ShareActionButton
              icon={Link2}
              label={t("copyLink")}
              onClick={async () => {
                setOpen(false);
                await handleCopyLink();
              }}
            />
          </div>

          <div
            className="my-4 h-px"
            style={{ backgroundColor: "var(--border-primary, #2A2A2A)" }}
          />

          <div className="grid grid-cols-2 gap-2">
            <ShareActionButton
              icon={Twitter}
              label={t("shareOnX")}
              onClick={() => {
                setOpen(false);
                openPopup(xShareUrl);
              }}
            />
            <ShareActionButton
              icon={Facebook}
              label={t("shareOnFacebook")}
              onClick={() => {
                setOpen(false);
                openPopup(facebookShareUrl);
              }}
            />
            <ShareActionButton
              icon={Linkedin}
              label={t("shareOnLinkedIn")}
              onClick={() => {
                setOpen(false);
                openPopup(linkedInShareUrl);
              }}
            />
            <ShareActionButton
              icon={MessageCircle}
              label={t("shareOnWhatsApp")}
              onClick={() => {
                setOpen(false);
                window.open(whatsappShareUrl, "_blank", "noopener,noreferrer");
              }}
            />
            <ShareActionButton
              icon={Instagram}
              label={t("shareOnInstagram")}
              onClick={async () => {
                setOpen(false);
                await handleInstagramShare();
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
