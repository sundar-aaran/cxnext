import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

import { databaseEnvSchema, type DatabaseEnv } from "./database";

const databaseEnvKeys = [
  "DATABASE_HOST",
  "DATABASE_PORT",
  "DATABASE_USER",
  "DATABASE_PASSWORD",
  "DATABASE_NAME",
] as const;

const fallbackCredentialKeys = ["DATABASE_USER", "DATABASE_PASSWORD", "DATABASE_NAME"] as const;

const databaseEnvAliases: Record<DatabaseEnvKey, string> = {
  DATABASE_HOST: "DB_HOST",
  DATABASE_PORT: "DB_PORT",
  DATABASE_USER: "DB_USER",
  DATABASE_PASSWORD: "DB_PASSWORD",
  DATABASE_NAME: "DB_NAME",
};

export type DatabaseEnvKey = (typeof databaseEnvKeys)[number];

export interface LoadedDatabaseEnv {
  readonly cwd: string;
  readonly env: DatabaseEnv;
  readonly envFilePath: string | null;
  readonly explicitKeys: readonly DatabaseEnvKey[];
  readonly fallbackKeys: readonly DatabaseEnvKey[];
}

export function findNearestEnvFile(startDirectory = process.cwd()): string | null {
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

function loadEnvFileValues(envFilePath: string): Record<string, string> {
  const parsedEnv = parseEnv(readFileSync(envFilePath, "utf8"));

  return Object.fromEntries(
    Object.entries(parsedEnv).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

export function loadDatabaseEnv(options?: {
  readonly cwd?: string;
  readonly source?: NodeJS.ProcessEnv;
}): LoadedDatabaseEnv {
  const cwd = path.resolve(options?.cwd ?? process.cwd());
  const source = options?.source ?? process.env;
  const envFilePath = findNearestEnvFile(cwd);
  const envFileValues = envFilePath ? loadEnvFileValues(envFilePath) : {};
  const mergedSource = normalizeDatabaseEnvAliases({
    ...envFileValues,
    ...source,
  });

  const explicitKeys = databaseEnvKeys.filter((key) =>
    Object.prototype.hasOwnProperty.call(mergedSource, key),
  );
  const fallbackKeys = databaseEnvKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(mergedSource, key),
  );

  return {
    cwd,
    env: databaseEnvSchema.parse(mergedSource),
    envFilePath,
    explicitKeys,
    fallbackKeys,
  };
}

export function usesFallbackDatabaseCredentials(envState: LoadedDatabaseEnv): boolean {
  return fallbackCredentialKeys.some((key) => envState.fallbackKeys.includes(key));
}

function normalizeDatabaseEnvAliases(source: Record<string, string | undefined>) {
  const normalizedSource = { ...source };

  for (const [databaseKey, aliasKey] of Object.entries(databaseEnvAliases) as Array<
    [DatabaseEnvKey, string]
  >) {
    if (normalizedSource[databaseKey] === undefined && normalizedSource[aliasKey] !== undefined) {
      normalizedSource[databaseKey] = normalizedSource[aliasKey];
    }
  }

  return normalizedSource;
}
