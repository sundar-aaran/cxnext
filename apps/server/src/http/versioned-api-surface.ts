const apiPrefix = "/api/v1";

export function rewriteVersionedApiUrl(request: { readonly url?: string }) {
  const originalUrl = request.url ?? "";
  return rewriteVersionedUrl(originalUrl, apiPrefix) ?? originalUrl;
}

function rewriteVersionedUrl(originalUrl: string, prefix: string) {
  if (originalUrl !== prefix && !originalUrl.startsWith(`${prefix}/`)) {
    return null;
  }

  const rewritten = originalUrl.slice(prefix.length);
  return rewritten ? rewritten : "/";
}
