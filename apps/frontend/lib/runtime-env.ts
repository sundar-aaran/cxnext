export function getRequiredPublicApiUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    throw new Error("NEXT_PUBLIC_API_URL is required in the frontend environment.");
  }

  return value;
}

export function isSetupLookupEnabled() {
  const value = process.env.NEXT_PUBLIC_SETUP_LOOKUP_ENABLED?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}
