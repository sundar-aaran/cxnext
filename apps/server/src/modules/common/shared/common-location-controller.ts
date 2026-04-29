import { Body, Delete, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import type { CommonLocationModuleKey } from "./common-location-definition";
import { getCommonLocationDefinition } from "./common-location-definition";
import { CommonLocationRepository } from "./common-location.repository";
import type { CommonLocationUpsertParams } from "./common-location-record";

export interface CommonLocationUpsertRequest {
  readonly countryId?: unknown;
  readonly stateId?: unknown;
  readonly districtId?: unknown;
  readonly cityId?: unknown;
  readonly code?: unknown;
  readonly name?: unknown;
  readonly phoneCode?: unknown;
  readonly areaName?: unknown;
  readonly isActive?: unknown;
}

export abstract class CommonLocationControllerBase {
  protected constructor(
    protected readonly repository: CommonLocationRepository,
    private readonly moduleKey: CommonLocationModuleKey,
  ) {}

  protected listRecords() {
    return this.repository.list(this.moduleKey);
  }

  protected async getRecord(id: string) {
    const record = await this.repository.getById(this.moduleKey, id);
    if (!record) throw new NotFoundException(`${getCommonLocationDefinition(this.moduleKey).label} "${id}" was not found.`);
    return record;
  }

  @Post()
  public create(@Body() body: CommonLocationUpsertRequest) {
    return this.repository.create(this.moduleKey, parseCommonLocationRequest(body));
  }

  @Patch(":id")
  public async update(@Param("id") id: string, @Body() body: CommonLocationUpsertRequest) {
    const record = await this.repository.update(this.moduleKey, id, parseCommonLocationRequest(body));
    if (!record) throw new NotFoundException(`${getCommonLocationDefinition(this.moduleKey).label} "${id}" was not found.`);
    return record;
  }

  @Delete(":id")
  public async softDelete(@Param("id") id: string) {
    const wasDeleted = await this.repository.softDelete(this.moduleKey, id);
    if (!wasDeleted) throw new NotFoundException(`${getCommonLocationDefinition(this.moduleKey).label} "${id}" was not found.`);
    return { deleted: true };
  }
}

function parseCommonLocationRequest(body: CommonLocationUpsertRequest): CommonLocationUpsertParams {
  return {
    countryId: toNullableNumberValue(body.countryId),
    stateId: toNullableNumberValue(body.stateId),
    districtId: toNullableNumberValue(body.districtId),
    cityId: toNullableNumberValue(body.cityId),
    code: toStringValue(body.code),
    name: toNullableStringValue(body.name),
    phoneCode: toNullableStringValue(body.phoneCode),
    areaName: toNullableStringValue(body.areaName),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableStringValue(value: unknown) {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function toNullableNumberValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}
