import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const includeDesktop = process.argv.includes("--desktop");

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
      FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
      BACKEND_URL: process.env.BACKEND_URL ?? "http://localhost:4000",
      BACKEND_HEALTH_URL: process.env.BACKEND_HEALTH_URL ?? "http://localhost:4000/health",
      PORT: process.env.PORT ?? "4000",
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

function stopChildren(children) {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

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
