import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { GetTenantUseCase } from "../../application/use-cases/get-tenant.use-case";
import { ListTenantsUseCase } from "../../application/use-cases/list-tenants.use-case";
import { TENANT_REPOSITORY, type TenantRepository } from "../../application/services/tenant.repository";
import { toTenantResponse } from "./tenant-response";

interface TenantUpsertRequest {
  readonly name?: unknown;
  readonly slug?: unknown;
  readonly isActive?: unknown;
}

@Controller("tenants")
export class TenantsController {
  public constructor(
    @Inject(ListTenantsUseCase)
    private readonly listTenantsUseCase: ListTenantsUseCase,
    @Inject(GetTenantUseCase)
    private readonly getTenantUseCase: GetTenantUseCase,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
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

  @Post()
  public async create(@Body() body: TenantUpsertRequest) {
    const tenant = await this.tenantRepository.create(parseTenantRequest(body));
    return toTenantResponse(tenant);
  }

  @Patch(":tenantId")
  public async update(@Param("tenantId") tenantId: string, @Body() body: TenantUpsertRequest) {
    const tenant = await this.tenantRepository.update(tenantId, parseTenantRequest(body));

    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantId}" was not found.`);
    }

    return toTenantResponse(tenant);
  }

  @Delete(":tenantId")
  public async softDelete(@Param("tenantId") tenantId: string) {
    const wasDeleted = await this.tenantRepository.softDelete(tenantId);

    if (!wasDeleted) {
      throw new NotFoundException(`Tenant "${tenantId}" was not found.`);
    }

    return { deleted: true };
  }
}

function parseTenantRequest(body: TenantUpsertRequest) {
  return {
    name: typeof body.name === "string" ? body.name : "",
    slug: typeof body.slug === "string" ? body.slug : "",
    isActive: Boolean(body.isActive),
  };
}
