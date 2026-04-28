import { Kysely, MysqlDialect } from "kysely";
import { createPool, type PoolOptions } from "mysql2/promise";
import { z } from "zod";

export type DatabaseSchema = Record<string, never>;

export const databaseEnvSchema = z.object({
  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.coerce.number().int().positive().default(3306),
  DATABASE_USER: z.string().default("cxnext"),
  DATABASE_PASSWORD: z.string().default("cxnext"),
  DATABASE_NAME: z.string().default("cxnext"),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export interface DatabaseConnection {
  readonly db: Kysely<DatabaseSchema>;
  destroy(): Promise<void>;
}

export function createDatabaseConnection(env: DatabaseEnv): DatabaseConnection {
  const poolOptions: PoolOptions = {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    connectionLimit: 10,
  };

  const db = new Kysely<DatabaseSchema>({
    dialect: new MysqlDialect({
      pool: createPool(poolOptions),
    }),
  });

  return {
    db,
    destroy: () => db.destroy(),
  };
}
