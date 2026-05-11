import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(process.env.DEPLOY_DIR || scriptRoot);
const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const command = args.find((arg) => !arg.startsWith("--")) ?? "status";
let suppressStepOutput = false;
const envPath = path.join(root, ".env");
const sampleEnvPath = path.join(root, ".env.sample");
const requiredKeys = [
  "APP_ENV",
  "APP_HOST",
  "APP_HTTP_PORT",
  "FRONTEND_HTTP_PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
  "GIT_URL",
  "GIT_BRANCH",
  "DEPLOY_DIR",
  "COMPOSE_FILE",
];

const defaults = {
  APP_ENV: "production",
  APP_HOST: "0.0.0.0",
  APP_HTTP_PORT: "4000",
  FRONTEND_HTTP_PORT: "3000",
  APP_PUBLIC_PORT: "4000",
  FRONTEND_PUBLIC_PORT: "3000",
  DB_DRIVER: "mariadb",
  DB_HOST: "mariadb",
  DB_PORT: "3306",
  DB_NAME: "cxnext_db",
  DB_USER: "root",
  DB_PASSWORD: "DbPass1@@",
  DB_SSL: "false",
  JWT_SECRET: "replace-with-a-long-random-production-secret",
  GIT_URL: "https://github.com/sundar-aaran/cxnext.git",
  GIT_BRANCH: "main",
  DEPLOY_DIR: root,
  COMPOSE_FILE: ".container/docker-compose.yml",
  SYSTEM_UPDATE_ENABLED: "true",
};

function output(status, data = {}) {
  const payload = {
    command,
    envPath,
    status,
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (suppressStepOutput) {
    return payload;
  }

  if (jsonMode) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else {
    process.stdout.write(`${payload.status}: ${payload.message ?? command}\n`);
  }

  return payload;
}

function fail(message, detail) {
  suppressStepOutput = false;
  output("failed", { detail, message });
  process.exit(1);
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return new Map();
  return new Map(Object.entries(parseEnv(readFileSync(filePath, "utf8"))).filter((entry) => entry[1] !== undefined));
}

function readCurrentEnv() {
  return new Map([...Object.entries(defaults), ...readEnvFile(envPath), ...Object.entries(process.env)]);
}

function setupStatus() {
  const values = readCurrentEnv();
  const fileValues = readEnvFile(envPath);
  const missing = requiredKeys.filter((key) => !String(values.get(key) ?? "").trim());
  const placeholderSecrets = ["JWT_SECRET"].filter((key) =>
    String(values.get(key) ?? "").includes("replace-with"),
  );

  return {
    configured: existsSync(envPath) && missing.length === 0 && placeholderSecrets.length === 0,
    envExists: existsSync(envPath),
    missing,
    placeholderSecrets,
    values: Object.fromEntries(
      requiredKeys.map((key) => [key, key.includes("PASSWORD") || key.includes("SECRET") ? mask(values.get(key)) : values.get(key) ?? ""]),
    ),
    writtenKeys: [...fileValues.keys()],
  };
}

function mask(value) {
  const text = String(value ?? "");
  if (!text) return "";
  if (text.length <= 4) return "****";
  return `${text.slice(0, 2)}****${text.slice(-2)}`;
}

function parseSetArgs() {
  const values = new Map();
  for (const arg of args) {
    if (!arg.startsWith("--set=")) continue;
    const pair = arg.slice("--set=".length);
    const index = pair.indexOf("=");
    if (index <= 0) continue;
    values.set(pair.slice(0, index), pair.slice(index + 1));
  }
  return values;
}

function quoteEnvValue(value) {
  const text = String(value ?? "");
  return /[\s"#']/.test(text) ? JSON.stringify(text) : text;
}

function writeEnvValues(nextValues) {
  const baseText = existsSync(envPath)
    ? readFileSync(envPath, "utf8")
    : existsSync(sampleEnvPath)
      ? readFileSync(sampleEnvPath, "utf8")
      : "";
  const written = new Set();
  const lines = baseText.split(/\r?\n/).map((line) => {
    const match = line.match(/^(\s*)([A-Z0-9_]+)(\s*=\s*)(.*)$/);
    const key = match?.[2];
    if (!key || !nextValues.has(key)) return line;
    written.add(key);
    return `${match?.[1] ?? ""}${key}${match?.[3] ?? "="}${quoteEnvValue(nextValues.get(key))}`;
  });
  const missing = [...nextValues.entries()].filter(([key]) => !written.has(key));
  if (missing.length > 0) {
    if (lines.length > 0 && lines.at(-1)?.trim()) lines.push("");
    lines.push("# Added from cxnext setup");
    for (const [key, value] of missing) {
      lines.push(`${key}=${quoteEnvValue(value)}`);
    }
  }
  writeFileSync(envPath, `${lines.join("\n").replace(/\n*$/, "")}\n`, "utf8");
}

function configure() {
  const input = parseSetArgs();
  const values = new Map([...Object.entries(defaults), ...readEnvFile(envPath), ...input]);
  writeEnvValues(values);
  return output("ok", {
    message: ".env configured.",
    setup: setupStatus(),
  });
}

function run(commandName, commandArgs, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(commandName, commandArgs, {
      cwd: options.cwd ?? root,
      env: { ...process.env, ...Object.fromEntries(readEnvFile(envPath)) },
      shell: process.platform === "win32",
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
      if (!jsonMode) process.stdout.write(String(chunk));
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
      if (!jsonMode) process.stderr.write(String(chunk));
    });
    child.once("error", (error) => resolve({ code: 1, stderr: error.message, stdout }));
    child.once("exit", (code) => resolve({ code: Number(code ?? 0), stderr, stdout }));
  });
}

async function runStep(name, commandName, commandArgs) {
  const completed = await run(commandName, commandArgs);
  if (completed.code !== 0) fail(`${name} failed.`, completed.stderr || completed.stdout);
  return completed;
}

async function pullLatest() {
  const env = readCurrentEnv();
  const gitUrl = String(env.get("GIT_URL") ?? defaults.GIT_URL);
  const branch = String(env.get("GIT_BRANCH") ?? defaults.GIT_BRANCH);
  const deployDir = path.resolve(String(env.get("DEPLOY_DIR") ?? root));

  if (!existsSync(path.join(deployDir, ".git"))) {
    fail(`Deploy directory is not a git checkout: ${deployDir}`);
  }

  await runStep("Git fetch", "git", ["fetch", "origin", branch]);
  await runStep("Git pull", "git", ["pull", "--ff-only", gitUrl, branch]);
  return output("ok", { message: "Latest cxnext version downloaded.", deployDir, gitBranch: branch, gitUrl });
}

async function buildApp() {
  await runStep("Docker build", "docker", ["compose", "-f", ".container/docker-compose.yml", "build", "app"]);
  return output("ok", { message: "Application image built." });
}

async function startApp() {
  await runStep("Docker start", "docker", ["compose", "-f", ".container/docker-compose.yml", "up", "-d", "app"]);
  return output("ok", { message: "Application container started." });
}

async function prepareDatabase() {
  await runStep("Database prepare", "docker", ["compose", "-f", ".container/docker-compose.yml", "exec", "-T", "app", "pnpm", "db:prepare"]);
  return output("ok", { message: "Database prepared." });
}

switch (command) {
  case "status":
    output("ok", { setup: setupStatus() });
    break;
  case "configure":
    configure();
    break;
  case "pull":
    await pullLatest();
    break;
  case "build":
    await buildApp();
    break;
  case "start":
    await startApp();
    break;
  case "prepare-db":
    await prepareDatabase();
    break;
  case "deploy":
    suppressStepOutput = true;
    await pullLatest();
    await buildApp();
    await startApp();
    suppressStepOutput = false;
    output("ok", { message: "Application deployed." });
    break;
  default:
    fail(`Unknown setup command: ${command}`);
}
