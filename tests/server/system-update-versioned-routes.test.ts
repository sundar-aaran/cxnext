import { describe, expect, it } from "vitest";
import { rewriteVersionedApiUrl } from "../../apps/server/src/http/versioned-api-surface";

describe("system update versioned routes", () => {
  it("rewrites /api/v1 system update routes to the controller path", () => {
    expect(rewriteVersionedApiUrl({ url: "/api/v1/system-update/deploy" })).toBe("/system-update/deploy");
    expect(rewriteVersionedApiUrl({ url: "/api/v1/system-update/status" })).toBe("/system-update/status");
  });

  it("rewrites /v1 system update routes to the controller path", () => {
    expect(rewriteVersionedApiUrl({ url: "/v1/system-update/deploy" })).toBe("/system-update/deploy");
    expect(rewriteVersionedApiUrl({ url: "/v1/system-update/status" })).toBe("/system-update/status");
  });
});
