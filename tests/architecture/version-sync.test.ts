import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { describe, expect, it } from "vitest";

function runVersionSync(rootDir: string, reference: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve("scripts/version-sync.mjs");
    const child = spawn(process.execPath, [scriptPath, "--ref", reference], {
      cwd: rootDir,
      env: {
        ...process.env,
        CXNEXT_ROOT: rootDir,
      },
      stdio: "ignore",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`version sync exited with code ${code}`));
    });
  });
}

describe("version sync", () => {
  it("updates the root and workspace package versions from a reference", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "cxnext-version-sync-"));
    const packagePaths = [
      "package.json",
      "apps/server/package.json",
      "apps/frontend/package.json",
      "apps/desktop/package.json",
      "packages/core/package.json",
      "packages/event/package.json",
      "packages/db/package.json",
      "packages/validation/package.json",
      "packages/config/package.json",
      "packages/hooks/package.json",
      "packages/utils/package.json",
      "packages/types/package.json",
      "packages/ui/package.json",
    ];

    for (const relativePath of packagePaths) {
      const filePath = path.join(tempRoot, relativePath);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify({ name: relativePath, version: "1.0.0" }));
    }

    await runVersionSync(tempRoot, "172");

    const rootPackage = JSON.parse(await readFile(path.join(tempRoot, "package.json"), "utf8"));

    expect(rootPackage.version).toBe("1.0.172");
  });
});
