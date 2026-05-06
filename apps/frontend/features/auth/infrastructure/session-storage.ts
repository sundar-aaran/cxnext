import type { AuthSession } from "../domain/auth";
import type { ApplicationContext } from "../../application-context/domain/application-context";

const authSessionStorageKey = "cxnext.auth.session";
const authSessionCookieKey = "cxnext-auth";

export function readStoredAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(authSessionStorageKey);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    if (new Date(session.expiresAt) <= new Date()) {
      clearStoredAuthSession();
      return null;
    }
    return session;
  } catch {
    clearStoredAuthSession();
    return null;
  }
}

export function persistStoredAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session));
  persistSessionCookie(session.expiresAt);
}

export function persistStoredApplicationContext(context: ApplicationContext) {
  const session = readStoredAuthSession();
  if (!session) return null;

  const nextSession = { ...session, context };
  persistStoredAuthSession(nextSession);
  return nextSession;
}

export function readStoredApplicationContext() {
  return readStoredAuthSession()?.context ?? null;
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(authSessionStorageKey);
  clearSessionCookie();
}

export function getStoredAccessToken() {
  return readStoredAuthSession()?.accessToken ?? null;
}

function persistSessionCookie(expiresAt: string) {
  document.cookie = `${authSessionCookieKey}=1; Path=/; Expires=${new Date(expiresAt).toUTCString()}; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${authSessionCookieKey}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
