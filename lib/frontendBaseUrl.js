export function getFrontendBaseUrl() {
  return (process.env.FRONTEND_BASE_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
}

export function syncNextAuthUrlFromFrontendBase() {
  const baseUrl = getFrontendBaseUrl();
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = baseUrl;
  }
}
