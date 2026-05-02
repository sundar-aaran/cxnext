import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseEnv } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

loadEnvFile(path.join(root, ".env"));

function requireEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) {
    return;
  }

  const parsedEnv = parseEnv(readFileSync(envPath, "utf8"));

  for (const [key, value] of Object.entries(parsedEnv)) {
    if (value !== undefined && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const frontendUrl = requireEnv("FRONTEND_URL");
const backendUrl = requireEnv("BACKEND_URL");
const backendHealthUrl = requireEnv("BACKEND_HEALTH_URL");

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

async function runPreflight() {
  const preflightScript = path.join(root, "scripts", "preflight.mjs");
  const child = spawn(process.execPath, [preflightScript], {
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
      PORT: requireEnv("PORT"),
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

await runPreflight();
await releasePorts();
runTurbo();
