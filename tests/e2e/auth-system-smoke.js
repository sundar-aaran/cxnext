const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

async function main() {
  const { chromium } = require(resolvePlaywrightPath());
  const baseUrl = "http://localhost:3000";
  const apiUrl = "http://127.0.0.1:4000/api/v1";
  const loginName = process.env.API_E2E_LOGIN || "sundar";
  const loginPassword = process.env.API_E2E_PASSWORD || "Admin@1234";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = [];

  try {
    await waitForHttp(`${baseUrl}/login`);
    await waitForHttp("http://127.0.0.1:4000/health");

    await assertLoggedOutRedirect(page, `${baseUrl}/desk/sales`, `${baseUrl}/login?next=%2Fdesk%2Fsales`, results, "unauthenticated sales route");

    await login(page, baseUrl, { login: loginName, password: loginPassword });
    results.push({ name: "login with username", status: "passed", detail: page.url() });

    const session = await readStoredSession(page);
    if (!session?.accessToken) {
      throw new Error("No access token was stored in localStorage after login.");
    }

    await page.goto(`${baseUrl}/desk/admin/users`, { waitUntil: "networkidle" });
    await expectUrl(page, /\/desk\/admin\/users$/);
    results.push({ name: "admin users route after login", status: "passed", detail: page.url() });

    await page.goto(`${baseUrl}/desk/sales`, { waitUntil: "networkidle" });
    await expectUrl(page, /\/desk\/sales$/);
    results.push({ name: "sales route after login", status: "passed", detail: page.url() });

    await assertApiStatus(`${apiUrl}/auth/me`, session.accessToken, 200, results, "auth me before logout");
    await assertCookiePresent(context, "cxnext-auth", true, results, "auth cookie after login");

    await page.getByRole("button", { name: "Logout" }).click();
    await expectUrl(page, /\/login$/);
    results.push({ name: "header logout redirect", status: "passed", detail: page.url() });

    await assertApiStatus(`${apiUrl}/auth/me`, session.accessToken, 401, results, "auth me after header logout");
    await assertCookiePresent(context, "cxnext-auth", false, results, "auth cookie cleared after header logout");
    await assertLoggedOutRedirect(page, `${baseUrl}/desk/sales`, `${baseUrl}/login?next=%2Fdesk%2Fsales`, results, "sales route after header logout");

    await login(page, baseUrl, { login: loginName, password: loginPassword });
    results.push({ name: "login with email", status: "passed", detail: page.url() });

    const secondSession = await readStoredSession(page);
    if (!secondSession?.accessToken) {
      throw new Error("No access token was stored in localStorage after email login.");
    }

    await openUserMenu(page, secondSession.user.displayName, secondSession.user.email);
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expectUrl(page, /\/login$/);
    results.push({ name: "side menu logout redirect", status: "passed", detail: page.url() });

    await assertApiStatus(`${apiUrl}/auth/me`, secondSession.accessToken, 401, results, "auth me after side menu logout");
    await assertCookiePresent(context, "cxnext-auth", false, results, "auth cookie cleared after side menu logout");
    await assertLoggedOutRedirect(
      page,
      `${baseUrl}/desk/admin/users/new`,
      `${baseUrl}/login?next=%2Fdesk%2Fadmin%2Fusers%2Fnew`,
      results,
      "admin new user route after side menu logout",
    );

    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          results,
          error: String(error?.stack || error),
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
}

function resolvePlaywrightPath() {
  const root = path.join(os.homedir(), "AppData", "Local", "npm-cache", "_npx");
  const candidates = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name, "node_modules", "playwright"))
    .filter((candidate) => fs.existsSync(path.join(candidate, "index.js")))
    .sort((left, right) => {
      const leftTime = fs.statSync(left).mtimeMs;
      const rightTime = fs.statSync(right).mtimeMs;
      return rightTime - leftTime;
    });

  if (!candidates[0]) {
    throw new Error("Playwright package was not found in the local npm cache.");
  }

  return candidates[0];
}

async function waitForHttp(url, timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {}

    await delay(2000);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function login(page, baseUrl, credentials) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Username or email").fill(credentials.login);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expectUrl(page, /\/desk(\/.*)?$/);
}

async function openUserMenu(page, displayName, email) {
  const trigger = page
    .locator("button")
    .filter({ hasText: displayName })
    .filter({ hasText: email });
  const count = await trigger.count();

  if (count !== 1) {
    throw new Error(`Expected one user menu trigger, found ${count}.`);
  }

  await trigger.click();
}

async function assertLoggedOutRedirect(page, targetUrl, expectedUrl, results, label) {
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  if (page.url() !== expectedUrl) {
    throw new Error(`Expected ${label} to redirect to ${expectedUrl}, received ${page.url()}.`);
  }
  results.push({ name: label, status: "passed", detail: page.url() });
}

async function assertApiStatus(url, token, expectedStatus, results, label) {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${label} to return ${expectedStatus}, received ${response.status}.`);
  }

  results.push({ name: label, status: "passed", detail: String(response.status) });
}

async function assertCookiePresent(context, name, expectedPresent, results, label) {
  const cookies = await context.cookies();
  const found = cookies.some((cookie) => cookie.name === name);

  if (found !== expectedPresent) {
    throw new Error(`Expected cookie ${name} present=${expectedPresent}, received ${found}.`);
  }

  results.push({ name: label, status: "passed", detail: found ? "present" : "cleared" });
}

async function readStoredSession(page) {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem("cxnext.auth.session");
    return raw ? JSON.parse(raw) : null;
  });
}

async function expectUrl(page, pattern, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (pattern.test(page.url())) {
      return;
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for URL ${pattern}, current URL is ${page.url()}.`);
}

function delay(timeoutMs) {
  return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}

void main();
