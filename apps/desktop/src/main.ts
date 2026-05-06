import { app, BrowserWindow, Menu } from "electron";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { registerIpcHandlers } from "./ipc";

loadEnvFromRoot();

function isPresent(value: string | undefined) {
  return value !== undefined && value !== "";
}

function urlHost(host: string | undefined) {
  return host === "0.0.0.0" || host === "::" ? "localhost" : (host ?? "localhost");
}

function runtimeProtocol() {
  return process.env.TLS_ENABLED === "true" ? "https" : "http";
}

function composeUrl(httpPortKey: string, httpsPortKey: string) {
  const scheme = runtimeProtocol();
  const port = scheme === "https" ? process.env[httpsPortKey] : process.env[httpPortKey];

  if (!isPresent(port)) {
    return undefined;
  }

  return `${scheme}://${urlHost(process.env.APP_HOST)}:${port}`;
}

process.env.PORT = process.env.PORT || process.env.APP_HTTP_PORT || process.env.APP_HTTPS_PORT;
process.env.FRONTEND_URL =
  process.env.FRONTEND_URL || composeUrl("FRONTEND_HTTP_PORT", "FRONTEND_HTTPS_PORT");
process.env.BACKEND_URL =
  process.env.BACKEND_URL ||
  (isPresent(process.env.PORT)
    ? `${runtimeProtocol()}://${urlHost(process.env.APP_HOST)}:${process.env.PORT}`
    : undefined);
process.env.BACKEND_HEALTH_URL =
  process.env.BACKEND_HEALTH_URL ||
  (process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/health` : undefined);

function requireEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function loadEnvFromRoot() {
  let currentDirectory = path.resolve(__dirname, "..", "..", "..");

  while (true) {
    const envPath = path.join(currentDirectory, ".env");

    if (existsSync(envPath)) {
      const parsedEnv = parseEnv(readFileSync(envPath, "utf8"));

      for (const [key, value] of Object.entries(parsedEnv)) {
        if (value !== undefined && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }

      return;
    }

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      return;
    }

    currentDirectory = parentDirectory;
  }
}

const frontendUrl = requireEnv("FRONTEND_URL");
const backendUrl = requireEnv("BACKEND_URL");
const backendHealthUrl = requireEnv("BACKEND_HEALTH_URL");
const readinessTimeoutMs = Number(requireEnv("DESKTOP_READY_TIMEOUT_MS"));

async function waitForUrl(url: string, timeoutMs: number): Promise<boolean> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // The dev server is still starting.
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }

  return false;
}

async function createWindow(): Promise<void> {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const [frontendReady, backendReady] = await Promise.all([
    waitForUrl(frontendUrl, readinessTimeoutMs),
    waitForUrl(backendHealthUrl, readinessTimeoutMs),
  ]);

  if (!frontendReady) {
    process.stderr.write(`Frontend was not ready at ${frontendUrl}; Electron will retry load.\n`);
  }

  if (!backendReady) {
    process.stderr.write(`Backend health check was not ready at ${backendHealthUrl}.\n`);
  }

  window.webContents.on("did-fail-load", () => {
    setTimeout(() => {
      void window.loadURL(frontendUrl);
    }, 1000);
  });

  await window.loadURL(frontendUrl);
}

void app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerIpcHandlers();
  void createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
