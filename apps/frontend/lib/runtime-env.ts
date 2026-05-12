export function getRequiredPublicApiUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (value) {
    return value.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  const backendUrl = process.env.BACKEND_URL?.trim();

  if (backendUrl) {
    return backendUrl.replace(/\/$/, "");
  }

  throw new Error("NEXT_PUBLIC_API_URL or BACKEND_URL is required in the frontend environment.");
}

export function isSetupLookupEnabled() {
  const value = process.env.NEXT_PUBLIC_SETUP_LOOKUP_ENABLED?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}
