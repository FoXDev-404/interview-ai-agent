const AUTH_ROUTE_PATHS = new Set(["/sign-in", "/sign-up", "/verify-email"]);

export function getSafeNextPath(
  nextParam: string | null | undefined,
  fallback = "/",
) {
  const candidate = (nextParam ?? "").trim();

  if (!candidate || candidate.length > 2048) {
    return fallback;
  }

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.startsWith("/\\")
  ) {
    return fallback;
  }

  if (candidate.includes("\r") || candidate.includes("\n")) {
    return fallback;
  }

  try {
    const normalized = new URL(candidate, "http://localhost");

    if (normalized.origin !== "http://localhost") {
      return fallback;
    }

    if (AUTH_ROUTE_PATHS.has(normalized.pathname)) {
      return fallback;
    }

    return `${normalized.pathname}${normalized.search}${normalized.hash}`;
  } catch {
    return fallback;
  }
}
