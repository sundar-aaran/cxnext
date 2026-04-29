import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { createDatabaseConnection, loadDatabaseEnv, type DatabaseConnection } from "@cxnext/db";
import type { CompanyReferenceNameLookup } from "../../application/services/company-reference-lookup";

@Injectable()
export class KyselyIndustryNameLookup implements CompanyReferenceNameLookup, OnModuleDestroy {
  private readonly connection: DatabaseConnection;

  public constructor() {
    this.connection = createDatabaseConnection(loadDatabaseEnv().env);
  }

  public async onModuleDestroy(): Promise<void> {
    await this.connection.destroy();
  }

  public async findNamesByIds(ids: readonly number[]): Promise<ReadonlyMap<number, string>> {
    const uniqueIds = [...new Set(ids)].filter((id) => Number.isInteger(id));

    if (uniqueIds.length === 0) {
      return new Map();
    }

    const rows = await this.connection.db
      .selectFrom("industries")
      .select(["id", "name"])
      .where("id", "in", uniqueIds)
      .execute();

    return new Map(rows.map((row) => [Number(row.id), row.name]));
  }
}
