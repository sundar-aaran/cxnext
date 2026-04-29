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
import { INDUSTRY_REPOSITORY, type IndustryRepository } from "../../application/services/industry.repository";
import { GetIndustryUseCase } from "../../application/use-cases/get-industry.use-case";
import { ListIndustriesUseCase } from "../../application/use-cases/list-industries.use-case";
import { toIndustryResponse } from "./industry-response";

interface IndustryUpsertRequest {
  readonly name?: unknown;
  readonly isActive?: unknown;
}

@Controller("industries")
export class IndustriesController {
  public constructor(
    @Inject(ListIndustriesUseCase)
    private readonly listIndustriesUseCase: ListIndustriesUseCase,
    @Inject(GetIndustryUseCase)
    private readonly getIndustryUseCase: GetIndustryUseCase,
    @Inject(INDUSTRY_REPOSITORY)
    private readonly industryRepository: IndustryRepository,
  ) {}

  @Get()
  public async list() {
    const industries = await this.listIndustriesUseCase.execute();
    return industries.map((industry) => toIndustryResponse(industry));
  }

  @Get(":industryId")
  public async getById(@Param("industryId") industryId: string) {
    const industry = await this.getIndustryUseCase.execute(industryId);

    if (!industry) {
      throw new NotFoundException(`Industry "${industryId}" was not found.`);
    }

    return toIndustryResponse(industry);
  }

  @Post()
  public async create(@Body() body: IndustryUpsertRequest) {
    const industry = await this.industryRepository.create(parseIndustryRequest(body));
    return toIndustryResponse(industry);
  }

  @Patch(":industryId")
  public async update(@Param("industryId") industryId: string, @Body() body: IndustryUpsertRequest) {
    const industry = await this.industryRepository.update(industryId, parseIndustryRequest(body));

    if (!industry) {
      throw new NotFoundException(`Industry "${industryId}" was not found.`);
    }

    return toIndustryResponse(industry);
  }

  @Delete(":industryId")
  public async softDelete(@Param("industryId") industryId: string) {
    const wasDeleted = await this.industryRepository.softDelete(industryId);

    if (!wasDeleted) {
      throw new NotFoundException(`Industry "${industryId}" was not found.`);
    }

    return { deleted: true };
  }
}

function parseIndustryRequest(body: IndustryUpsertRequest) {
  return {
    name: typeof body.name === "string" ? body.name : "",
    isActive: Boolean(body.isActive),
  };
}
