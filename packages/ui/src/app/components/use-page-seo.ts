import { useEffect } from "react";

type PageSeoConfig = {
  title: string;
  description: string;
  siteName: string;
  locale: string;
  twitterCard: string;
  type?: "article" | "website";
  url?: string;
  imageUrl?: string;
};

type MetaSnapshot = {
  created: boolean;
  element: HTMLMetaElement;
  previousContent: string | null;
  previousManaged: string | undefined;
};

type LinkSnapshot = {
  created: boolean;
  element: HTMLLinkElement;
  previousHref: string;
  previousManaged: string | undefined;
};

function upsertMeta(attr: "name" | "property", key: string, content: string): MetaSnapshot {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  const created = !element;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }

  const snapshot: MetaSnapshot = {
    created,
    element,
    previousContent: element.getAttribute("content"),
    previousManaged: element.dataset.portfolioSeo,
  };

  element.dataset.portfolioSeo = "true";
  element.setAttribute("content", content);
  return snapshot;
}

function restoreMeta(snapshot: MetaSnapshot) {
  if (snapshot.created) {
    snapshot.element.remove();
    return;
  }

  snapshot.element.dataset.portfolioSeo = snapshot.previousManaged || "";
  if (!snapshot.previousManaged) {
    delete snapshot.element.dataset.portfolioSeo;
  }

  if (snapshot.previousContent === null) {
    snapshot.element.removeAttribute("content");
    return;
  }

  snapshot.element.setAttribute("content", snapshot.previousContent);
}

function upsertCanonical(href: string): LinkSnapshot {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const created = !element;

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  const snapshot: LinkSnapshot = {
    created,
    element,
    previousHref: element.getAttribute("href") || "",
    previousManaged: element.dataset.portfolioSeo,
  };

  element.dataset.portfolioSeo = "true";
  element.setAttribute("href", href);
  return snapshot;
}

function restoreCanonical(snapshot: LinkSnapshot) {
  if (snapshot.created) {
    snapshot.element.remove();
    return;
  }

  snapshot.element.dataset.portfolioSeo = snapshot.previousManaged || "";
  if (!snapshot.previousManaged) {
    delete snapshot.element.dataset.portfolioSeo;
  }

  if (!snapshot.previousHref) {
    snapshot.element.removeAttribute("href");
    return;
  }

  snapshot.element.setAttribute("href", snapshot.previousHref);
}

export function usePageSeo({
  title,
  description,
  siteName,
  locale,
  twitterCard,
  type = "website",
  url,
  imageUrl,
}: PageSeoConfig) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousTitle = document.title;
    document.title = title;

    const metaSnapshots = [
      upsertMeta("name", "description", description),
      upsertMeta("property", "og:type", type),
      upsertMeta("property", "og:title", title),
      upsertMeta("property", "og:description", description),
      upsertMeta("property", "og:site_name", siteName),
      upsertMeta("property", "og:locale", locale),
      upsertMeta("name", "twitter:card", twitterCard),
      upsertMeta("name", "twitter:title", title),
      upsertMeta("name", "twitter:description", description),
    ];

    if (url) {
      metaSnapshots.push(
        upsertMeta("property", "og:url", url),
        upsertMeta("name", "twitter:url", url),
      );
    }

    if (imageUrl) {
      metaSnapshots.push(
        upsertMeta("property", "og:image", imageUrl),
        upsertMeta("property", "og:image:alt", title),
        upsertMeta("name", "twitter:image", imageUrl),
        upsertMeta("name", "twitter:image:alt", title),
      );
    }

    const canonicalSnapshot = url ? upsertCanonical(url) : null;

    return () => {
      document.title = previousTitle;
      metaSnapshots.reverse().forEach(restoreMeta);
      if (canonicalSnapshot) {
        restoreCanonical(canonicalSnapshot);
      }
    };
  }, [description, imageUrl, locale, siteName, title, twitterCard, type, url]);
}
