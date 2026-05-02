import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

function findNearestEnvFile(startDirectory = process.cwd()): string | null {
  let currentDirectory = path.resolve(startDirectory);

  while (true) {
    const envFilePath = path.join(currentDirectory, ".env");

    if (existsSync(envFilePath)) {
      return envFilePath;
    }

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      return null;
    }

    currentDirectory = parentDirectory;
  }
}

const envFilePath = findNearestEnvFile();

if (envFilePath) {
  const parsedEnv = parseEnv(readFileSync(envFilePath, "utf8"));

  for (const [key, value] of Object.entries(parsedEnv)) {
    if (value !== undefined && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
