"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freshApplicationDatabase = freshApplicationDatabase;
const kysely_1 = require("kysely");
const runner_1 = require("./runner");
function escapeMysqlIdentifier(value) {
    return `\`${value.replace(/`/g, "``")}\``;
}
async function listDatabaseObjects(database, options) {
    const tableType = options.kind === "view" ? "VIEW" : "BASE TABLE";
    const result = await (0, kysely_1.sql) `
    select table_name as name
    from information_schema.tables
    where table_schema = ${options.databaseName}
      and table_type = ${tableType}
    order by table_name asc
  `.execute(database);
    return result.rows.map((row) => String(row.name));
}
async function dropDatabaseObjects(database, options) {
    const objectNames = await listDatabaseObjects(database, options);
    const keyword = options.kind === "view" ? "view" : "table";
    for (const objectName of objectNames) {
        options.logger?.info(`Dropping ${options.kind} ${objectName} from ${options.databaseName}`);
        await kysely_1.sql
            .raw(`drop ${keyword} if exists ${escapeMysqlIdentifier(objectName)}`)
            .execute(database);
    }
    return objectNames.length;
}
async function resetApplicationDatabase(database, options) {
    const databaseName = options.databaseName.trim();
    if (!databaseName) {
        throw new Error("DATABASE_NAME is required for db:refresh.");
    }
    options.logger?.info(`Refreshing database ${databaseName}`);
    await kysely_1.sql.raw("set foreign_key_checks = 0").execute(database);
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
    }
    finally {
        await kysely_1.sql.raw("set foreign_key_checks = 1").execute(database);
    }
}
async function freshApplicationDatabase(database, options) {
    const dropped = await resetApplicationDatabase(database, options);
    const prepared = await (0, runner_1.prepareApplicationDatabase)(database, {
        logger: options.logger,
    });
    return {
        dropped,
        migrations: prepared.migrations,
        seeders: prepared.seeders,
    };
}
//# sourceMappingURL=fresh.js.map