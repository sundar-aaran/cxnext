import { sql, type Kysely } from "kysely";

import { prepareApplicationDatabase } from "./runner";
import type { DatabaseFreshResult, DatabaseProcessLogger } from "./types";

type DatabaseObjectKind = "table" | "view";

interface NamedDatabaseObjectRow {
  readonly name: string;
}

function escapeMysqlIdentifier(value: string) {
  return `\`${value.replace(/`/g, "``")}\``;
}

async function listDatabaseObjects(
  database: Kysely<unknown>,
  options: {
    readonly databaseName: string;
    readonly kind: DatabaseObjectKind;
  },
) {
  const tableType = options.kind === "view" ? "VIEW" : "BASE TABLE";
  const result = await sql<NamedDatabaseObjectRow>`
    select table_name as name
    from information_schema.tables
    where table_schema = ${options.databaseName}
      and table_type = ${tableType}
    order by table_name asc
  `.execute(database);

  return result.rows.map((row) => String(row.name));
}

async function dropDatabaseObjects(
  database: Kysely<unknown>,
  options: {
    readonly databaseName: string;
    readonly kind: DatabaseObjectKind;
    readonly logger?: DatabaseProcessLogger;
  },
) {
  const objectNames = await listDatabaseObjects(database, options);
  const keyword = options.kind === "view" ? "view" : "table";

  for (const objectName of objectNames) {
    options.logger?.info(`Dropping ${options.kind} ${objectName} from ${options.databaseName}`);
    await sql
      .raw(`drop ${keyword} if exists ${escapeMysqlIdentifier(objectName)}`)
      .execute(database);
  }

  return objectNames.length;
}

async function resetApplicationDatabase(
  database: Kysely<unknown>,
  options: {
    readonly databaseName: string;
    readonly logger?: DatabaseProcessLogger;
  },
) {
  const databaseName = options.databaseName.trim();

  if (!databaseName) {
    throw new Error("DATABASE_NAME is required for db:refresh.");
  }

  options.logger?.info(`Refreshing database ${databaseName}`);
  await sql.raw("set foreign_key_checks = 0").execute(database);

  try {
    const droppedViews = await dropDatabaseObjects(database, {
      databaseName,
      kind: "view",
      logger: options.logger,
    });
    const droppedTables = await dropDatabaseObjects(database, {
      databaseName,
      kind: "table",
      logger: options.logger,
    });

    return {
      views: droppedViews,
      tables: droppedTables,
    };
  } finally {
    await sql.raw("set foreign_key_checks = 1").execute(database);
  }
}

export async function freshApplicationDatabase(
  database: Kysely<unknown>,
  options: {
    readonly databaseName: string;
    readonly logger?: DatabaseProcessLogger;
  },
): Promise<DatabaseFreshResult> {
  const dropped = await resetApplicationDatabase(database, options);
  const prepared = await prepareApplicationDatabase(database, {
    logger: options.logger,
  });

  return {
    dropped,
    migrations: prepared.migrations,
    seeders: prepared.seeders,
  };
}
