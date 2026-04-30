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
import { CreateCompanyUseCase } from "../../application/use-cases/create-company.use-case";
import { DeleteCompanyUseCase } from "../../application/use-cases/delete-company.use-case";
import { GetCompanyUseCase } from "../../application/use-cases/get-company.use-case";
import { ListCompaniesUseCase } from "../../application/use-cases/list-companies.use-case";
import { UpdateCompanyUseCase } from "../../application/use-cases/update-company.use-case";
import { toCompanyResponse } from "./company-response";

interface CompanyUpsertRequest {
  readonly tenantId?: unknown;
  readonly industryId?: unknown;
  readonly name?: unknown;
  readonly legalName?: unknown;
  readonly tagline?: unknown;
  readonly shortAbout?: unknown;
  readonly registrationNumber?: unknown;
  readonly pan?: unknown;
  readonly financialYearStart?: unknown;
  readonly booksStart?: unknown;
  readonly website?: unknown;
  readonly description?: unknown;
  readonly primaryEmail?: unknown;
  readonly primaryPhone?: unknown;
  readonly isPrimary?: unknown;
  readonly isActive?: unknown;
}

@Controller("companies")
export class CompaniesController {
  public constructor(
    @Inject(ListCompaniesUseCase)
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
    @Inject(GetCompanyUseCase)
    private readonly getCompanyUseCase: GetCompanyUseCase,
    @Inject(CreateCompanyUseCase)
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    @Inject(UpdateCompanyUseCase)
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    @Inject(DeleteCompanyUseCase)
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
  ) {}

  @Get()
  public async list() {
    const companies = await this.listCompaniesUseCase.execute();
    return companies.map((company) => toCompanyResponse(company));
  }

  @Get(":companyId")
  public async getById(@Param("companyId") companyId: string) {
    const company = await this.getCompanyUseCase.execute(companyId);

    if (!company) {
      throw new NotFoundException(`Company "${companyId}" was not found.`);
    }

    return toCompanyResponse(company);
  }

  @Post()
  public async create(@Body() body: CompanyUpsertRequest) {
    const company = await this.createCompanyUseCase.execute(parseCompanyRequest(body));
    return toCompanyResponse(company);
  }

  @Patch(":companyId")
  public async update(@Param("companyId") companyId: string, @Body() body: CompanyUpsertRequest) {
    const company = await this.updateCompanyUseCase.execute(companyId, parseCompanyRequest(body));

    if (!company) {
      throw new NotFoundException(`Company "${companyId}" was not found.`);
    }

    return toCompanyResponse(company);
  }

  @Delete(":companyId")
  public async softDelete(@Param("companyId") companyId: string) {
    const wasDeleted = await this.deleteCompanyUseCase.execute(companyId);

    if (!wasDeleted) {
      throw new NotFoundException(`Company "${companyId}" was not found.`);
    }

    return { deleted: true };
  }
}

function parseCompanyRequest(body: CompanyUpsertRequest) {
  return {
    tenantId: Number(body.tenantId),
    industryId: Number(body.industryId),
    name: typeof body.name === "string" ? body.name : "",
    legalName: typeof body.legalName === "string" ? body.legalName : null,
    tagline: typeof body.tagline === "string" ? body.tagline : null,
    shortAbout: typeof body.shortAbout === "string" ? body.shortAbout : null,
    registrationNumber:
      typeof body.registrationNumber === "string" ? body.registrationNumber : null,
    pan: typeof body.pan === "string" ? body.pan : null,
    financialYearStart:
      typeof body.financialYearStart === "string" ? body.financialYearStart : null,
    booksStart: typeof body.booksStart === "string" ? body.booksStart : null,
    website: typeof body.website === "string" ? body.website : null,
    description: typeof body.description === "string" ? body.description : null,
    primaryEmail: typeof body.primaryEmail === "string" ? body.primaryEmail : null,
    primaryPhone: typeof body.primaryPhone === "string" ? body.primaryPhone : null,
    isPrimary: Boolean(body.isPrimary),
    isActive: Boolean(body.isActive),
  };
}
