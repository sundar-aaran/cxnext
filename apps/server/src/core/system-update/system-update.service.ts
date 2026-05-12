import { Injectable } from "@nestjs/common";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

type SystemUpdateAction = "build" | "deploy" | "preflight" | "restart" | "smoke" | "status" | "sync";

@Injectable()
export class SystemUpdateService {
  private readonly rootDirectory = findWorkspaceRoot(process.cwd());

  public status() {
    return this.run("status", 120_000);
  }

  public preflight() {
    return this.run("preflight", 120_000);
  }

  public sync() {
    return this.runWritableAction("sync", 180_000);
  }

  public build() {
    return this.runWritableAction("build", 900_000);
  }

  public restart() {
    return this.runWritableAction("restart", 180_000);
  }

  public smoke() {
    return this.runWritableAction("smoke", 180_000);
  }

  public deploy() {
    return this.runWritableAction("deploy", 1_200_000);
  }

  private runWritableAction(action: SystemUpdateAction, timeoutMs: number) {
    if (process.env.SYSTEM_UPDATE_ENABLED !== "true") {
      return Promise.resolve({
        action,
        status: "disabled",
        message: "System update is disabled. Set SYSTEM_UPDATE_ENABLED=true to allow update actions.",
        timestamp: new Date().toISOString(),
      });
    }

    return this.run(action, timeoutMs);
  }

  private run(action: SystemUpdateAction, timeoutMs: number) {
    const scriptPath = path.join(this.rootDirectory, "scripts", "system-update.mjs");

    return new Promise<Record<string, unknown>>((resolve) => {
      const child = spawn(process.execPath, [scriptPath, action, "--json"], {
        cwd: this.rootDirectory,
        env: process.env,
        shell: false,
        windowsHide: true,
      });
      let stdout = "";
      let stderr = "";
      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
      }, timeoutMs);

      child.stdout.on("data", (chunk) => {
        stdout += String(chunk);
      });
      child.stderr.on("data", (chunk) => {
        stderr += String(chunk);
      });
      child.once("error", (error) => {
        clearTimeout(timeout);
        resolve({
          action,
          status: "failed",
          message: error.message,
          stderr,
          timestamp: new Date().toISOString(),
        });
      });
      child.once("exit", (code) => {
        clearTimeout(timeout);
        const parsed = parseJsonOutput(stdout);
        resolve({
          action,
          exitCode: Number(code ?? 0),
          stderr: stderr.trim(),
          stdout: stdout.trim(),
          ...(parsed ?? {
            status: code === 0 ? "ok" : "failed",
            message: stderr.trim() || stdout.trim() || `System update action ${action} completed.`,
            timestamp: new Date().toISOString(),
          }),
        });
      });
    });
  }
}

function parseJsonOutput(value: string) {
  try {
    const startIndex = value.indexOf("{");
    if (startIndex === -1) return null;
    return JSON.parse(value.slice(startIndex)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function findWorkspaceRoot(startDirectory: string) {
  let current = path.resolve(startDirectory);

  while (true) {
    if (existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) return path.resolve(startDirectory);
    current = parent;
  }
}
