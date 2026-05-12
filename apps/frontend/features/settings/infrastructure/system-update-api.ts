import { getRequiredPublicApiUrl } from "@/lib/runtime-env";
import { authFetch } from "../../auth/infrastructure/auth-api";

export type SystemUpdateAction = "build" | "deploy" | "preflight" | "restart" | "smoke" | "sync";

export interface SystemUpdateResponse {
  readonly action?: string;
  readonly command?: string;
  readonly deployDir?: string;
  readonly exitCode?: number;
  readonly gitBranch?: string;
  readonly gitUrl?: string;
  readonly message?: string;
  readonly preflight?: {
    readonly ok?: boolean;
    readonly problems?: readonly string[];
  };
  readonly status: string;
  readonly stderr?: string;
  readonly stdout?: string;
  readonly timestamp?: string;
  readonly [key: string]: unknown;
}

export async function getSystemUpdateStatus(options?: { readonly signal?: AbortSignal }) {
  const response = await authFetch(`${apiBaseUrl()}/system-update/status`, {
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, `System update status failed with status ${response.status}.`));
  }

  return (await response.json()) as SystemUpdateResponse;
}

export async function runSystemUpdateAction(action: SystemUpdateAction) {
  const response = await authFetch(`${apiBaseUrl()}/system-update/${action}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, `System update ${action} failed with status ${response.status}.`));
  }

  return (await response.json()) as SystemUpdateResponse;
}

function apiBaseUrl() {
  return getRequiredPublicApiUrl();
}

async function readApiErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { readonly message?: unknown; readonly error?: unknown };
    const message = Array.isArray(body.message) ? body.message[0] : body.message;

    if (typeof message === "string" && message.trim()) return message;
    if (typeof body.error === "string" && body.error.trim()) return body.error;
  } catch {
    // Some responses are not JSON.
  }

  return fallback;
}
