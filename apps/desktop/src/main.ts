import { app, BrowserWindow, Menu } from "electron";
import path from "node:path";
import { registerIpcHandlers } from "./ipc";

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
const backendHealthUrl = process.env.BACKEND_HEALTH_URL ?? `${backendUrl}/health`;
const readinessTimeoutMs = Number(process.env.DESKTOP_READY_TIMEOUT_MS ?? 30_000);

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
