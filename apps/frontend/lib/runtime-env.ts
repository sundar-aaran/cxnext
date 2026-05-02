export function getRequiredPublicApiUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    throw new Error("NEXT_PUBLIC_API_URL is required in the frontend environment.");
  }

  return value;
}
