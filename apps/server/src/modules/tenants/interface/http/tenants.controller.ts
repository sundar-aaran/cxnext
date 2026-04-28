import { Controller, Get, Inject, NotFoundException, Param } from "@nestjs/common";
import { GetTenantUseCase } from "../../application/use-cases/get-tenant.use-case";
import { ListTenantsUseCase } from "../../application/use-cases/list-tenants.use-case";
import { toTenantResponse } from "./tenant-response";

@Controller("tenants")
export class TenantsController {
  public constructor(
    @Inject(ListTenantsUseCase)
    private readonly listTenantsUseCase: ListTenantsUseCase,
    @Inject(GetTenantUseCase)
    private readonly getTenantUseCase: GetTenantUseCase,
  ) {}

  @Get()
  public async list() {
    const tenants = await this.listTenantsUseCase.execute();
    return tenants.map((tenant) => toTenantResponse(tenant));
  }

  @Get(":tenantId")
  public async getById(@Param("tenantId") tenantId: string) {
    const tenant = await this.getTenantUseCase.execute(tenantId);

    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantId}" was not found.`);
    }

    return toTenantResponse(tenant);
  }
}
