import type { TenantAggregate } from "../../domain/aggregates/tenant.aggregate";

export interface TenantRepository {
  list(): Promise<readonly TenantAggregate[]>;
  getById(tenantId: string): Promise<TenantAggregate | null>;
}

export const TENANT_REPOSITORY = Symbol("TENANT_REPOSITORY");
