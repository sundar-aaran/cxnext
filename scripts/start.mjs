import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseEnv } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const includeDesktop = process.argv.includes("--desktop");

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

function pnpmInvocation(args) {
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath?.toLowerCase().includes("pnpm")) {
    return {
      command: process.execPath,
      args: [npmExecPath, ...args],
      shell: false,
    };
  }

  return {
    command: process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    args,
    shell: process.platform === "win32",
  };
}

function spawnPnpm(args, name) {
  const pnpm = pnpmInvocation(args);
  const child = spawn(pnpm.command, pnpm.args, {
    cwd: root,
    stdio: "inherit",
    shell: pnpm.shell,
    windowsHide: true,
    env: {
      ...process.env,
      FRONTEND_URL: requireEnv("FRONTEND_URL"),
      BACKEND_URL: requireEnv("BACKEND_URL"),
      BACKEND_HEALTH_URL: requireEnv("BACKEND_HEALTH_URL"),
      PORT: requireEnv("PORT"),
    },
  });

  child.once("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
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

function stopChildren(children) {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

await runPreflight();
await releasePorts();

const children = [
  spawnPnpm(["--filter", "@cxnext/server", "start"], "server"),
  spawnPnpm(["--filter", "@cxnext/frontend", "start"], "frontend"),
];

if (includeDesktop) {
  children.push(spawnPnpm(["--filter", "@cxnext/desktop", "start"], "desktop"));
}

process.once("SIGINT", () => stopChildren(children));
process.once("SIGTERM", () => stopChildren(children));
