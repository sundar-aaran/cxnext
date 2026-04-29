import type { Kysely } from "kysely";

import { databaseEnvSchema, createDatabaseConnection } from "./database";
import { freshApplicationDatabase } from "./process/fresh";
import {
  listRegisteredDatabaseMigrations,
  listRegisteredDatabaseSeeders,
} from "./process/registry";
import {
  prepareApplicationDatabase,
  runDatabaseMigrations,
  runDatabaseSeeders,
} from "./process/runner";

type DatabaseCommand = "fresh" | "migrate" | "prepare" | "refresh" | "seed" | "status";

function resolveCommand(value: string | undefined): DatabaseCommand | null {
  switch (value) {
    case undefined:
    case "prepare":
      return "prepare";
    case "migrate":
    case "fresh":
    case "refresh":
    case "seed":
    case "status":
      return value;
    default:
      return null;
  }
}

function printUsage() {
  console.info(
    "Usage: node packages/db/dist/cli.js [prepare|migrate|seed|status|refresh|fresh] [--yes]",
  );
}

function hasRefreshConfirmation(args: readonly string[]) {
  return args.includes("--yes");
}

export async function runDatabaseCli(args = process.argv.slice(2)) {
  const command = resolveCommand(args[0]);
  const extraArgs = args.slice(1);

  if (!command) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (command === "status") {
    console.info(`Registered migrations: ${listRegisteredDatabaseMigrations().length}`);
    console.info(`Registered seeders: ${listRegisteredDatabaseSeeders().length}`);
    return;
  }

  if ((command === "fresh" || command === "refresh") && !hasRefreshConfirmation(extraArgs)) {
    console.error("Refusing db:refresh without confirmation. Re-run with --yes.");
    process.exitCode = 1;
    return;
  }

  const env = databaseEnvSchema.parse(process.env);
  const connection = createDatabaseConnection(env);
  const database = connection.db as unknown as Kysely<unknown>;

  try {
    if (command === "migrate") {
      const result = await runDatabaseMigrations(database, { logger: console });
      console.info(
        `Migrations applied: ${result.applied.length}, skipped: ${result.skipped.length}`,
      );
      return;
    }

    if (command === "seed") {
      const migrationResult = await runDatabaseMigrations(database, { logger: console });
      const result = await runDatabaseSeeders(database, { logger: console });
      console.info(
        `Seeders applied: ${result.applied.length}, skipped: ${result.skipped.length}. Migrations applied first: ${migrationResult.applied.length}`,
      );
      return;
    }

    if (command === "fresh" || command === "refresh") {
      const result = await freshApplicationDatabase(database, {
        databaseName: env.DATABASE_NAME,
        logger: console,
      });
      console.info(
        `Database refreshed. Dropped tables: ${result.dropped.tables}, dropped views: ${result.dropped.views}, migrations applied: ${result.migrations.applied.length}, seeders applied: ${result.seeders.applied.length}`,
      );
      return;
    }

    const result = await prepareApplicationDatabase(database, { logger: console });
    console.info(
      `Database prepared. Migrations applied: ${result.migrations.applied.length}, seeders applied: ${result.seeders.applied.length}`,
    );
  } finally {
    await connection.destroy();
  }
}

if (process.argv[1]?.endsWith("cli.js")) {
  void runDatabaseCli();
}
