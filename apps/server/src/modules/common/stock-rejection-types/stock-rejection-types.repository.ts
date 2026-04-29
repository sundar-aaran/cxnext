import { Injectable, NotFoundException, type OnModuleDestroy } from "@nestjs/common";
import { createDatabaseConnection, loadDatabaseEnv, type DatabaseConnection } from "@cxnext/db";
import { parseValue, toCamelCase, toDate, type CommonMasterColumn } from "../shared/common-master-utils";

const tableName = "common_stock_rejection_types";
const sortColumn = "name";
const columns = [
  { key: "code", type: "string" },
  { key: "name", type: "string" },
  { key: "description", type: "string" },
] as const satisfies readonly CommonMasterColumn[];

type Row = Record<string, unknown> & { readonly id: number; readonly is_active: boolean | number; readonly created_at: Date | string; readonly updated_at: Date | string; readonly deleted_at: Date | string | null };

@Injectable()
export class StockRejectionTypesRepository implements OnModuleDestroy {
  private readonly connection: DatabaseConnection;

  public constructor() {
    this.connection = createDatabaseConnection(loadDatabaseEnv().env);
  }

  public async onModuleDestroy(): Promise<void> {
    await this.connection.destroy();
  }

  public async list() {
    const rows = await this.db().selectFrom(tableName).selectAll().where("deleted_at", "is", null).orderBy(sortColumn, "asc").execute();
    return (rows as Row[]).map(toRecord);
  }

  public async get(id: number) {
    const row = await this.db().selectFrom(tableName).selectAll().where("id", "=", id).where("deleted_at", "is", null).executeTakeFirst();
    if (!row) throw new NotFoundException("StockRejectionTypes record " + id + " was not found.");
    return toRecord(row as Row);
  }

  public async create(body: Record<string, unknown>) {
    const now = new Date();
    const [result] = await this.db().insertInto(tableName).values({ ...toPayload(body), is_active: body.isActive === undefined ? true : Boolean(body.isActive), created_at: now, updated_at: now, deleted_at: null }).execute();
    return this.get(Number(result.insertId));
  }

  public async update(id: number, body: Record<string, unknown>) {
    await this.db().updateTable(tableName).set({ ...toPayload(body), is_active: body.isActive === undefined ? true : Boolean(body.isActive), updated_at: new Date() }).where("id", "=", id).where("deleted_at", "is", null).executeTakeFirst();
    return this.get(id);
  }

  public async drop(id: number) {
    const result = await this.db().updateTable(tableName).set({ deleted_at: new Date(), updated_at: new Date() }).where("id", "=", id).where("deleted_at", "is", null).executeTakeFirst();
    if (Number(result.numUpdatedRows) === 0) throw new NotFoundException("StockRejectionTypes record " + id + " was not found.");
    return { deleted: true, force: false };
  }

  public async forceDelete(id: number) {
    const result = await this.db().deleteFrom(tableName).where("id", "=", id).executeTakeFirst();
    if (Number(result.numDeletedRows) === 0) throw new NotFoundException("StockRejectionTypes record " + id + " was not found.");
    return { deleted: true, force: true };
  }

  private db() {
    return this.connection.db as unknown as { selectFrom(tableName: string): any; insertInto(tableName: string): any; updateTable(tableName: string): any; deleteFrom(tableName: string): any };
  }
}

function toPayload(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const column of columns) payload[column.key] = parseValue(column, body);
  return payload;
}

function toRecord(row: Row) {
  const record: Record<string, unknown> = { id: Number(row.id), isActive: Boolean(row.is_active), createdAt: toDate(row.created_at), updatedAt: toDate(row.updated_at), deletedAt: row.deleted_at ? toDate(row.deleted_at) : null };
  for (const column of columns) record[toCamelCase(column.key)] = row[column.key] ?? null;
  return record;
}
