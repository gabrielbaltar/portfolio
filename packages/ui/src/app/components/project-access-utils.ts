const PROJECT_ACCESS_VISITOR_TOKEN_KEY = "portfolio-project-access-visitor-token";

function generateVisitorToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `visitor-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function getProjectAccessVisitorToken() {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    const existing = window.localStorage.getItem(PROJECT_ACCESS_VISITOR_TOKEN_KEY)?.trim();
    if (existing) return existing;

    const nextToken = generateVisitorToken();
    window.localStorage.setItem(PROJECT_ACCESS_VISITOR_TOKEN_KEY, nextToken);
    return nextToken;
  } catch {
    return generateVisitorToken();
  }
}
