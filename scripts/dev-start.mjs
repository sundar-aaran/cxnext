import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
const backendHealthUrl = process.env.BACKEND_HEALTH_URL ?? "http://localhost:4000/health";

function resolvePnpmInvocation() {
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath?.toLowerCase().includes("pnpm")) {
    return {
      command: process.execPath,
      args: [npmExecPath, "run", "dev:turbo"],
      shell: false,
    };
  }

  return {
    command: pnpmCommand,
    args: ["run", "dev:turbo"],
    shell: process.platform === "win32",
  };
}

async function releasePorts() {
  const stopScript = path.join(root, "scripts", "dev-stop.mjs");
  const child = spawn(process.execPath, [stopScript], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
  });

  const code = await new Promise((resolve) => {
    child.once("exit", resolve);
  });

  if (code !== 0) {
    process.exit(Number(code ?? 1));
  }
}

function runTurbo() {
  const pnpm = resolvePnpmInvocation();

  process.stdout.write(
    [
      "",
      `cxnext frontend listening on ${frontendUrl}`,
      `cxnext server listening on ${backendUrl}`,
      `cxnext server health on ${backendHealthUrl}`,
      "",
    ].join("\n"),
  );

  const child = spawn(pnpm.command, pnpm.args, {
    cwd: root,
    stdio: "inherit",
    shell: pnpm.shell,
    windowsHide: true,
    env: {
      ...process.env,
      FRONTEND_URL: frontendUrl,
      BACKEND_URL: backendUrl,
      BACKEND_HEALTH_URL: backendHealthUrl,
      PORT: process.env.PORT ?? "4000",
    },
  });

  const stop = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.once("SIGINT", () => stop("SIGINT"));
  process.once("SIGTERM", () => stop("SIGTERM"));

  child.once("exit", (code) => {
    process.exit(Number(code ?? 0));
  });
}

await releasePorts();
runTurbo();
